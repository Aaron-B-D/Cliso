import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { User } from 'src/app/shared/models/user/user.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Guarda el usuario actual para poder mostrarlo o consultarlo desde cualquier parte de la aplicación. */
export class UserManager {
	//#region PRIVATE STATIC PROPERTIES

	/** Usuario actual; `null` mientras no se ha establecido. */
	private static _CurrentUser: User | null = null;

	//#endregion PRIVATE STATIC PROPERTIES

	//#region PUBLIC STATIC METHODS

	/**
	 * Devuelve el usuario actual.
	 * @returns El usuario, o `null` si no se ha establecido.
	 */
	public static GetCurrentUser(): User | null {
		return UserManager._CurrentUser;
	}

	/**
	 * Devuelve el nombre y los apellidos del usuario actual.
	 * @returns El nombre completo, o un texto vacío si no hay usuario.
	 */
	public static GetFullName(): string {
		let result: string = STRING_UNDEFINED;

		if (!CheckUtils.IsNull(UserManager._CurrentUser)) {
			result = UserManager._CurrentUser.Name + ' ' + UserManager._CurrentUser.Surname;
		} else {
			// Sin usuario no hay nombre que mostrar
		}

		return result;
	}

	/**
	 * Establece el usuario actual.
	 * @param user El usuario.
	 */
	public static SetCurrentUser(user: User): void {
		UserManager._CurrentUser = user;
	}

	//#endregion PUBLIC STATIC METHODS
}
