import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { ValidatorBase } from 'src/app/validators/common/validatorBase/validatorBase.validator';
import { UserForm } from 'src/app/validators/user/userForm.models';

/** Valida el formulario de un usuario y la contraseña nueva de uno existente. */
export class UserFormValidator extends ValidatorBase {
	//#region PUBLIC CONSTANTS

	/** Identificador del campo del nombre. */
	public static readonly NAME: string = 'Name';

	/** Identificador del campo del alias. */
	public static readonly NICK: string = 'Nick';

	/** Identificador del campo de la contraseña. */
	public static readonly PASSWORD: string = 'Password';

	/** Identificador del campo de la repetición de la contraseña. */
	public static readonly PASSWORD_REPEAT: string = 'PasswordRepeat';

	/** Identificador del campo del rol. */
	public static readonly ROLE: string = 'Role';

	/** Identificador del campo de los apellidos. */
	public static readonly SURNAME: string = 'Surname';

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	//#region LANGUAGE TEXTS

	/** Nombre del campo del nombre, como lo ve el usuario. */
	private readonly _NAME_TEXT: string = LanguageManager.GetText('WEB_NAME');

	/** Nombre del campo del alias, como lo ve el usuario. */
	private readonly _NICK_TEXT: string = LanguageManager.GetText('WEB_NICK');

	/** Nombre del campo de la repetición de la contraseña, como lo ve el usuario. */
	private readonly _PASSWORD_REPEAT_TEXT: string = LanguageManager.GetText('WEB_PASSWORD_REPEAT');

	/** Nombre del campo de la contraseña, como lo ve el usuario. */
	private readonly _PASSWORD_TEXT: string = LanguageManager.GetText('WEB_PASSWORD');

	/** Nombre del campo del rol, como lo ve el usuario. */
	private readonly _ROLE_TEXT: string = LanguageManager.GetText('UE_ROLE');

	/** Nombre del campo de los apellidos, como lo ve el usuario. */
	private readonly _SURNAME_TEXT: string = LanguageManager.GetText('UE_SURNAME');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC METHODS

	/**
	 * Valida el formulario de un usuario.
	 * @param form Datos del formulario.
	 * @returns Las reglas rotas: alias, nombre, apellidos y rol obligatorios; si se pide, contraseña obligatoria y repetida igual.
	 */
	public Validate(form: UserForm): ValidationResult {
		const result: ValidationResult = new ValidationResult();

		this.checkRequired(result, UserFormValidator.NICK, this._NICK_TEXT, form.Nick);
		this.checkRequired(result, UserFormValidator.NAME, this._NAME_TEXT, form.Name);
		this.checkRequired(result, UserFormValidator.SURNAME, this._SURNAME_TEXT, form.Surname);
		this.checkRequired(result, UserFormValidator.ROLE, this._ROLE_TEXT, form.Role);

		if (form.RequiresPassword) {
			this.checkPassword(result, form.Password, form.PasswordRepeat);
		} else {
			// La contraseña no se pide: al modificar un usuario se cambia aparte
		}

		return result;
	}

	/**
	 * Valida una contraseña nueva y su repetición.
	 * @param password Contraseña escrita.
	 * @param passwordRepeat Repetición de la contraseña.
	 * @returns Las reglas rotas: contraseña obligatoria y repetida igual.
	 */
	public ValidatePassword(password: string, passwordRepeat: string): ValidationResult {
		const result: ValidationResult = new ValidationResult();

		this.checkPassword(result, password, passwordRepeat);

		return result;
	}

	//#endregion PUBLIC METHODS

	//#region PRIVATE METHODS

	/**
	 * Comprueba que hay contraseña y que la repetición coincide. La repetición solo se comprueba si hay contraseña: si falta, ya se avisa de eso.
	 * @param result Resultado al que se añaden las reglas rotas.
	 * @param password Contraseña escrita.
	 * @param passwordRepeat Repetición de la contraseña.
	 */
	private checkPassword(result: ValidationResult, password: string, passwordRepeat: string): void {
		this.checkRequired(result, UserFormValidator.PASSWORD, this._PASSWORD_TEXT, password);

		if (!CheckUtils.IsEmptyString(password)) {
			this.checkMismatch(
				result,
				UserFormValidator.PASSWORD_REPEAT,
				this._PASSWORD_REPEAT_TEXT,
				this._PASSWORD_TEXT,
				passwordRepeat,
				password
			);
		} else {
			// Sin contraseña no se comprueba la repetición
		}
	}

	//#endregion PRIVATE METHODS
}
