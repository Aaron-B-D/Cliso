import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	NgZone,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
	BIM_VIEWER_BACKGROUND_CSS_VARIABLE,
	BIM_VIEWER_GRID_CSS_VARIABLE,
	BIM_VIEWER_MAX_PROGRESS,
	type BimViewerPoint,
	type BimViewerStyle
} from 'src/app/shared/definitions/bimViewer.definitions';
import { BimViewerManager } from 'src/app/shared/utils/bimViewer/bimViewerManager.utils';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Visor 3D de un modelo IFC: lo orbita y acerca, y avisa del punto del modelo en el que se hace clic. */
@Component({
	selector: 'app-bim-viewer',
	imports: [MatProgressBarModule],
	templateUrl: './bimViewer.component.html',
	styleUrl: './bimViewer.component.scss'
})
export class BimViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
	//#region DECORATORS

	/** Elemento donde el motor dibuja el modelo. */
	@ViewChild('container', { static: true }) private _Container!: ElementRef<HTMLDivElement>;

	/** Modelo IFC que se muestra. Con `null` el visor queda vacío. */
	@Input() public Content: Blob | null = null;

	/** Porcentaje de la descarga del modelo, de 0 a 100. Con `null` no hay ninguna descarga en curso. */
	@Input() public DownloadProgress: number | null = null;

	/** Se emite con el punto del modelo (en coordenadas del mundo) sobre el que se hace clic. */
	@Output() public pointClicked: EventEmitter<BimViewerPoint> = new EventEmitter<BimViewerPoint>();

	/** Aspecto del visor. Con `null` sale de los tokens de diseño (`--color-bg`, `--color-border`). */
	@Input() public Style: BimViewerStyle | null = null;

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Nombre accesible del lienzo del visor. */
	public readonly CANVAS_TEXT: string = LanguageManager.GetText('BV_CANVAS');

	/** Mensaje cuando no hay ningún modelo que mostrar. */
	public readonly EMPTY_TEXT: string = LanguageManager.GetText('BV_EMPTY');

	/** Mensaje cuando el modelo no se ha podido mostrar. */
	public readonly ERROR_TEXT: string = LanguageManager.GetText('BV_ERROR');

	/** Mensaje mientras se procesa el modelo ya descargado. */
	public readonly PROCESSING_TEXT: string = LanguageManager.GetText('BV_PROCESSING');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Mensaje mientras se descarga el modelo, con el porcentaje en `{0}`. */
	private readonly _DOWNLOADING_TEXT: string = LanguageManager.GetText('BV_DOWNLOADING');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Porcentaje de la descarga, listo para la barra de progreso. */
	public DownloadPercent: number = 0;

	/** Mensaje de la descarga con su porcentaje. */
	public DownloadText: string = '';

	/** `true` si no hay modelo ni nada en curso y hay que avisarlo. */
	public ShowEmpty: boolean = true;

	/** `true` si el modelo no se ha podido mostrar. */
	public ShowError: boolean = false;

	/** `true` mientras se descarga el modelo. */
	public ShowDownload: boolean = false;

	/** `true` mientras se procesa el modelo ya descargado. */
	public ShowProcessing: boolean = false;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** `true` si el modelo no se ha podido cargar. */
	private _HasError: boolean = false;

	/** `true` mientras se procesa el modelo ya descargado. */
	private _IsProcessing: boolean = false;

	/** `true` cuando el motor ya está listo para cargar modelos. */
	private _IsReady: boolean = false;

	/** Número de la última carga pedida: una carga anterior no toca el estado de la actual. */
	private _LoadId: number = 0;

	/** Motor 3D. */
	private readonly _Manager: BimViewerManager = new BimViewerManager();

	/** Zona de Angular, para dejar fuera el motor y volver a entrar al avisar de un clic. */
	private readonly _NgZone: NgZone;

	//#endregion PRIVATE PROPERTIES

	//#region EMITTERS

	private emitPointClicked(point: BimViewerPoint): void {
		this.pointClicked.emit(point);
	}

	//#endregion EMITTERS

	//#region CONSTRUCTOR

	constructor(ngZone: NgZone) {
		this._NgZone = ngZone;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngAfterViewInit(): void {
		this.initViewer();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (this._IsReady) {
			if (!CheckUtils.IsUndefined(changes['Style'])) {
				this._Manager.SetStyle(this.buildStyle());
			} else {
				// El aspecto no ha cambiado
			}

			if (!CheckUtils.IsUndefined(changes['Content'])) {
				this.loadContent();
			} else {
				// El modelo no ha cambiado
			}
		} else {
			// El motor aún no está listo: el modelo y el aspecto se aplicarán al terminar de inicializarlo
		}

		this.refreshState();
	}

	public ngOnDestroy(): void {
		this._Manager.OnPointClicked = null;
		this._Manager.Dispose();
		this.pointClicked.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region PRIVATE METHODS

	/** Devuelve el aspecto indicado o, si no hay, el que sale de los tokens de diseño. */
	private buildStyle(): BimViewerStyle {
		return CheckUtils.IsNull(this.Style) ? this.readStyleFromTokens() : this.Style;
	}

	/** Inicializa el motor 3D y carga el modelo, si ya lo hay. */
	private async initViewer(): Promise<void> {
		try {
			// El motor genera eventos continuos (render, cámara): se deja fuera de la zona para no provocar una detección de cambios por fotograma
			await this._NgZone.runOutsideAngular((): Promise<void> => this._Manager.Init(this._Container.nativeElement, this.buildStyle()));

			// El motor avisa desde fuera de la zona: se vuelve a entrar para que la pantalla se refresque
			this._Manager.OnPointClicked = (point: BimViewerPoint): void => {
				this._NgZone.run((): void => this.emitPointClicked(point));
			};
			this._IsReady = true;

			await this.loadContent();
		} catch (error) {
			this._HasError = true;
			console.warn(`BimViewerComponent.initViewer() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.refreshState();
		}
	}

	/** Carga en el motor el modelo actual, o lo vacía si no hay. */
	private async loadContent(): Promise<void> {
		const loadId: number = ++this._LoadId;

		this._HasError = false;

		if (CheckUtils.IsNull(this.Content)) {
			this._IsProcessing = false;
			await this._Manager.Clear();
		} else {
			this._IsProcessing = true;
			this.refreshState();

			try {
				await this._Manager.LoadContent(this.Content);
			} catch (error) {
				this._HasError = true;
				console.warn(`BimViewerComponent.loadContent() => ${ErrorUtils.GetMessage(error)}`);
			} finally {
				// Si ya se pidió otra carga, el estado es el de esa
				if (loadId === this._LoadId) {
					this._IsProcessing = false;
				} else {
					// Sigue en curso la carga posterior
				}
			}
		}

		this.refreshState();
	}

	/** Lee los colores del visor de los tokens de diseño. */
	private readStyleFromTokens(): BimViewerStyle {
		const computed: CSSStyleDeclaration = getComputedStyle(this._Container.nativeElement);

		return {
			BackgroundColor: computed.getPropertyValue(BIM_VIEWER_BACKGROUND_CSS_VARIABLE).trim(),
			GridColor: computed.getPropertyValue(BIM_VIEWER_GRID_CSS_VARIABLE).trim(),
			GridVisible: true
		};
	}

	/** Deja calculado lo que la plantilla necesita para saber qué mostrar. */
	private refreshState(): void {
		this.ShowDownload = !CheckUtils.IsNull(this.DownloadProgress);
		this.ShowProcessing = !this.ShowDownload && this._IsProcessing;
		this.ShowError = !this.ShowDownload && !this.ShowProcessing && this._HasError;
		this.ShowEmpty = !this.ShowDownload && !this.ShowProcessing && !this.ShowError && CheckUtils.IsNull(this.Content);

		if (CheckUtils.IsNull(this.DownloadProgress)) {
			this.DownloadPercent = 0;
		} else {
			this.DownloadPercent = Math.min(BIM_VIEWER_MAX_PROGRESS, Math.max(0, this.DownloadProgress));
		}

		this.DownloadText = this._DOWNLOADING_TEXT.replace('{0}', String(this.DownloadPercent));
	}

	//#endregion PRIVATE METHODS
}
