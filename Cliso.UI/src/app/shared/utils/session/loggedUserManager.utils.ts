import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { Permission } from 'src/app/shared/definitions/user.definitions';
import { Session } from 'src/app/shared/models/session/session.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { SessionManager } from 'src/app/shared/utils/session/sessionManager.utils';

/** Responde a lo que la aplicación necesita saber del usuario que ha iniciado sesión: quién es y qué puede hacer. */
export class LoggedUserManager {
	//#region PUBLIC STATIC METHODS

	/**
	 * Devuelve el alias del usuario de la sesión abierta.
	 * @returns El alias, o un texto vacío si no se ha iniciado sesión.
	 */
	public static GetNick(): string {
		const session: Session | null = SessionManager.GetCurrentSession();
		let result: string = STRING_UNDEFINED;

		if (!CheckUtils.IsNull(session)) {
			result = session.Nick;
		} else {
			// Sin sesión no hay alias que mostrar
		}

		return result;
	}

	/**
	 * Devuelve el identificador del usuario de la sesión abierta.
	 * @returns El identificador, o el identificador sin definir si no se ha iniciado sesión.
	 */
	public static GetUserId(): number {
		const session: Session | null = SessionManager.GetCurrentSession();
		let result: number = ID_NUMERIC_UNDEFINED;

		if (!CheckUtils.IsNull(session)) {
			result = session.UserId;
		} else {
			// Sin sesión no hay usuario
		}

		return result;
	}

	/**
	 * Dice si el rol del usuario de la sesión abierta tiene un permiso. Sirve para decidir qué se muestra: el API lo exige igualmente.
	 * @param permission Permiso que se consulta.
	 * @returns `true` si tiene el permiso; `false` si no lo tiene o no se ha iniciado sesión.
	 */
	public static HasPermission(permission: Permission): boolean {
		const session: Session | null = SessionManager.GetCurrentSession();
		let result: boolean = false;

		if (!CheckUtils.IsNull(session)) {
			result = session.Permissions.includes(permission);
		} else {
			// Sin sesión no hay permisos
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
