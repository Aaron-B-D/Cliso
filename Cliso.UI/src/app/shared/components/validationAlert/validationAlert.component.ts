import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, Input, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';

/**
 * Botón de alerta con el número de errores de un formulario y el panel flotante que los lista. No se muestra nada si no
 * hay errores. Cada vez que llega una lista nueva con errores, el panel se abre solo; después se abre y se cierra con el botón.
 */
@Component({
	selector: 'app-validation-alert',
	imports: [CdkConnectedOverlay, CdkOverlayOrigin, MatButtonModule, MatTooltipModule],
	templateUrl: './validationAlert.component.html',
	styleUrl: './validationAlert.component.scss'
})
export class ValidationAlertComponent implements OnChanges {
	//#region DECORATORS

	/** Mensajes de los errores. Una lista nueva (aunque tenga los mismos mensajes) vuelve a abrir el panel; vacía, lo quita. */
	@Input() public Messages: string[] = [];

	//#endregion DECORATORS

	//#region PRIVATE CONSTANTS

	/** Separación, en píxeles, entre el botón y el panel. */
	private readonly _PANEL_GAP: number = 8;

	//#region LANGUAGE TEXTS

	/** Número de errores cuando son varios, con el número en `{0}`. */
	private readonly _COUNT_MANY_TEXT: string = LanguageManager.GetText('VA_COUNT_MANY');

	/** Número de errores cuando es uno solo. */
	private readonly _COUNT_ONE_TEXT: string = LanguageManager.GetText('VA_COUNT_ONE');

	/** Título del panel, con el número de errores en `{0}`. */
	private readonly _TITLE_TEXT: string = LanguageManager.GetText('VA_TITLE');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono del botón. */
	public AlertIcon: string = IconsUtils.GetUrl(IconName.WARNING);

	/** Número de errores como texto («3 errores»), para el tooltip y el nombre accesible del botón. */
	public CountText: string = STRING_UNDEFINED;

	/** `true` si hay algún error que mostrar. */
	public HasMessages: boolean = false;

	/** `true` si el panel está abierto. */
	public IsPanelOpen: boolean = false;

	/** Número de errores, para la insignia del botón. */
	public MessageCount: string = STRING_UNDEFINED;

	/** Sitios donde se abre el panel, por orden de preferencia: encima del botón y, si no cabe, debajo. */
	public PanelPositions: ConnectedPosition[] = [
		{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -this._PANEL_GAP },
		{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: this._PANEL_GAP }
	];

	/** Título del panel. */
	public TitleText: string = STRING_UNDEFINED;

	//#endregion PUBLIC PROPERTIES

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		this.HasMessages = this.Messages.length > 0;
		this.MessageCount = String(this.Messages.length);

		if (this.Messages.length === 1) {
			this.CountText = this._COUNT_ONE_TEXT;
		} else {
			this.CountText = StringUtils.Format(this._COUNT_MANY_TEXT, [this.MessageCount]);
		}

		this.TitleText = StringUtils.Format(this._TITLE_TEXT, [this.CountText]);
		// Una lista nueva con errores es un guardado que ha fallado: se muestra sin que el usuario tenga que pedirlo
		this.IsPanelOpen = this.HasMessages;
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnPanelClosed(): void {
		this.IsPanelOpen = false;
	}

	public OnPanelKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			this.IsPanelOpen = false;
		} else {
			// Otra tecla: el panel sigue abierto
		}
	}

	public OnPanelToggled(): void {
		this.IsPanelOpen = !this.IsPanelOpen;
	}

	//#endregion SUBSCRIBERS
}
