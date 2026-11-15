import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

import { LanguageCode } from 'src/app/shared/definitions/language.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { Session } from 'src/app/shared/models/session/session.models';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { ApplicationSettingsManager } from 'src/app/shared/utils/applicationSettings/applicationSettingsManager.utils';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { LocalStorageManager } from 'src/app/shared/utils/localStorage/localStorageManager.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { SessionManager } from 'src/app/shared/utils/session/sessionManager.utils';

/** Punto de arranque de la aplicación: deja listos el idioma y la sesión antes de pintar la interfaz. */
export class AppBootstrapUtils {
	//#region PUBLIC STATIC METHODS

	/**
	 * Recupera del API los parámetros de la aplicación, los guarda y fija el idioma con el suyo. Necesita una sesión
	 * abierta. Si falla, lo deja en la consola y la aplicación sigue con los valores por defecto.
	 * @param dataAccess Acceso al API.
	 * @param canceller Corta la petición si quien la pide se destruye.
	 */
	public static async LoadApplicationSettings(dataAccess: DataAccessService, canceller: HttpRequestCanceller): Promise<void> {
		try {
			const result: TryGetResult<ApplicationSettingsParameterBase[]> = await RequestUtils.AwaitRequest(
				dataAccess.ApplicationSettings.GetAll(),
				canceller
			);

			if (result.Success) {
				ApplicationSettingsManager.SetParameters(result.Result as ApplicationSettingsParameterBase[]);
				LanguageManager.SetLanguage(ApplicationSettingsManager.GetLanguage());
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			console.warn('AppBootstrapUtils.LoadApplicationSettings() => no se pudieron recuperar los parámetros', error);
		}
	}

	/** Fija el idioma antes de iniciar sesión: el que se eligió la última vez en el inicio de sesión o, si no hay ninguno, el del navegador. */
	public static SetLoginLanguage(): void {
		const stored: LanguageCode | null = LocalStorageManager.GetLoginLanguage();

		if (CheckUtils.IsNull(stored)) {
			LanguageManager.SetLanguage(LanguageManager.GetBrowserLanguage());
		} else {
			LanguageManager.SetLanguage(stored);
		}
	}

	/**
	 * Arranca la aplicación: recupera la sesión abierta, si la hay, y con ella los parámetros de la aplicación.
	 * @param dataAccess Acceso al API.
	 * @returns Una promesa que se resuelve al terminar: Angular espera a que termine antes de mostrar la aplicación.
	 */
	public static async Start(dataAccess: DataAccessService): Promise<void> {
		// Hasta tener los parámetros de la aplicación (que se piden con la sesión), se usa el idioma elegido en el inicio de sesión o el del navegador
		AppBootstrapUtils.SetLoginLanguage();
		await AppBootstrapUtils.restoreSession(dataAccess);

		if (!CheckUtils.IsNull(SessionManager.GetCurrentSession())) {
			const canceller: HttpRequestCanceller = new HttpRequestCanceller();

			await AppBootstrapUtils.LoadApplicationSettings(dataAccess, canceller);
			canceller.Destroy();
		} else {
			// Sin sesión no se pueden pedir los parámetros: se recuperarán al iniciarla
		}
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
