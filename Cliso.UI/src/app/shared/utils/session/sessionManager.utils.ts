import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { Session } from 'src/app/shared/models/session/session.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Guarda la sesión abierta para poder consultarla desde cualquier parte de la aplicación. */
export class SessionManager {
	//#region PRIVATE STATIC PROPERTIES

	/** Sesión abierta; `null` mientras no se ha iniciado sesión. */
	private static _CurrentSession: Session | null = null;

	/** `true` si la última sesión se cerró por caducidad y todavía no se ha avisado al usuario. */
	private static _IsExpirationPending: boolean = false;

	//#endregion PRIVATE STATIC PROPERTIES

	//#region PUBLIC STATIC METHODS

	/** Cierra la sesión porque el API la ha dado por caducada, y deja anotado que hay que avisar al usuario. */
	public static ExpireSession(): void {
		SessionManager._CurrentSession = null;
		SessionManager._IsExpirationPending = true;
	}

	/**
	 * Devuelve la sesión abierta.
	 * @returns La sesión, o `null` si no se ha iniciado sesión.
	 */
	public static GetCurrentSession(): Session | null {
		return SessionManager._CurrentSession;
	}

	/**
	 * Devuelve el alias del usuario de la sesión abierta.
	 * @returns El alias, o un texto vacío si no se ha iniciado sesión.
	 */
	public static GetNick(): string {
		let result: string = STRING_UNDEFINED;

		if (!CheckUtils.IsNull(SessionManager._CurrentSession)) {
			result = SessionManager._CurrentSession.Nick;
		} else {
			// Sin sesión no hay alias que mostrar
		}

		return result;
	}

	/**
	 * Establece la sesión abierta.
	 * @param session La sesión, o `null` para dejar la aplicación sin sesión.
	 */
	public static SetCurrentSession(session: Session | null): void {
		SessionManager._CurrentSession = session;
	}

	/**
	 * Dice si hay que avisar al usuario de que su sesión caducó, y lo da por avisado.
	 * @returns `true` la primera vez que se pregunta tras una caducidad; después, `false`.
	 */
	public static TakeExpirationNotice(): boolean {
		const result: boolean = SessionManager._IsExpirationPending;
		SessionManager._IsExpirationPending = false;

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
