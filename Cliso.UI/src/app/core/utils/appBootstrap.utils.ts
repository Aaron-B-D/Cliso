import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { Session } from 'src/app/shared/models/session/session.models';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { ApplicationSettingsManager } from 'src/app/shared/utils/applicationSettings/applicationSettingsManager.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { SessionManager } from 'src/app/shared/utils/session/sessionManager.utils';

/** Punto de arranque de la aplicación: deja listos el idioma y la sesión antes de pintar la interfaz. */
export class AppBootstrapUtils {
	//#region PUBLIC STATIC METHODS

	/**
	 * Arranca la aplicación: fija el idioma con el parámetro de la aplicación y recupera la sesión abierta, si la hay.
	 * @param dataAccess Acceso al API.
	 * @returns Una promesa que se resuelve al terminar: Angular espera a que termine antes de mostrar la aplicación.
	 */
	public static async Start(dataAccess: DataAccessService): Promise<void> {
		// TODO Aarón https://trello.com/c/VGtyoR8y: ejecutar este arranque tras el inicio de sesión (no al abrir la página) y recuperar del API los parámetros de la aplicación, los modelos BIM y las visualizaciones
		LanguageManager.SetLanguage(ApplicationSettingsManager.GetLanguage());
		await AppBootstrapUtils.restoreSession(dataAccess);
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Pregunta al API si el navegador ya tiene una sesión abierta (la cookie sobrevive a recargar la página) y, si la
	 * hay, la guarda. Sin sesión, la aplicación queda sin ella y el guard lleva al inicio de sesión.
	 * @param dataAccess Acceso al API.
	 */
	private static async restoreSession(dataAccess: DataAccessService): Promise<void> {
		const canceller: HttpRequestCanceller = new HttpRequestCanceller();

		try {
			const result: TryGetResult<Session> = await RequestUtils.AwaitRequest(dataAccess.Auth.GetSession(), canceller);

			if (result.Success) {
				SessionManager.SetCurrentSession(result.Result);
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
				// Sin sesión abierta o caducada: es lo esperable al abrir la página sin haber iniciado sesión
			} else {
				console.warn('AppBootstrapUtils.restoreSession() => no se pudo recuperar la sesión', error);
			}
		} finally {
			canceller.Destroy();
		}
	}

	//#endregion PRIVATE STATIC METHODS
}
