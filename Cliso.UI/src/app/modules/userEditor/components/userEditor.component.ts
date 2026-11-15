import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { UserEditorPasswordDialogService } from 'src/app/modules/userEditor/components/passwordDialog/passwordDialog.service';
import { UserEditorPasswordFieldComponent } from 'src/app/modules/userEditor/components/passwordField/passwordField.component';
import { EditorShellComponent } from 'src/app/shared/components/editorShell/editorShell.component';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { ConfirmDialogType } from 'src/app/shared/definitions/dialogs.definitions';
import { UserDto } from 'src/app/shared/definitions/dtos.definitions';
import { ReadOnlyDirective } from 'src/app/shared/directives/readOnly.directive';
import { SelectReadOnlyDirective } from 'src/app/shared/directives/selectReadOnly.directive';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { PasswordRequirement, PROTECTED_USER_NICK, UserRole } from 'src/app/shared/definitions/user.definitions';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { User } from 'src/app/shared/models/user/user.models';
import { ConfirmDialogService } from 'src/app/shared/services/confirmDialog.service';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { UserMapper } from 'src/app/shared/utils/mappers/userMapper.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { LoggedUserManager } from 'src/app/shared/utils/session/loggedUserManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';

/** Ficha de un usuario en la lista del editor, con lo que la plantilla necesita ya calculado. */
type UserListItem = {
	FullName: string;
	IsSelected: boolean;
	User: User;
};

/** Opción del selector de rol: el rol y su nombre en el idioma actual. */
type UserRoleOption = {
	Role: UserRole;
	Text: string;
};

/** Editor de los usuarios: lista de usuarios y sus datos (nick, nombre, apellidos, rol y contraseña). */
@Component({
	selector: 'app-user-editor',
	imports: [
		EditorShellComponent,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressBarModule,
		MatSelectModule,
		ReadOnlyDirective,
		SelectReadOnlyDirective,
		UserEditorPasswordFieldComponent
	],
	templateUrl: './userEditor.component.html',
	styleUrl: './userEditor.component.scss'
})
export class UserEditorComponent implements OnDestroy, OnInit {
	//#region PUBLIC CONSTANTS

	/** Longitud máxima del nombre, la misma que admite el API. */
	public readonly NAME_MAX_LENGTH: number = 100;

	/** Longitud máxima del nick, la misma que admite el API. */
	public readonly NICK_MAX_LENGTH: number = 50;

	/** Longitud máxima de los apellidos, la misma que admite el API. */
	public readonly SURNAME_MAX_LENGTH: number = 150;

	//#region LANGUAGE TEXTS

	/** Texto del botón que abre el submodal para cambiar la contraseña. */
	public readonly CHANGE_PASSWORD_TEXT: string = LanguageManager.GetText('UE_CHANGE_PASSWORD');

	/** Aviso de que un campo obligatorio está vacío. */
	public readonly FIELD_REQUIRED_TEXT: string = LanguageManager.GetText('WEB_FIELD_REQUIRED');

	/** Texto mientras se carga la lista. */
	public readonly LOADING_TEXT: string = LanguageManager.GetText('WEB_LOADING');

	/** Etiqueta del nombre. */
	public readonly NAME_TEXT: string = LanguageManager.GetText('WEB_NAME');

	/** Etiqueta del nick. */
	public readonly NICK_TEXT: string = LanguageManager.GetText('WEB_NICK');

	/** Texto cuando no hay ningún usuario seleccionado. */
	public readonly NO_SELECTION_TEXT: string = LanguageManager.GetText('UE_NO_SELECTION');

	/** Texto cuando no hay ningún usuario en la lista. */
	public readonly NO_USERS_TEXT: string = LanguageManager.GetText('UE_NO_USERS');

	/** Aviso de que la contraseña y su repetición no coinciden. */
	public readonly PASSWORD_MISMATCH_TEXT: string = LanguageManager.GetText('WEB_PASSWORD_MISMATCH');

	/** Aviso de que hay una contraseña nueva que se guardará con el resto de datos. */
	public readonly PASSWORD_PENDING_TEXT: string = LanguageManager.GetText('UE_PASSWORD_PENDING');

	/** Etiqueta del campo que repite la contraseña. */
	public readonly PASSWORD_REPEAT_TEXT: string = LanguageManager.GetText('WEB_PASSWORD_REPEAT');

	/** Encabezado de los requisitos que no cumple la contraseña. */
	public readonly PASSWORD_REQUIREMENTS_TEXT: string = LanguageManager.GetText('UE_PASSWORD_REQUIREMENTS');

	/** Etiqueta de la contraseña. */
	public readonly PASSWORD_TEXT: string = LanguageManager.GetText('WEB_PASSWORD');

	/** Nombre del rol de administrador. */
	public readonly ROLE_ADMIN_TEXT: string = LanguageManager.GetText('UE_ROLE_ADMIN');

	/** Nombre del rol de operador. */
	public readonly ROLE_OPERATOR_TEXT: string = LanguageManager.GetText('UE_ROLE_OPERATOR');

	/** Etiqueta del rol. */
	public readonly ROLE_TEXT: string = LanguageManager.GetText('UE_ROLE');

	/** Nombre del rol de visor. */
	public readonly ROLE_VIEWER_TEXT: string = LanguageManager.GetText('UE_ROLE_VIEWER');

	/** Texto de ayuda del buscador. */
	public readonly SEARCH_TEXT: string = LanguageManager.GetText('UE_SEARCH');

	/** Etiqueta de los apellidos. */
	public readonly SURNAME_TEXT: string = LanguageManager.GetText('UE_SURNAME');

	/** Título del editor. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('WEB_USERS');

	//#endregion LANGUAGE TEXTS

	// Se construye con los nombres de los roles (textos declarados arriba)
	/** Roles que se ofrecen en el selector, de más a menos permisos. */
	public readonly ROLE_OPTIONS: UserRoleOption[] = [
		{ Role: UserRole.ADMIN, Text: this.ROLE_ADMIN_TEXT },
		{ Role: UserRole.OPERATOR, Text: this.ROLE_OPERATOR_TEXT },
		{ Role: UserRole.VIEWER, Text: this.ROLE_VIEWER_TEXT }
	];

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	//#region LANGUAGE TEXTS

	/** Aviso de que el usuario se ha añadido. */
	private readonly _ADDED_TEXT: string = LanguageManager.GetText('UE_ADDED');

	/** Aviso de que el usuario se ha eliminado. */
	private readonly _DELETED_TEXT: string = LanguageManager.GetText('UE_DELETED');

	/** Pregunta de confirmación del borrado, con el nick del usuario en `{0}`. */
	private readonly _DELETE_CONFIRM_TEXT: string = LanguageManager.GetText('UE_DELETE_CONFIRM');

	/** Aviso de que no se ha podido borrar el usuario. */
	private readonly _DELETE_ERROR_TEXT: string = LanguageManager.GetText('UE_DELETE_ERROR');

	/** Pregunta de confirmación para descartar los cambios sin guardar. */
	private readonly _DISCARD_CONFIRM_TEXT: string = LanguageManager.GetText('WEB_DISCARD_CONFIRM');

	/** Aviso de que no se han podido cargar los usuarios. */
	private readonly _LOAD_ERROR_TEXT: string = LanguageManager.GetText('UE_LOAD_ERROR');

	/** Aviso de que ya existe otro usuario con ese nick. */
	private readonly _NICK_EXISTS_TEXT: string = LanguageManager.GetText('UE_NICK_EXISTS');

	/** Requisito de contraseña: incluir un número. */
	private readonly _PASSWORD_DIGIT_TEXT: string = LanguageManager.GetText('UE_PASSWORD_DIGIT');

	/** Requisito de contraseña: incluir una minúscula. */
	private readonly _PASSWORD_LOWERCASE_TEXT: string = LanguageManager.GetText('UE_PASSWORD_LOWERCASE');

	/** Requisito de contraseña: tener la longitud mínima. */
	private readonly _PASSWORD_MIN_LENGTH_TEXT: string = LanguageManager.GetText('UE_PASSWORD_MIN_LENGTH');

	/** Requisito de contraseña: incluir un símbolo. */
	private readonly _PASSWORD_SYMBOL_TEXT: string = LanguageManager.GetText('UE_PASSWORD_SYMBOL');

	/** Requisito de contraseña: incluir una mayúscula. */
	private readonly _PASSWORD_UPPERCASE_TEXT: string = LanguageManager.GetText('UE_PASSWORD_UPPERCASE');

	/** Aviso de que no se ha podido guardar el usuario. */
	private readonly _SAVE_ERROR_TEXT: string = LanguageManager.GetText('UE_SAVE_ERROR');

	/** Aviso de que el usuario se ha modificado. */
	private readonly _UPDATED_TEXT: string = LanguageManager.GetText('UE_UPDATED');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Flecha de las fichas, que indica en móvil que se abren. */
	public ArrowIcon: string = IconsUtils.GetUrl(IconName.CHEVRON_RIGHT);

	/** `true` si el usuario seleccionado se puede borrar: ni el de la sesión ni el protegido. */
	public CanDeleteSelection: boolean = false;

	/** Datos del usuario abierto: son los que se editan, y solo se guardan al pulsar guardar. */
	public Draft: User = this.createEmptyUser();

	/** `true` si hay un usuario abierto (seleccionado o nuevo): se muestra su detalle. */
	public HasDetail: boolean = false;

	/** `true` si hay algún usuario que mostrar en la lista. */
	public HasItems: boolean = false;

	/** `true` si hay requisitos de la contraseña que no se cumplen y hay que mostrarlos. */
	public HasPasswordRequirements: boolean = false;

	/** `true` si se ha cambiado la contraseña de un usuario existente y aún no se ha guardado. */
	public HasPendingPassword: boolean = false;

	/** `true` si hay un usuario seleccionado en la lista. */
	public HasSelection: boolean = false;

	/** `true` mientras se guarda o se borra: se bloquean los botones. */
	public IsBusy: boolean = false;

	/** `true` mientras se edita (o se añade) un usuario. */
	public IsEditing: boolean = false;

	/** `true` mientras se carga la lista de usuarios. */
	public IsLoadingList: boolean = true;

	/** `true` si el nick solo se puede leer: solo se escribe al añadir un usuario, después es intocable. */
	public IsNickReadOnly: boolean = true;

	/** `true` si el detalle solo se puede leer. */
	public IsReadOnly: boolean = true;

	/** `true` si el rol no se puede cambiar: fuera de la edición, con el usuario protegido o con el de la sesión. */
	public IsRoleReadOnly: boolean = true;

	/** Fichas de la lista, ya filtradas por el buscador. */
	public ListItems: UserListItem[] = [];

	/** `true` si hay que avisar de que falta el nombre. */
	public NameError: boolean = false;

	/** `true` si hay que avisar de que falta el nick. */
	public NickError: boolean = false;

	/** Contraseña escrita al añadir un usuario. */
	public Password: string = STRING_UNDEFINED;

	/** `true` si hay que avisar de que falta la contraseña (obligatoria al añadir). */
	public PasswordError: boolean = false;

	/** `true` si hay que avisar de que la contraseña y su repetición no coinciden. */
	public PasswordMismatchError: boolean = false;

	/** Repetición de la contraseña al añadir un usuario, que debe coincidir con ella para poder guardar. */
	public PasswordRepeat: string = STRING_UNDEFINED;

	/** Textos de los requisitos que no cumple la contraseña, según el API. */
	public PasswordRequirementTexts: string[] = [];

	/** `true` si se muestra el botón que cambia la contraseña: al editar un usuario existente. */
	public ShowPasswordButton: boolean = false;

	/** `true` si se muestran los campos de la contraseña: al añadir un usuario. */
	public ShowPasswordFields: boolean = false;

	/** `true` si hay que avisar de que faltan los apellidos. */
	public SurnameError: boolean = false;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Corta las peticiones pendientes al cerrar el editor. */
	private readonly _Canceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Hace las preguntas de confirmación. */
	private readonly _Confirm: ConfirmDialogService;

	/** Llamadas al API. */
	private readonly _DataAccess: DataAccessService;

	/** Diálogo que contiene el editor, para cerrarlo. */
	private readonly _DialogRef: MatDialogRef<UserEditorComponent>;

	/** `true` si hay cambios sin guardar en el detalle. */
	private _IsDirty: boolean = false;

	/** `true` si el usuario abierto es nuevo y aún no se ha guardado. */
	private _IsNew: boolean = false;

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	/** Abre el submodal de la contraseña. */
	private readonly _PasswordDialog: UserEditorPasswordDialogService;

	/** Contraseña nueva de un usuario existente, que se envía al guardar. Es `null` si no se ha cambiado: se conserva la actual. */
	private _PendingPassword: string | null = null;

	/** Texto del buscador, en minúsculas. */
	private _SearchText: string = STRING_UNDEFINED;

	/** Usuario seleccionado en la lista. Es `null` si no hay ninguno, o si se está añadiendo uno nuevo. */
	private _Selected: User | null = null;

	/** Todos los usuarios, sin filtrar. */
	private _Users: User[] = [];

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dataAccess Llamadas al API.
	 * @param dialogRef Diálogo que contiene el editor.
	 * @param confirm Hace las preguntas de confirmación.
	 * @param notification Avisa al usuario de los fallos.
	 * @param passwordDialog Abre el submodal de la contraseña.
	 */
	constructor(
		dataAccess: DataAccessService,
		dialogRef: MatDialogRef<UserEditorComponent>,
		confirm: ConfirmDialogService,
		notification: NotificationService,
		passwordDialog: UserEditorPasswordDialogService
	) {
		this._Confirm = confirm;
		this._DataAccess = dataAccess;
		this._DialogRef = dialogRef;
		this._Notification = notification;
		this._PasswordDialog = passwordDialog;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this._Canceller.Destroy();
		this._Selected = null;
	}

	public ngOnInit(): void {
		this.loadUsers();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public async OnAddClicked(): Promise<void> {
		if (await this.confirmDiscard()) {
			this.openUser(null);
			this._IsNew = true;
			this.setEditing(true);
		} else {
			// El usuario prefiere seguir con lo que estaba editando
		}
	}

	public async OnBackClicked(): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openUser(null);
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

	public async OnDeleteClicked(): Promise<void> {
		if (!CheckUtils.IsNull(this._Selected)) {
			const user: User = this._Selected;

			if (await this._Confirm.Show(StringUtils.Format(this._DELETE_CONFIRM_TEXT, [user.Nick]), ConfirmDialogType.DANGER)) {
				await this.deleteUser(user);
			} else {
				// El usuario cancela el borrado
			}
		} else {
			// No hay nada que borrar
		}
	}

	public async OnDiscardClicked(): Promise<void> {
		if (await this.confirmDiscard()) {
			this.openUser(this._Selected);
		} else {
			// El usuario prefiere seguir con lo que estaba editando
		}
	}

	public OnEditClicked(): void {
		this.setEditing(true);
	}

	public OnNameInput(event: Event): void {
		this.Draft.Name = (event.target as HTMLInputElement).value;
		this.NameError = false;
		this._IsDirty = true;
	}

	public OnNickInput(event: Event): void {
		this.Draft.Nick = (event.target as HTMLInputElement).value;
		this.NickError = false;
		this._IsDirty = true;
	}

	public OnPasswordChanged(value: string): void {
		this.Password = value;
		this.PasswordError = false;
		this.PasswordMismatchError = false;
		this._IsDirty = true;
	}

	public async OnPasswordClicked(): Promise<void> {
		const password: string | null = await this._PasswordDialog.Show();

		if (!CheckUtils.IsNull(password)) {
			this._IsDirty = true;
			this._PendingPassword = password;
			this.HasPasswordRequirements = false;
			this.HasPendingPassword = true;
			this.PasswordRequirementTexts = [];
		} else {
			// Se cierra sin aceptar: la contraseña no cambia
		}
	}

	public OnPasswordRepeatChanged(value: string): void {
		this.PasswordRepeat = value;
		this.PasswordMismatchError = false;
		this._IsDirty = true;
	}

	public OnRoleChanged(event: MatSelectChange): void {
		this.Draft.Role = event.value as UserRole;
		this._IsDirty = true;
	}

	public async OnSaveClicked(): Promise<void> {
		if (this.validate()) {
			await this.saveUser();
		} else {
			// Faltan datos: los avisos ya se muestran junto a cada campo
		}
	}

	public OnSearchChanged(text: string): void {
		this._SearchText = text.trim().toLowerCase();
		this.refreshList();
	}

	public OnSurnameInput(event: Event): void {
		this.Draft.Surname = (event.target as HTMLInputElement).value;
		this.SurnameError = false;
		this._IsDirty = true;
	}

	public async OnUserSelected(user: User): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openUser(user);
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Hace una copia de un usuario, para editarla sin tocar el original hasta guardar.
	 * @param user Usuario a copiar.
	 */
	private cloneUser(user: User): User {
		return new User(user.Id, user.Nick, user.Name, user.Surname, user.Role, user.Active);
	}

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

	/** Crea un usuario en blanco, para el detalle cuando no hay ninguno abierto o se está añadiendo uno. Empieza con el rol de menos permisos. */
	private createEmptyUser(): User {
		return new User(ID_NUMERIC_UNDEFINED, STRING_UNDEFINED, STRING_UNDEFINED, STRING_UNDEFINED, UserRole.VIEWER, true);
	}

	/**
	 * Borra un usuario (borrado lógico: se conservan sus datos) y lo quita de la lista.
	 * @param user Usuario a borrar.
	 */
	private async deleteUser(user: User): Promise<void> {
		this.setBusy(true);

		try {
			const result: TryGetResult<void> = await RequestUtils.AwaitRequest(
				this._DataAccess.Users.Delete(user.Id, false),
				this._Canceller
			);

			if (result.Success) {
				this._Users = this._Users.filter((item: User): boolean => item.Id !== user.Id);
				this.openUser(null);
				this._Notification.Send(this._DELETED_TEXT, NotificationLevel.SUCCESS);
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._DELETE_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`UserEditor.deleteUser() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.setBusy(false);
		}
	}

	/**
	 * Saca los textos de los requisitos que no cumple la contraseña, si el API ha rechazado el guardado por ella.
	 * @param error Fallo de la petición.
	 * @returns Los textos de los requisitos incumplidos; vacío si el fallo no es por la contraseña.
	 */
	private getPasswordRequirementTexts(error: unknown): string[] {
		const result: string[] = [];

		if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
			// El cuerpo de la respuesta es JSON: se comprueba su forma antes de leerlo
			const body: unknown = error.error;

			if (typeof body === 'object' && !CheckUtils.IsNull(body) && 'requirements' in body && Array.isArray(body.requirements)) {
				for (const code of body.requirements as string[]) {
					const text: string | null = this.getRequirementText(code);

					if (!CheckUtils.IsNull(text)) {
						result.push(text);
					} else {
						console.warn('UserEditor.getPasswordRequirementTexts() => requisito no admitido: ' + code);
					}
				}
			} else {
				// Es un 400 por otro motivo: no trae requisitos
			}
		} else {
			// No es un rechazo de los datos
		}

		return result;
	}

	/**
	 * Devuelve el texto de un requisito de la contraseña.
	 * @param code Código del requisito que envía el API.
	 * @returns El texto, o `null` si el código no es de un requisito conocido.
	 */
	private getRequirementText(code: string): string | null {
		let result: string | null = null;

		switch (code) {
			case PasswordRequirement.DIGIT:
				result = this._PASSWORD_DIGIT_TEXT;
				break;
			case PasswordRequirement.LOWERCASE:
				result = this._PASSWORD_LOWERCASE_TEXT;
				break;
			case PasswordRequirement.MIN_LENGTH:
				result = this._PASSWORD_MIN_LENGTH_TEXT;
				break;
			case PasswordRequirement.SYMBOL:
				result = this._PASSWORD_SYMBOL_TEXT;
				break;
			case PasswordRequirement.UPPERCASE:
				result = this._PASSWORD_UPPERCASE_TEXT;
				break;
			default:
				// Quien llama avisa del código desconocido
				break;
		}

		return result;
	}

	/**
	 * Avisa del fallo al guardar: los requisitos de la contraseña junto al campo, el nick repetido o un fallo general.
	 * @param error Fallo de la petición.
	 */
	private handleSaveError(error: unknown): void {
		const requirementTexts: string[] = this.getPasswordRequirementTexts(error);

		if (requirementTexts.length > 0) {
			this.PasswordRequirementTexts = requirementTexts;
			this.HasPasswordRequirements = true;
		} else if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Conflict) {
			this._Notification.Send(this._NICK_EXISTS_TEXT, NotificationLevel.WARNING);
		} else {
			this._Notification.Send(this._SAVE_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`UserEditor.saveUser() => ${ErrorUtils.GetMessage(error)}`);
		}
	}

	/** Carga la lista de usuarios. */
	private async loadUsers(): Promise<void> {
		try {
			const result: TryGetResult<UserDto[]> = await RequestUtils.AwaitRequest(this._DataAccess.Users.GetAll(), this._Canceller);

			if (result.Success) {
				this._Users = (result.Result as UserDto[]).map((dto: UserDto): User => UserMapper.ToModel(dto));
				this.refreshList();
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._LOAD_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`UserEditor.loadUsers() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			// Si no se ha podido cargar, la lista se queda vacía: el editor sigue siendo usable
			this.IsLoadingList = false;
		}
	}

	/**
	 * Abre un usuario en el detalle, sin edición y sin cambios pendientes.
	 * @param user Usuario a abrir. Con `null`, el detalle queda cerrado.
	 */
	private openUser(user: User | null): void {
		this._IsDirty = false;
		this._IsNew = false;
		this._Selected = user;
		this._PendingPassword = null;
		this.Draft = CheckUtils.IsNull(user) ? this.createEmptyUser() : this.cloneUser(user);
		this.HasPasswordRequirements = false;
		this.HasPendingPassword = false;
		this.NameError = false;
		this.NickError = false;
		this.Password = STRING_UNDEFINED;
		this.PasswordError = false;
		this.PasswordMismatchError = false;
		this.PasswordRepeat = STRING_UNDEFINED;
		this.PasswordRequirementTexts = [];
		this.SurnameError = false;
		this.setEditing(false);
		this.refreshList();
	}

	/** Deja calculado lo que la plantilla necesita del usuario abierto. */
	private refreshDetail(): void {
		const isProtected: boolean = !this._IsNew && this.Draft.Nick === PROTECTED_USER_NICK;
		const isSelf: boolean = !CheckUtils.IsNull(this._Selected) && this._Selected.Id === LoggedUserManager.GetUserId();

		this.CanDeleteSelection = !isProtected && !isSelf;
		this.HasDetail = !CheckUtils.IsNull(this._Selected) || this._IsNew;
		this.HasSelection = !CheckUtils.IsNull(this._Selected);
		this.IsNickReadOnly = this.IsReadOnly || !this._IsNew;
		// El rol propio tampoco se cambia: el API cerraría la sesión y, sin el rol de administrador, se perdería el acceso al editor
		this.IsRoleReadOnly = this.IsReadOnly || isProtected || isSelf;
		this.ShowPasswordButton = this.IsEditing && !this._IsNew;
		this.ShowPasswordFields = this.IsEditing && this._IsNew;
	}

	/** Deja calculadas las fichas de la lista: ordenadas por nick y filtradas por el buscador. */
	private refreshList(): void {
		const selectedId: number = CheckUtils.IsNull(this._Selected) ? ID_NUMERIC_UNDEFINED : this._Selected.Id;

		this.ListItems = this._Users
			.filter(
				(user: User): boolean =>
					user.Nick.toLowerCase().includes(this._SearchText) ||
					user.Name.toLowerCase().includes(this._SearchText) ||
					user.Surname.toLowerCase().includes(this._SearchText)
			)
			.sort((a: User, b: User): number => a.Nick.localeCompare(b.Nick))
			.map((user: User): UserListItem => ({
				FullName: `${user.Name} ${user.Surname}`,
				IsSelected: user.Id === selectedId,
				User: user
			}));
		this.HasItems = this.ListItems.length > 0;
	}

	/** Crea o modifica el usuario abierto con los datos del detalle. */
	private async saveUser(): Promise<void> {
		const wasNew: boolean = this._IsNew;

		this.setBusy(true);
		this.HasPasswordRequirements = false;
		this.PasswordRequirementTexts = [];

		try {
			const result: TryGetResult<UserDto> = wasNew
				? await RequestUtils.AwaitRequest(
						this._DataAccess.Users.Add(UserMapper.ToCreationDto(this.Draft, this.Password)),
						this._Canceller
					)
				: await RequestUtils.AwaitRequest(
						this._DataAccess.Users.Update(this.Draft.Id, UserMapper.ToModificationDto(this.Draft, this._PendingPassword)),
						this._Canceller
					);

			if (result.Success) {
				const saved: User = UserMapper.ToModel(result.Result as UserDto);

				this.upsertUser(saved);
				this.openUser(saved);
				this._Notification.Send(wasNew ? this._ADDED_TEXT : this._UPDATED_TEXT, NotificationLevel.SUCCESS);
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this.handleSaveError(error);
		} finally {
			this.setBusy(false);
		}
	}

	/**
	 * Marca si hay un guardado o un borrado en curso. Mientras lo hay, el diálogo no se puede cerrar (ni con Escape ni
	 * pulsando fuera), porque al cerrarse se cancelarían las peticiones.
	 * @param isBusy `true` si hay una operación en curso.
	 */
	private setBusy(isBusy: boolean): void {
		this.IsBusy = isBusy;
		this._DialogRef.disableClose = isBusy;
	}

	/**
	 * Entra o sale del modo edición.
	 * @param isEditing `true` para editar.
	 */
	private setEditing(isEditing: boolean): void {
		this.IsEditing = isEditing;
		this.IsReadOnly = !isEditing;
		this.refreshDetail();
	}

	/**
	 * Añade el usuario a la lista o, si ya estaba, lo sustituye.
	 * @param user Usuario guardado.
	 */
	private upsertUser(user: User): void {
		const index: number = this._Users.findIndex((item: User): boolean => item.Id === user.Id);

		if (index >= 0) {
			this._Users[index] = user;
		} else {
			this._Users.push(user);
		}

		this.refreshList();
	}

	/**
	 * Comprueba que están los datos obligatorios y marca los que faltan.
	 * @returns `true` si se puede guardar.
	 */
	private validate(): boolean {
		this.NickError = CheckUtils.IsEmptyString(this.Draft.Nick);
		this.NameError = CheckUtils.IsEmptyString(this.Draft.Name);
		this.SurnameError = CheckUtils.IsEmptyString(this.Draft.Surname);
		// Los campos de la contraseña solo están al añadir: al modificar, se cambia en el submodal, que ya la comprueba
		this.PasswordError = this._IsNew && CheckUtils.IsEmptyString(this.Password);
		// Solo se avisa de la repetición cuando hay contraseña: si falta, ya se avisa de eso
		this.PasswordMismatchError = this._IsNew && !this.PasswordError && this.Password !== this.PasswordRepeat;

		return !this.NickError && !this.NameError && !this.SurnameError && !this.PasswordError && !this.PasswordMismatchError;
	}

	//#endregion PRIVATE METHODS
}
