import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit, Type } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { type BimModelEditorComponent } from 'src/app/modules/bimModelEditor/components/bimModelEditor.component';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { AppRoute } from 'src/app/shared/definitions/routes.definitions';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { UserManager } from 'src/app/shared/utils/user/userManager.utils';

/** Barra lateral de navegación: el botón de inicio, el panel de edición y, abajo, el usuario actual. */
@Component({
	selector: 'app-sidebar',
	imports: [
		CdkConnectedOverlay,
		CdkOverlayOrigin,
		MatButtonModule,
		MatListModule,
		MatMenuModule,
		MatTooltipModule,
		RouterLink,
		RouterLinkActive
	],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnDestroy, OnInit {
	//#region PUBLIC CONSTANTS

	/** Separación, en píxeles, entre el botón de edición y su panel. */
	public readonly EDITION_PANEL_GAP: number = 0;

	/** Milisegundos que se espera, tras mostrar la barra, para descargar el editor en segundo plano. */
	public readonly PRELOAD_DELAY: number = 1000;

	/** Ancho máximo del editor: ocupa toda la pantalla en móvil. */
	public readonly EDITOR_MAX_WIDTH: string = '100vw';

	/** Alto máximo del editor: ocupa toda la pantalla en móvil. */
	public readonly EDITOR_MAX_HEIGHT: string = '100dvh';

	//#region LANGUAGE TEXTS

	/** Texto del botón del panel de edición. */
	public readonly EDITION_TEXT: string = LanguageManager.GetText('SIDEBAR_EDITION');

	/** Aviso de que no se ha podido abrir el editor. */
	public readonly EDITOR_ERROR_TEXT: string = LanguageManager.GetText('SIDEBAR_EDITOR_ERROR');

	/** Texto del botón de inicio. */
	public readonly HOME_TEXT: string = LanguageManager.GetText('WEB_HOME');

	/** Nombre accesible del botón que despliega el menú en móvil. */
	public readonly MENU_TEXT: string = LanguageManager.GetText('SIDEBAR_MENU');

	/** Texto de la entrada de modelos. */
	public readonly MODELS_TEXT: string = LanguageManager.GetText('WEB_MODELS');

	/** Texto de la entrada de usuarios. */
	public readonly USERS_TEXT: string = LanguageManager.GetText('WEB_USERS');

	/** Texto de la entrada de visualizaciones. */
	public readonly VISUALIZATIONS_TEXT: string = LanguageManager.GetText('WEB_VISUALIZATIONS');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono del botón del panel de edición. */
	public EditionIcon: string = IconsUtils.GetUrl(IconName.EDIT);

	/** Dónde se coloca el panel de edición: a la derecha del botón que lo despliega, alineado por arriba. */
	public EditionPanelPositions: ConnectedPosition[] = [
		{ originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: this.EDITION_PANEL_GAP }
	];

	/** `true` si, en el menú móvil, las entradas de edición están desplegadas. */
	public IsEditionExpanded: boolean = false;

	/** `true` si el panel de edición está abierto (desde `md`). */
	public IsEditionPanelOpen: boolean = false;

	/** Icono del botón de inicio. */
	public HomeIcon: string = IconsUtils.GetUrl(IconName.HOME);

	/** Ruta a la que lleva el botón de inicio. */
	public HomeRoute: string = '/' + AppRoute.HOME;

	/** Icono del botón que despliega el menú en móvil. */
	public MenuIcon: string = IconsUtils.GetUrl(IconName.MENU);

	/** Icono del usuario. */
	public UserIcon: string = IconsUtils.GetUrl(IconName.USER);

	/** Nombre completo del usuario actual. */
	public UserName: string = UserManager.GetFullName();

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Servicio de diálogos de Angular Material. */
	private readonly _Dialog: MatDialog;

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	/** Temporizador de la descarga del editor en segundo plano. Es `null` si no hay ninguno pendiente. */
	private _PreloadTimeout: number | null = null;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dialog Servicio de diálogos de Angular Material.
	 * @param notification Avisa al usuario de los fallos.
	 */
	constructor(dialog: MatDialog, notification: NotificationService) {
		this._Dialog = dialog;
		this._Notification = notification;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		if (!CheckUtils.IsNull(this._PreloadTimeout)) {
			window.clearTimeout(this._PreloadTimeout);
			this._PreloadTimeout = null;
		} else {
			// No hay nada pendiente
		}
	}

	public ngOnInit(): void {
		// Con la barra ya en pantalla, se descarga el editor (ligero: el visor 3D va aparte) para que abra sin espera al pulsarlo
		this._PreloadTimeout = window.setTimeout((): void => {
			import('src/app/modules/bimModelEditor/components/bimModelEditor.component').catch((error: unknown): void => {
				console.warn(`Sidebar.ngOnInit() => no se ha podido precargar el editor: ${ErrorUtils.GetMessage(error)}`);
			});
		}, this.PRELOAD_DELAY);
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public async OnBimModelsClicked(): Promise<void> {
		this.IsEditionPanelOpen = false;

		try {
			// El editor no se descarga al arrancar la aplicación (aquí o, antes, en segundo plano): es ligero, y su visor 3D va aparte
			const editorClass: Type<BimModelEditorComponent> = await import(
				'src/app/modules/bimModelEditor/components/bimModelEditor.component'
			).then(
				(editorModule: { BimModelEditorComponent: Type<BimModelEditorComponent> }): Type<BimModelEditorComponent> =>
					editorModule.BimModelEditorComponent
			);

			// El botón del menú conserva el foco mientras el diálogo oculta la página a los lectores de pantalla: se le quita para que el foco pase al diálogo
			(document.activeElement as HTMLElement).blur();

			this._Dialog.open(editorClass, {
				ariaLabel: this.MODELS_TEXT,
				maxHeight: this.EDITOR_MAX_HEIGHT,
				maxWidth: this.EDITOR_MAX_WIDTH
			});
		} catch (error) {
			this._Notification.Send(this.EDITOR_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`Sidebar.OnBimModelsClicked() => ${ErrorUtils.GetMessage(error)}`);
		}
	}

	public OnEditionPanelClosed(): void {
		this.IsEditionPanelOpen = false;
	}

	public OnEditionPanelKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			this.IsEditionPanelOpen = false;
		} else {
			// Otra tecla: el panel sigue abierto
		}
	}

	public OnEditionPanelToggled(): void {
		this.IsEditionPanelOpen = !this.IsEditionPanelOpen;
	}

	public OnEditionToggleClicked(event: Event): void {
		// El menú se cierra al pulsar una entrada: aquí solo se despliega o pliega la sección
		event.stopPropagation();
		this.IsEditionExpanded = !this.IsEditionExpanded;
	}

	//#endregion SUBSCRIBERS
}
