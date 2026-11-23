import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';

import { BimViewerCompiledEvent, BimViewerComponent, BimViewerMarkerMovedEvent } from 'src/app/shared/components/bimViewer/bimViewer.component';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { BimViewerHit } from 'src/app/shared/models/bimViewer/bimViewerHit.models';
import { BimViewerMarker } from 'src/app/shared/models/bimViewer/bimViewerMarker.models';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';

/** Previsualización 3D de un modelo BIM: descarga su fichero IFC (con barra de progreso) y lo muestra en el visor. */
@Component({
	selector: 'app-bim-model-preview',
	imports: [BimViewerComponent],
	templateUrl: './bimModelPreview.component.html',
	styleUrl: './bimModelPreview.component.scss'
})
export class BimModelPreviewComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** Se emite cuando el visor está listo, con el acceso para operarlo. */
	@Output() public compiled: EventEmitter<BimViewerCompiledEvent> = new EventEmitter<BimViewerCompiledEvent>();

	/** Se emite al soltar un marcador tras arrastrarlo. */
	@Output() public markerMoved: EventEmitter<BimViewerMarkerMovedEvent> = new EventEmitter<BimViewerMarkerMovedEvent>();

	/** Se emite con el identificador de un marcador al pulsar sobre él. */
	@Output() public markerSelected: EventEmitter<number> = new EventEmitter<number>();

	/** Marcadores que se pintan sobre el modelo. */
	@Input() public Markers: BimViewerMarker[] = [];

	/** `true` si los marcadores se pueden arrastrar. */
	@Input() public MarkersDraggable: boolean = false;

	/** Modelo que se previsualiza. Con `null`, o sin fichero IFC, el visor queda vacío. */
	@Input() public Model: BimModel | null = null;

	/** Se emite con lo alcanzado en el modelo (punto del mundo y elemento) al hacer clic sobre él. */
	@Output() public pointClicked: EventEmitter<BimViewerHit> = new EventEmitter<BimViewerHit>();

	/** Identificador del marcador seleccionado, que se pinta destacado. Con `null` no hay ninguno. */
	@Input() public SelectedMarkerId: number | null = null;

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Texto mientras se carga el visor. */
	public readonly LOADING_TEXT: string = LanguageManager.GetText('WEB_LOADING');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Aviso de que no se ha podido descargar el modelo. */
	private readonly _DOWNLOAD_ERROR_TEXT: string = LanguageManager.GetText('BMP_DOWNLOAD_ERROR');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Contenido IFC del modelo. Es `null` mientras no se ha descargado. */
	public Content: Blob | null = null;

	/** Porcentaje de la descarga. `null` si no se está descargando. */
	public Progress: number | null = null;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Corta la descarga en curso al cambiar de modelo y al destruir el componente. */
	private readonly _Canceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Llamadas al API. */
	private readonly _DataAccess: DataAccessService;

	/** Identificador del modelo cuyo contenido se ha pedido. */
	private _LoadedModelId: number = ID_NUMERIC_UNDEFINED;

	/** Número de la última descarga pedida: una descarga anterior no toca el estado de la actual. */
	private _LoadId: number = 0;

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dataAccess Llamadas al API.
	 * @param notification Avisa al usuario de los fallos.
	 */
	constructor(dataAccess: DataAccessService, notification: NotificationService) {
		this._DataAccess = dataAccess;
		this._Notification = notification;
	}

	//#endregion CONSTRUCTOR

	//#region EMITTERS

	private emitCompiled(event: BimViewerCompiledEvent): void {
		this.compiled.emit(event);
	}

	private emitMarkerMoved(event: BimViewerMarkerMovedEvent): void {
		this.markerMoved.emit(event);
	}

	private emitMarkerSelected(markerId: number): void {
		this.markerSelected.emit(markerId);
	}

	private emitPointClicked(hit: BimViewerHit): void {
		this.pointClicked.emit(hit);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		const modelId: number = CheckUtils.IsNull(this.Model) ? ID_NUMERIC_UNDEFINED : this.Model.Id;

		if (modelId !== this._LoadedModelId) {
			this._LoadedModelId = modelId;
			this.loadContent();
		} else {
			// Es el mismo modelo: no hay que descargarlo otra vez
		}
	}

	public ngOnDestroy(): void {
		this._Canceller.Destroy();
		this.compiled.complete();
		this.markerMoved.complete();
		this.markerSelected.complete();
		this.pointClicked.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnCompiled(event: BimViewerCompiledEvent): void {
		this.emitCompiled(event);
	}

	public OnMarkerMoved(event: BimViewerMarkerMovedEvent): void {
		this.emitMarkerMoved(event);
	}

	public OnMarkerSelected(markerId: number): void {
		this.emitMarkerSelected(markerId);
	}

	public OnPointClicked(hit: BimViewerHit): void {
		this.emitPointClicked(hit);
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/** Descarga el contenido del modelo actual, si tiene fichero IFC; si no, deja el visor vacío. */
	private async loadContent(): Promise<void> {
		const model: BimModel | null = this.Model;
		const loadId: number = ++this._LoadId;

		// Lo que estuviera descargándose del modelo anterior ya no hace falta
		this._Canceller.Cancel();
		this.Content = null;
		this.Progress = null;

		if (!CheckUtils.IsNull(model) && model.FileName !== STRING_UNDEFINED) {
			this.Progress = 0;

			try {
				const result: TryGetResult<Blob> = await RequestUtils.AwaitRequestWithProgress(
					this._DataAccess.BimModels.GetContent(model.Id),
					this._Canceller,
					(percent: number): void => {
						if (loadId === this._LoadId) {
							this.Progress = percent;
						} else {
							// Ya se pidió la descarga de otro modelo
						}
					}
				);

				if (result.Success && loadId === this._LoadId) {
					this.Content = result.Result;
				} else {
					// Petición cancelada o sustituida por la de otro modelo: no hay nada que hacer
				}
			} catch (error) {
				this._Notification.Send(this._DOWNLOAD_ERROR_TEXT, NotificationLevel.DANGER);
				console.warn(`BimModelPreview.loadContent() => ${ErrorUtils.GetMessage(error)}`);
			} finally {
				// Una descarga anterior que termina tarde no apaga el progreso de la actual
				if (loadId === this._LoadId) {
					this.Progress = null;
				} else {
					// Sigue en curso la descarga posterior
				}
			}
		} else {
			// Sin modelo o sin fichero: no hay nada que descargar
		}
	}

	//#endregion PRIVATE METHODS
}
