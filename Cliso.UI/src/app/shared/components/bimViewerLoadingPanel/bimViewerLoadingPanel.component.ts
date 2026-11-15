import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BIM_VIEWER_MAX_PROGRESS, BimViewerLoadingPanelState } from 'src/app/shared/definitions/bimViewer.definitions';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';

/** Panel que se muestra mientras se descarga el modelo: sus datos, el avance de la descarga y los botones de cancelar y reintentar. */
@Component({
	selector: 'app-bim-viewer-loading-panel',
	imports: [MatButtonModule, MatProgressBarModule],
	templateUrl: './bimViewerLoadingPanel.component.html',
	styleUrl: './bimViewerLoadingPanel.component.scss'
})
export class BimViewerLoadingPanelComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** Modelo que se está descargando. */
	@Input() public Model: BimModel = new BimModel(
		ID_NUMERIC_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		0
	);

	/** Porcentaje de la descarga, de 0 a 100. Con `null` aún no se conoce el avance. */
	@Input() public Progress: number | null = null;

	/** Estado de la descarga; determina qué se muestra. */
	@Input() public State: BimViewerLoadingPanelState = BimViewerLoadingPanelState.LOADING;

	/** Se emite cuando se pulsa el botón de cancelar la descarga. */
	@Output() public cancelClicked: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite cuando se pulsa el botón de reintentar la descarga. */
	@Output() public retryClicked: EventEmitter<void> = new EventEmitter<void>();

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Botón de cancelar la descarga. */
	public readonly CANCEL_TEXT: string = LanguageManager.GetText('WEB_CANCEL');

	/** Aviso de que la descarga se ha cancelado. */
	public readonly CANCELED_TEXT: string = LanguageManager.GetText('BVLP_CANCELED');

	/** Etiqueta de la descripción del modelo. */
	public readonly DESCRIPTION_TEXT: string = LanguageManager.GetText('WEB_DESCRIPTION');

	/** Aviso de que la descarga ha fallado. */
	public readonly ERROR_TEXT: string = LanguageManager.GetText('BVLP_ERROR');

	/** Título del bloque con los datos del modelo. */
	public readonly GENERAL_INFO_TEXT: string = LanguageManager.GetText('BVLP_GENERAL_INFO');

	/** Etiqueta del nombre del modelo. */
	public readonly NAME_TEXT: string = LanguageManager.GetText('WEB_NAME');

	/** Etiqueta de las observaciones del modelo. */
	public readonly OBSERVATIONS_TEXT: string = LanguageManager.GetText('WEB_OBSERVATIONS');

	/** Botón de reintentar la descarga. */
	public readonly RETRY_TEXT: string = LanguageManager.GetText('BVLP_RETRY');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Mensaje de la descarga cuando aún no se conoce el avance. */
	private readonly _DOWNLOADING_NO_PROGRESS_TEXT: string = LanguageManager.GetText('BVLP_DOWNLOADING_NO_PROGRESS');

	/** Mensaje de la descarga, con el porcentaje en `{0}`. */
	private readonly _DOWNLOADING_TEXT: string = LanguageManager.GetText('WEB_BIM_MODEL_DOWNLOADING');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** `true` si ya se conoce el avance: se muestra la barra de progreso en lugar del indicador de espera. */
	public HasProgress: boolean = false;

	/** Mensaje de la descarga ya con el avance aplicado. */
	public ProgressText: string = STRING_UNDEFINED;

	/** Porcentaje de la descarga, listo para la barra de progreso. */
	public ProgressValue: number = 0;

	/** `true` si la descarga se ha cancelado. */
	public ShowCanceled: boolean = false;

	/** `true` si la descarga ha fallado. */
	public ShowError: boolean = false;

	/** `true` mientras se descarga el modelo. */
	public ShowLoading: boolean = true;

	//#endregion PUBLIC PROPERTIES

	//#region EMITTERS

	private emitCancelClicked(): void {
		this.cancelClicked.emit();
	}

	private emitRetryClicked(): void {
		this.retryClicked.emit();
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		this.refreshState();
	}

	public ngOnDestroy(): void {
		this.cancelClicked.complete();
		this.retryClicked.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnCancelClicked(): void {
		this.emitCancelClicked();
	}

	public OnRetryClicked(): void {
		this.emitRetryClicked();
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/** Deja calculado lo que la plantilla necesita para saber qué mostrar. */
	private refreshState(): void {
		this.ShowCanceled = this.State === BimViewerLoadingPanelState.CANCELED;
		this.ShowError = this.State === BimViewerLoadingPanelState.LOAD_ERROR;
		this.ShowLoading = this.State === BimViewerLoadingPanelState.LOADING;
		this.HasProgress = !CheckUtils.IsNull(this.Progress);

		if (CheckUtils.IsNull(this.Progress)) {
			this.ProgressValue = 0;
			this.ProgressText = this._DOWNLOADING_NO_PROGRESS_TEXT;
		} else {
			this.ProgressValue = Math.min(BIM_VIEWER_MAX_PROGRESS, Math.max(0, this.Progress));
			this.ProgressText = StringUtils.Format(this._DOWNLOADING_TEXT, [String(this.ProgressValue)]);
		}
	}

	//#endregion PRIVATE METHODS
}
