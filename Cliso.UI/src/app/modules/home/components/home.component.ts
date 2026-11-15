import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { HomeCardComponent } from 'src/app/modules/home/components/card/card.component';
import { BimViewerPanelComponent } from 'src/app/shared/components/bimViewerPanel/bimViewerPanel.component';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { ConfirmDialogType } from 'src/app/shared/definitions/dialogs.definitions';
import { BimModelDto } from 'src/app/shared/definitions/dtos.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { BimViewerConfiguration } from 'src/app/shared/models/bimViewer/bimViewerConfiguration.models';
import { BimViewerStyle } from 'src/app/shared/models/bimViewer/bimViewerStyle.models';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { ConfirmDialogService } from 'src/app/shared/services/confirmDialog.service';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ApplicationSettingsManager } from 'src/app/shared/utils/applicationSettings/applicationSettingsManager.utils';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { LocalStorageManager } from 'src/app/shared/utils/localStorage/localStorageManager.utils';
import { BimModelMapper } from 'src/app/shared/utils/mappers/bimModelMapper.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';

/** Pantalla principal de la aplicación: el buscador de modelos y visualizaciones. */
@Component({
	selector: 'app-home',
	imports: [
		BimViewerPanelComponent,
		HomeCardComponent,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressBarModule
	],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy, OnInit {
	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Botón para volver del modelo abierto a la lista. */
	public readonly BACK_TEXT: string = LanguageManager.GetText('WEB_BACK_TO_LIST');

	/** Texto mientras se cargan los modelos. */
	public readonly LOADING_TEXT: string = LanguageManager.GetText('WEB_LOADING');

	/** Texto de ayuda del buscador. */
	public readonly SEARCH_PLACEHOLDER: string = LanguageManager.GetText('HOME_SEARCH_PLACEHOLDER');

	/** Título de la pantalla, oculto visualmente. */
	public readonly TITLE: string = LanguageManager.GetText('WEB_HOME');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Aviso de que no se han podido cargar los modelos. */
	private readonly _LOAD_ERROR_TEXT: string = LanguageManager.GetText('WEB_BIM_MODELS_LOAD_ERROR');

	/** Aviso de que el modelo elegido no tiene fichero IFC. */
	private readonly _NO_FILE_TEXT: string = LanguageManager.GetText('HOME_NO_FILE');

	/** Mensaje cuando no hay ningún modelo. */
	private readonly _NO_MODELS_TEXT: string = LanguageManager.GetText('WEB_NO_MODELS');

	/** Mensaje cuando el buscador no encuentra ningún modelo. */
	private readonly _NO_RESULTS_TEXT: string = LanguageManager.GetText('HOME_NO_RESULTS');

	/** Pregunta de confirmación antes de abrir un modelo, con su nombre en `{0}`. */
	private readonly _OPEN_CONFIRM_TEXT: string = LanguageManager.GetText('HOME_OPEN_CONFIRM');

	/** Cada cuántos milisegundos se comprueba si hay modelos nuevos. */
	private readonly _REFRESH_INTERVAL: number = ApplicationSettingsManager.GetBimModelsRefreshInterval();

	/** Pregunta de si se recupera la sesión anterior (modelo abierto y aspecto del visor). */
	private readonly _RESTORE_CONFIRM_TEXT: string = LanguageManager.GetText('HOME_RESTORE_CONFIRM');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono del botón de volver. */
	public BackIcon: string = IconsUtils.GetUrl(IconName.ARROW_BACK);

	/** Mensaje que se muestra cuando no hay fichas que enseñar. */
	public EmptyText: string = STRING_UNDEFINED;

	/** `true` mientras se cargan los modelos. */
	public IsLoading: boolean = true;

	/** Icono del buscador. */
	public SearchIcon: string = IconsUtils.GetUrl(IconName.SEARCH);

	/** Configuración con la que se abre el visor: aspecto y vistas de la cámara. */
	public SelectedConfiguration: BimViewerConfiguration = new BimViewerConfiguration(ID_NUMERIC_UNDEFINED);

	/** Modelo abierto en el visor. */
	public SelectedModel: BimModel = new BimModel(
		ID_NUMERIC_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		0
	);

	/** `true` si hay que avisar de que no hay fichas que enseñar. */
	public ShowEmpty: boolean = false;

	/** `true` si se muestra el modelo abierto en lugar de la lista. */
	public ShowViewer: boolean = false;

	/** Modelos BIM que coinciden con el buscador. */
	public VisibleModels: BimModel[] = [];

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Corta las peticiones pendientes al cerrar la pantalla. */
	private readonly _Canceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Hace preguntas al usuario. */
	private readonly _Confirm: ConfirmDialogService;

	/** Acceso al API. */
	private readonly _DataAccess: DataAccessService;

	/** `true` mientras hay una comprobación de modelos nuevos en curso. */
	private _IsRefreshing: boolean = false;

	/** Todos los modelos BIM disponibles. */
	private _Models: BimModel[] = [];

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	/** Temporizador de la comprobación periódica de modelos nuevos. Es `null` si no está en marcha. */
	private _RefreshTimer: number | null = null;

	/** Texto del buscador, en minúsculas. */
	private _SearchText: string = STRING_UNDEFINED;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param confirm Hace preguntas al usuario.
	 * @param dataAccess Acceso al API.
	 * @param notification Avisa al usuario de los fallos.
	 */
	constructor(confirm: ConfirmDialogService, dataAccess: DataAccessService, notification: NotificationService) {
		this._Confirm = confirm;
		this._DataAccess = dataAccess;
		this._Notification = notification;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		if (!CheckUtils.IsNull(this._RefreshTimer)) {
			window.clearInterval(this._RefreshTimer);
			this._RefreshTimer = null;
		} else {
			// El temporizador no llegó a ponerse en marcha
		}

		// Salir de Home por la aplicación no es recargar la página: la sesión solo se recupera tras una recarga
		LocalStorageManager.ClearLastBimModelConfiguration();
		this._Canceller.Destroy();
	}

	public ngOnInit(): void {
		this.loadModels();
		this._RefreshTimer = window.setInterval((): void => {
			this.refreshModels();
		}, this._REFRESH_INTERVAL);
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnBackClicked(): void {
		this.ShowViewer = false;
		LocalStorageManager.ClearLastBimModelConfiguration();
		// El refresco estuvo en pausa mientras el visor estaba abierto: se actualiza la lista al volver
		this.refreshModels();
	}

	public OnConfigurationChanged(configuration: BimViewerConfiguration): void {
		LocalStorageManager.SetLastBimModelConfiguration(configuration);
	}

	public async OnModelSelected(model: BimModel): Promise<void> {
		if (model.FileName === STRING_UNDEFINED) {
			this._Notification.Send(this._NO_FILE_TEXT, NotificationLevel.WARNING);
		} else if (await this._Confirm.Show(StringUtils.Format(this._OPEN_CONFIRM_TEXT, [model.Name]), ConfirmDialogType.QUESTION)) {
			// Un modelo abierto desde la lista arranca con el resaltado de piezas activado, a diferencia del aspecto por defecto
			const style: BimViewerStyle = new BimViewerStyle();

			style.HighlightEnabled = true;
			this.openModel(model, new BimViewerConfiguration(model.Id, style));
		} else {
			// El usuario cancela: no hay nada que hacer
		}
	}

	public OnSearchChanged(text: string): void {
		this._SearchText = text.trim().toLowerCase();
		this.refreshList();
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Indica si los modelos recuperados difieren de los que ya se tienen.
	 * @param models Modelos recién recuperados del API.
	 * @returns `true` si hay modelos añadidos, quitados o modificados (sin importar el orden en que lleguen).
	 */
	private hasChanged(models: BimModel[]): boolean {
		let result: boolean = models.length !== this._Models.length;

		for (let index: number = 0; !result && index < models.length; index++) {
			const known: BimModel | undefined = this._Models.find((item: BimModel): boolean => item.Id === models[index].Id);

			result = CheckUtils.IsUndefined(known) || !known.Equals(models[index]);
		}

		return result;
	}

	/** Recupera los modelos BIM disponibles y, si se recargó la página con un modelo abierto, ofrece volver a él. */
	private async loadModels(): Promise<void> {
		let isLoaded: boolean = false;

		try {
			const result: TryGetResult<BimModelDto[]> = await RequestUtils.AwaitRequest(
				this._DataAccess.BimModels.GetAll(),
				this._Canceller
			);

			if (result.Success) {
				this._Models = (result.Result as BimModelDto[]).map((dto: BimModelDto): BimModel => BimModelMapper.ToModel(dto));
				isLoaded = true;
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._LOAD_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`HomeComponent.loadModels() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.IsLoading = false;
			this.refreshList();
		}

		if (isLoaded) {
			await this.restoreSession();
		} else {
			// Sin modelos no se puede recuperar nada, y lo guardado se conserva para el próximo intento
		}
	}

	/**
	 * Abre un modelo en el visor y guarda su configuración por si se recarga la página.
	 * @param model Modelo que se abre.
	 * @param configuration Configuración con la que arranca el visor.
	 */
	private openModel(model: BimModel, configuration: BimViewerConfiguration): void {
		this.SelectedModel = model;
		this.SelectedConfiguration = configuration;
		this.ShowViewer = true;
		LocalStorageManager.SetLastBimModelConfiguration(configuration);
	}

	/** Deja calculado lo que la plantilla necesita: las fichas que coinciden con el buscador y el mensaje si no hay ninguna. */
	private refreshList(): void {
		this.VisibleModels = this._Models.filter(
			(model: BimModel): boolean =>
				model.Name.toLowerCase().includes(this._SearchText) || model.Description.toLowerCase().includes(this._SearchText)
		);
		this.ShowEmpty = !this.IsLoading && this.VisibleModels.length === 0;
		this.EmptyText = this._Models.length === 0 ? this._NO_MODELS_TEXT : this._NO_RESULTS_TEXT;
	}

	/** Comprueba si hay modelos nuevos o cambiados (por ejemplo, de otro usuario u otra sesión) y, si es así, actualiza la lista. */
	private async refreshModels(): Promise<void> {
		if (!this.IsLoading && !this._IsRefreshing && !this.ShowViewer) {
			this._IsRefreshing = true;

			try {
				const result: TryGetResult<BimModelDto[]> = await RequestUtils.AwaitRequest(
					this._DataAccess.BimModels.GetAll(),
					this._Canceller
				);

				if (result.Success) {
					const models: BimModel[] = (result.Result as BimModelDto[]).map((dto: BimModelDto): BimModel =>
						BimModelMapper.ToModel(dto)
					);

					if (this.hasChanged(models)) {
						this._Models = models;
						this.refreshList();
					} else {
						// No hay cambios: la lista se queda como está
					}
				} else {
					// Petición cancelada: no hay nada que hacer
				}
			} catch (error) {
				// Sin aviso al usuario: un fallo puntual se repetiría en cada comprobación
				console.warn(`HomeComponent.refreshModels() => ${ErrorUtils.GetMessage(error)}`);
			} finally {
				this._IsRefreshing = false;
			}
		} else {
			// Aún está en curso la carga o la comprobación anterior, o el visor está abierto (en pausa)
		}
	}

	/** Si había un modelo abierto antes de recargar la página, pregunta si se recupera y, si se acepta, lo abre con su aspecto. */
	private async restoreSession(): Promise<void> {
		const last: BimViewerConfiguration | null = LocalStorageManager.GetLastBimModelConfiguration();

		if (CheckUtils.IsNull(last)) {
			// No hay sesión anterior: se muestra Home como siempre
		} else {
			const model: BimModel | undefined = this._Models.find((item: BimModel): boolean => item.Id === last.ModelId);

			if (CheckUtils.IsUndefined(model) || model.FileName === STRING_UNDEFINED) {
				// El modelo ya no existe o no tiene fichero: la sesión guardada no sirve
				LocalStorageManager.ClearLastBimModelConfiguration();
			} else if (await this._Confirm.Show(this._RESTORE_CONFIRM_TEXT, ConfirmDialogType.QUESTION)) {
				this.openModel(model, last);
			} else {
				LocalStorageManager.ClearLastBimModelConfiguration();
			}
		}
	}

	//#endregion PRIVATE METHODS
}
