import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApplicationSettingsEditorLanguagePanelComponent } from 'src/app/modules/applicationSettingsEditor/components/languagePanel/languagePanel.component';
import { ApplicationSettingsEditorNumberPanelComponent } from 'src/app/modules/applicationSettingsEditor/components/numberPanel/numberPanel.component';
import { ApplicationSettingsEditorTextPanelComponent } from 'src/app/modules/applicationSettingsEditor/components/textPanel/textPanel.component';
import { EditorShellComponent } from 'src/app/shared/components/editorShell/editorShell.component';
import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { ConfirmDialogType } from 'src/app/shared/definitions/dialogs.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';
import { BimModelsRefreshIntervalSettingsParameter } from 'src/app/shared/models/applicationSettings/bimModelsRefreshIntervalSettingsParameter.models';
import { SessionTimeoutSettingsParameter } from 'src/app/shared/models/applicationSettings/sessionTimeoutSettingsParameter.models';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { ConfirmDialogService } from 'src/app/shared/services/confirmDialog.service';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';

/** Panel con el que se edita el valor de un parámetro: cada tipo de parámetro usa el que le corresponde. */
enum ApplicationSettingsPanel {
	LANGUAGE = 'LANGUAGE',
	NUMBER = 'NUMBER',
	TEXT = 'TEXT'
}

/** Ficha de un parámetro en la lista del editor, con lo que la plantilla necesita ya calculado. */
type ApplicationSettingsListItem = {
	IsSelected: boolean;
	Name: string;
	Parameter: ApplicationSettingsParameterBase;
	ValueText: string;
};

/** Editor de los parámetros de la aplicación: lista de parámetros y, para el elegido, el panel con el que se edita su valor. */
@Component({
	selector: 'app-application-settings-editor',
	imports: [
		ApplicationSettingsEditorLanguagePanelComponent,
		ApplicationSettingsEditorNumberPanelComponent,
		ApplicationSettingsEditorTextPanelComponent,
		EditorShellComponent,
		MatButtonModule,
		MatProgressBarModule,
		MatTooltipModule
	],
	templateUrl: './applicationSettingsEditor.component.html',
	styleUrl: './applicationSettingsEditor.component.scss'
})
export class ApplicationSettingsEditorComponent implements OnDestroy, OnInit {
	//#region PUBLIC CONSTANTS

	/** Alto inicial de la ventana: con pocos datos por parámetro no necesita el alto de los demás editores. */
	public readonly EDITOR_HEIGHT: string = 'min(26rem, 85dvh)';

	/** Panel de los parámetros que se eligen entre unos idiomas. */
	public readonly PANEL_LANGUAGE: ApplicationSettingsPanel = ApplicationSettingsPanel.LANGUAGE;

	/** Panel de los parámetros numéricos. */
	public readonly PANEL_NUMBER: ApplicationSettingsPanel = ApplicationSettingsPanel.NUMBER;

	/** Panel de los parámetros de texto libre. */
	public readonly PANEL_TEXT: ApplicationSettingsPanel = ApplicationSettingsPanel.TEXT;

	//#region LANGUAGE TEXTS

	/** Texto cuando no hay ningún parámetro en la lista. */
	public readonly LIST_EMPTY_TEXT: string = LanguageManager.GetText('ASE_EMPTY');

	/** Texto mientras se carga la lista. */
	public readonly LOADING_TEXT: string = LanguageManager.GetText('WEB_LOADING');

	/** Texto cuando no hay ningún parámetro seleccionado. */
	public readonly NO_SELECTION_TEXT: string = LanguageManager.GetText('ASE_NO_SELECTION');

	/** Texto del botón que pone el valor por defecto. */
	public readonly RESTORE_DEFAULT_TEXT: string = LanguageManager.GetText('ASE_RESTORE_DEFAULT');

	/** Texto de ayuda del buscador. */
	public readonly SEARCH_TEXT: string = LanguageManager.GetText('ASE_SEARCH');

	/** Título del editor. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('WEB_SETTINGS');

	/** Etiqueta del campo del valor. */
	public readonly VALUE_TEXT: string = LanguageManager.GetText('ASE_VALUE');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	//#region LANGUAGE TEXTS

	/** Texto del valor por defecto, con el valor en `{0}`. */
	private readonly _DEFAULT_VALUE_TEXT: string = LanguageManager.GetText('ASE_DEFAULT_VALUE');

	/** Aviso de que la carpeta de los modelos no puede estar vacía. */
	private readonly _DIRECTORY_REQUIRED_TEXT: string = LanguageManager.GetText('ASE_DIRECTORY_REQUIRED');

	/** Pregunta de confirmación para descartar los cambios sin guardar. */
	private readonly _DISCARD_CONFIRM_TEXT: string = LanguageManager.GetText('WEB_DISCARD_CONFIRM');

	/** Aviso de que no se han podido cargar los parámetros. */
	private readonly _LOAD_ERROR_TEXT: string = LanguageManager.GetText('ASE_LOAD_ERROR');

	/** Aviso de que el valor debe ser un número entero mayor que cero. */
	private readonly _NUMBER_INVALID_TEXT: string = LanguageManager.GetText('ASE_NUMBER_INVALID');

	/** Aviso de que el número está fuera de los límites, con el mínimo en `{0}` y el máximo en `{1}`. */
	private readonly _NUMBER_RANGE_TEXT: string = LanguageManager.GetText('ASE_NUMBER_RANGE');

	/** Mensaje de que los cambios se aplican al recargar la página. */
	private readonly _RELOAD_NOTICE_TEXT: string = LanguageManager.GetText('ASE_RELOAD_NOTICE');

	/** Mensaje de que el parámetro, además, requiere reiniciar la API. */
	private readonly _RESTART_NOTICE_TEXT: string = LanguageManager.GetText('ASE_RESTART_NOTICE');

	/** Aviso de que el parámetro se ha guardado. */
	private readonly _SAVED_TEXT: string = LanguageManager.GetText('ASE_SAVED');

	/** Aviso de que no se ha podido guardar el parámetro. */
	private readonly _SAVE_ERROR_TEXT: string = LanguageManager.GetText('ASE_SAVE_ERROR');

	/** Aviso de que el API ha rechazado el valor. */
	private readonly _VALUE_REJECTED_TEXT: string = LanguageManager.GetText('ASE_VALUE_REJECTED');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Flecha de las fichas, que indica en móvil que se abren. */
	public ArrowIcon: string = IconsUtils.GetUrl(IconName.CHEVRON_RIGHT);

	/** Valor por defecto del parámetro abierto, ya con su texto. */
	public DefaultValueText: string = STRING_UNDEFINED;

	/** Descripción del parámetro abierto. */
	public DetailDescription: string = STRING_UNDEFINED;

	/** Nombre del parámetro abierto. */
	public DetailName: string = STRING_UNDEFINED;

	/** Observaciones del parámetro abierto. */
	public DetailObservations: string = STRING_UNDEFINED;

	/** Valor que se está editando: solo se guarda al pulsar guardar. */
	public DraftValue: string = STRING_UNDEFINED;

	/** Aviso del último intento de guardar; vacío si no hay. */
	public ErrorText: string = STRING_UNDEFINED;

	/** `true` si hay un parámetro abierto: se muestra su detalle. */
	public HasDetail: boolean = false;

	/** `true` si hay un aviso del último intento de guardar. */
	public HasError: boolean = false;

	/** `true` si hay algún parámetro que mostrar en la lista. */
	public HasItems: boolean = false;

	/** `true` si hay un parámetro seleccionado en la lista. */
	public HasSelection: boolean = false;

	/** `true` mientras se guarda: se bloquean los botones. */
	public IsBusy: boolean = false;

	/** `true` mientras se edita el valor del parámetro abierto. */
	public IsEditing: boolean = false;

	/** `true` mientras se carga la lista de parámetros. */
	public IsLoadingList: boolean = true;

	/** `true` si el valor solo se puede leer. */
	public IsReadOnly: boolean = true;

	/** `true` si no se puede restaurar el valor por defecto: no se está editando o hay un guardado en curso. */
	public IsRestoreDisabled: boolean = true;

	/** Fichas de la lista, ya filtradas por el buscador. */
	public ListItems: ApplicationSettingsListItem[] = [];

	/** Valor máximo del parámetro numérico abierto; `null` si no tiene. */
	public NumberMax: number | null = null;

	/** Valor mínimo del parámetro numérico abierto. */
	public NumberMin: number = 1;

	/** Panel con el que se edita el parámetro abierto. */
	public Panel: ApplicationSettingsPanel = ApplicationSettingsPanel.TEXT;

	/** Icono del botón que restaura el valor por defecto. */
	public RestoreIcon: string = IconsUtils.GetUrl(IconName.RESTART_ALT);

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Corta las peticiones pendientes al cambiar de parámetro y al cerrar el editor. */
	private readonly _Canceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Hace las preguntas y los avisos con diálogo. */
	private readonly _Confirm: ConfirmDialogService;

	/** Llamadas al API. */
	private readonly _DataAccess: DataAccessService;

	/** Diálogo que contiene el editor, para cerrarlo. */
	private readonly _DialogRef: MatDialogRef<ApplicationSettingsEditorComponent>;

	/** `true` si hay cambios sin guardar en el valor. */
	private _IsDirty: boolean = false;

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	/** Todos los parámetros, sin filtrar. */
	private _Parameters: ApplicationSettingsParameterBase[] = [];

	/** Texto del buscador, en minúsculas. */
	private _SearchText: string = STRING_UNDEFINED;

	/** Parámetro seleccionado en la lista. Es `null` si no hay ninguno. */
	private _Selected: ApplicationSettingsParameterBase | null = null;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param confirm Hace las preguntas y los avisos con diálogo.
	 * @param dataAccess Llamadas al API.
	 * @param dialogRef Diálogo que contiene el editor.
	 * @param notification Avisa al usuario de los fallos.
	 */
	constructor(
		confirm: ConfirmDialogService,
		dataAccess: DataAccessService,
		dialogRef: MatDialogRef<ApplicationSettingsEditorComponent>,
		notification: NotificationService
	) {
		this._Confirm = confirm;
		this._DataAccess = dataAccess;
		this._DialogRef = dialogRef;
		this._Notification = notification;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this._Canceller.Destroy();
	}

	public ngOnInit(): void {
		this.loadParameters();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public async OnBackClicked(): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openParameter(null);
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	public async OnCloseRequested(): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this._DialogRef.close();
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	public async OnDiscardClicked(): Promise<void> {
		if (await this.confirmDiscard()) {
			this.openParameter(this._Selected);
		} else {
			// El usuario prefiere seguir con lo que estaba editando
		}
	}

	public OnEditClicked(): void {
		this.setEditing(true);
	}

	public async OnParameterSelected(parameter: ApplicationSettingsParameterBase): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openParameter(parameter);
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	public OnRestoreDefaultClicked(): void {
		if (!CheckUtils.IsNull(this._Selected)) {
			this.DraftValue = this._Selected.DefaultValue;
			this.setErrorText(STRING_UNDEFINED);
			this._IsDirty = true;
		} else {
			// No hay ningún parámetro abierto
		}
	}

	public async OnSaveClicked(): Promise<void> {
		this.setErrorText(this.getValidationError());

		if (!this.HasError) {
			await this.saveParameter();
		} else {
			// El valor no es válido: el aviso ya está en pantalla
		}
	}

	public OnSearchChanged(text: string): void {
		this._SearchText = text.trim().toLowerCase();
		this.refreshList();
	}

	public OnValueChanged(value: string): void {
		this.DraftValue = value;
		this.setErrorText(STRING_UNDEFINED);
		this._IsDirty = true;
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Si hay cambios sin guardar, pregunta si se descartan.
	 * @returns `true` si se puede seguir (no había cambios o el usuario acepta descartarlos).
	 */
	private async confirmDiscard(): Promise<boolean> {
		let result: boolean = true;

		if (this.IsEditing && this._IsDirty) {
			result = await this._Confirm.Show(this._DISCARD_CONFIRM_TEXT, ConfirmDialogType.QUESTION);
		} else {
			// No hay cambios que perder
		}

		return result;
	}

	/**
	 * Elige el panel con el que se edita un parámetro.
	 * @param parameter Parámetro que se edita.
	 * @returns El panel que le corresponde.
	 */
	private getPanel(parameter: ApplicationSettingsParameterBase): ApplicationSettingsPanel {
		let result: ApplicationSettingsPanel = ApplicationSettingsPanel.TEXT;

		switch (parameter.Parameter) {
			case ApplicationSettingsParameter.BIM_MODELS_REFRESH_INTERVAL:
			case ApplicationSettingsParameter.SESSION_TIMEOUT_MILLISECONDS:
				result = ApplicationSettingsPanel.NUMBER;
				break;
			case ApplicationSettingsParameter.BIM_MODELS_DIRECTORY:
				result = ApplicationSettingsPanel.TEXT;
				break;
			case ApplicationSettingsParameter.LANGUAGE:
				result = ApplicationSettingsPanel.LANGUAGE;
				break;
			default:
				console.warn('ApplicationSettingsEditor.getPanel() => parámetro sin panel: ' + String(parameter.Parameter));
				break;
		}

		return result;
	}

	/**
	 * Comprueba el valor que se edita antes de guardarlo. El resto de comprobaciones las hace el API.
	 * @returns El aviso si el valor no es válido; vacío si lo es.
	 */
	private getValidationError(): string {
		let result: string = STRING_UNDEFINED;

		switch (this.Panel) {
			case ApplicationSettingsPanel.NUMBER:
				if (!/^[0-9]+$/.test(this.DraftValue) || Number(this.DraftValue) <= 0) {
					result = this._NUMBER_INVALID_TEXT;
				} else {
					result = this.getRangeError(Number(this.DraftValue));
				}
				break;
			case ApplicationSettingsPanel.TEXT:
				if (this.DraftValue.trim() === STRING_UNDEFINED) {
					result = this._DIRECTORY_REQUIRED_TEXT;
				} else {
					// Tiene contenido; el API no pide nada más
				}
				break;
			case ApplicationSettingsPanel.LANGUAGE:
				// Se elige de una lista cerrada: no hay nada que comprobar
				break;
			default:
				console.warn('ApplicationSettingsEditor.getValidationError() => panel sin comprobación: ' + String(this.Panel));
				break;
		}

		return result;
	}

	/**
	 * Comprueba que un número está entre los límites del parámetro abierto, si el parámetro los tiene.
	 * @param value Valor numérico que se edita.
	 * @returns El aviso si está fuera de los límites; vacío si está dentro o el parámetro no tiene límites.
	 */
	private getRangeError(value: number): string {
		let result: string = STRING_UNDEFINED;

		if (!CheckUtils.IsNull(this.NumberMax) && (value < this.NumberMin || value > this.NumberMax)) {
			result = StringUtils.Format(this._NUMBER_RANGE_TEXT, [String(this.NumberMin), String(this.NumberMax)]);
		} else {
			// Está dentro de los límites o el parámetro no tiene máximo: el resto lo valida el API
		}

		return result;
	}

	/** Carga la lista de parámetros. */
	private async loadParameters(): Promise<void> {
		try {
			const result: TryGetResult<ApplicationSettingsParameterBase[]> = await RequestUtils.AwaitRequest(
				this._DataAccess.ApplicationSettings.GetAll(),
				this._Canceller
			);

			if (result.Success) {
				this._Parameters = result.Result as ApplicationSettingsParameterBase[];
				this.refreshList();
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._LOAD_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`ApplicationSettingsEditor.loadParameters() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			// Si no se ha podido cargar, la lista se queda vacía: el editor sigue siendo usable
			this.IsLoadingList = false;
		}
	}

	/**
	 * Abre un parámetro en el detalle, sin edición y sin cambios pendientes.
	 * @param parameter Parámetro a abrir. Con `null`, el detalle queda cerrado.
	 */
	private openParameter(parameter: ApplicationSettingsParameterBase | null): void {
		this._IsDirty = false;
		this._Selected = parameter;
		this.setErrorText(STRING_UNDEFINED);

		if (!CheckUtils.IsNull(parameter)) {
			this.DefaultValueText = StringUtils.Format(this._DEFAULT_VALUE_TEXT, [parameter.DefaultValue]);
			this.DetailDescription = parameter.GetDescription();
			this.DetailName = parameter.GetName();
			this.DetailObservations = parameter.GetObservations();
			this.DraftValue = parameter.Value;
			this.Panel = this.getPanel(parameter);
			this.setNumberLimits(parameter);
		} else {
			this.DraftValue = STRING_UNDEFINED;
		}

		this.HasDetail = !CheckUtils.IsNull(parameter);
		this.HasSelection = !CheckUtils.IsNull(parameter);
		this.setEditing(false);
		this.refreshList();
	}

	/**
	 * Deja calculados los límites del campo numérico para un parámetro.
	 * @param parameter Parámetro que se abre.
	 */
	private setNumberLimits(parameter: ApplicationSettingsParameterBase): void {
		switch (parameter.Parameter) {
			case ApplicationSettingsParameter.BIM_MODELS_REFRESH_INTERVAL:
				this.NumberMax = BimModelsRefreshIntervalSettingsParameter.MAX_VALUE;
				this.NumberMin = BimModelsRefreshIntervalSettingsParameter.MIN_VALUE;
				break;
			case ApplicationSettingsParameter.SESSION_TIMEOUT_MILLISECONDS:
				this.NumberMax = SessionTimeoutSettingsParameter.MAX_VALUE;
				this.NumberMin = SessionTimeoutSettingsParameter.MIN_VALUE;
				break;
			case ApplicationSettingsParameter.BIM_MODELS_DIRECTORY:
			case ApplicationSettingsParameter.LANGUAGE:
				// No son numéricos: no tienen límites
				this.NumberMax = null;
				this.NumberMin = 1;
				break;
			default:
				console.warn('ApplicationSettingsEditor.setNumberLimits() => parámetro sin definir: ' + String(parameter.Parameter));
				this.NumberMax = null;
				this.NumberMin = 1;
				break;
		}
	}

	/** Deja calculadas las fichas de la lista: ordenadas por nombre y filtradas por el buscador. */
	private refreshList(): void {
		const selectedParameter: ApplicationSettingsParameter | null = CheckUtils.IsNull(this._Selected)
			? null
			: this._Selected.Parameter;

		this.ListItems = this._Parameters
			.filter(
				(parameter: ApplicationSettingsParameterBase): boolean =>
					parameter.GetName().toLowerCase().includes(this._SearchText) ||
					parameter.GetDescription().toLowerCase().includes(this._SearchText)
			)
			.sort((a: ApplicationSettingsParameterBase, b: ApplicationSettingsParameterBase): number =>
				a.GetName().localeCompare(b.GetName())
			)
			.map((parameter: ApplicationSettingsParameterBase): ApplicationSettingsListItem => ({
				IsSelected: parameter.Parameter === selectedParameter,
				Name: parameter.GetName(),
				Parameter: parameter,
				ValueText: parameter.Value
			}));
		this.HasItems = this.ListItems.length > 0;
	}

	/** Guarda el valor que se edita y, si el API lo acepta, avisa de cuándo se aplicará. */
	private async saveParameter(): Promise<void> {
		const selected: ApplicationSettingsParameterBase | null = this._Selected;

		if (!CheckUtils.IsNull(selected)) {
			this.setBusy(true);

			try {
				const result: TryGetResult<ApplicationSettingsParameterBase> = await RequestUtils.AwaitRequest(
					this._DataAccess.ApplicationSettings.Update(selected.Parameter, this.DraftValue),
					this._Canceller
				);

				if (result.Success) {
					const saved: ApplicationSettingsParameterBase = result.Result as ApplicationSettingsParameterBase;

					this.replaceParameter(saved);
					this.openParameter(saved);
					this._Notification.Send(this._SAVED_TEXT, NotificationLevel.SUCCESS);
					await this._Confirm.Show(this.getNoticeText(saved), ConfirmDialogType.INFORMATION);
				} else {
					// Petición cancelada: no hay nada que hacer
				}
			} catch (error) {
				if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
					this.setErrorText(this._VALUE_REJECTED_TEXT);
				} else {
					this._Notification.Send(this._SAVE_ERROR_TEXT, NotificationLevel.DANGER);
				}

				console.warn(`ApplicationSettingsEditor.saveParameter() => ${ErrorUtils.GetMessage(error)}`);
			} finally {
				this.setBusy(false);
			}
		} else {
			// No hay ningún parámetro abierto
		}
	}

	/**
	 * Compone el mensaje que se muestra tras guardar: los cambios se aplican al recargar la página y, en algunos
	 * parámetros, además al reiniciar la API.
	 * @param parameter Parámetro que se ha guardado.
	 * @returns El mensaje.
	 */
	private getNoticeText(parameter: ApplicationSettingsParameterBase): string {
		let result: string = this._RELOAD_NOTICE_TEXT;

		if (this.requiresRestart(parameter)) {
			result = result + ' ' + this._RESTART_NOTICE_TEXT;
		} else {
			// Basta con recargar la página
		}

		return result;
	}

	/**
	 * Sustituye en la lista un parámetro por su versión guardada.
	 * @param parameter Parámetro guardado.
	 */
	private replaceParameter(parameter: ApplicationSettingsParameterBase): void {
		for (let index: number = 0; index < this._Parameters.length; index++) {
			if (this._Parameters[index].Parameter === parameter.Parameter) {
				this._Parameters[index] = parameter;
			} else {
				// No es el parámetro guardado
			}
		}
	}

	/**
	 * Dice si un parámetro solo surte efecto cuando se reinicia la API, porque esta lo lee una sola vez al arrancar.
	 * @param parameter Parámetro que se ha guardado.
	 * @returns `true` si hay que reiniciar la API.
	 */
	private requiresRestart(parameter: ApplicationSettingsParameterBase): boolean {
		let result: boolean = false;

		switch (parameter.Parameter) {
			case ApplicationSettingsParameter.BIM_MODELS_DIRECTORY:
			case ApplicationSettingsParameter.SESSION_TIMEOUT_MILLISECONDS:
				result = true;
				break;
			case ApplicationSettingsParameter.BIM_MODELS_REFRESH_INTERVAL:
			case ApplicationSettingsParameter.LANGUAGE:
				result = false;
				break;
			default:
				console.warn('ApplicationSettingsEditor.requiresRestart() => parámetro sin definir: ' + String(parameter.Parameter));
				break;
		}

		return result;
	}

	/**
	 * Marca si hay un guardado en curso. Mientras lo hay, el diálogo no se puede cerrar (ni con Escape ni pulsando
	 * fuera), porque al cerrarse se cancelaría la petición.
	 * @param isBusy `true` si hay una operación en curso.
	 */
	private setBusy(isBusy: boolean): void {
		this.IsBusy = isBusy;
		this.IsRestoreDisabled = this.IsReadOnly || isBusy;
		this._DialogRef.disableClose = isBusy;
	}

	/**
	 * Entra o sale del modo edición.
	 * @param isEditing `true` para editar.
	 */
	private setEditing(isEditing: boolean): void {
		this.IsEditing = isEditing;
		this.IsReadOnly = !isEditing;
		this.IsRestoreDisabled = !isEditing || this.IsBusy;
	}

	/**
	 * Cambia el aviso del último intento de guardar.
	 * @param text Aviso; vacío para quitarlo.
	 */
	private setErrorText(text: string): void {
		this.ErrorText = text;
		this.HasError = text !== STRING_UNDEFINED;
	}

	//#endregion PRIVATE METHODS
}
