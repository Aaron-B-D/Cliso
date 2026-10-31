import { User } from 'src/app/shared/models/user/user.models';
import { ApplicationSettingsManager } from 'src/app/shared/utils/applicationSettings/applicationSettingsManager.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { UserManager } from 'src/app/shared/utils/user/userManager.utils';

/** Punto de arranque de la aplicación: deja listos el idioma y el usuario antes de pintar la interfaz. */
export class AppBootstrapUtils {
	//#region PRIVATE CONSTANTS

	/** Identificador del usuario por defecto. */
	private static readonly _DEFAULT_USER_ID: number = 1;

	/** Nombre del usuario por defecto. */
	private static readonly _DEFAULT_USER_NAME: string = 'Admin';

	/** Alias del usuario por defecto. */
	private static readonly _DEFAULT_USER_NICK: string = 'admin';

	/** Apellidos del usuario por defecto. */
	private static readonly _DEFAULT_USER_SURNAME: string = 'Demo Cliso';

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC STATIC METHODS

	/**
	 * Arranca la aplicación: fija el idioma con el parámetro de la aplicación y establece el usuario por defecto,
	 * porque aún no hay inicio de sesión.
	 * @returns Una promesa ya resuelta: Angular espera a que termine antes de mostrar la aplicación.
	 */
	public static Start(): Promise<void> {
		// TODO Aarón https://trello.com/c/VGtyoR8y: ejecutar este arranque tras el inicio de sesión (no al abrir la página) y recuperar del API los parámetros de la aplicación, los modelos BIM y las visualizaciones
		LanguageManager.SetLanguage(ApplicationSettingsManager.GetLanguage());
		UserManager.SetCurrentUser(
			new User(
				AppBootstrapUtils._DEFAULT_USER_ID,
				AppBootstrapUtils._DEFAULT_USER_NICK,
				AppBootstrapUtils._DEFAULT_USER_NAME,
				AppBootstrapUtils._DEFAULT_USER_SURNAME
			)
		);

		return Promise.resolve();
	}

	//#endregion PUBLIC STATIC METHODS
}
