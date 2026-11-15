import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

import { AppBootstrapUtils } from 'src/app/core/utils/appBootstrap.utils';
import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { LanguageCode, LanguageOption } from 'src/app/shared/definitions/language.definitions';
import { AppRoute } from 'src/app/shared/definitions/routes.definitions';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { Session } from 'src/app/shared/models/session/session.models';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { LocalStorageManager } from 'src/app/shared/utils/localStorage/localStorageManager.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { SessionManager } from 'src/app/shared/utils/session/sessionManager.utils';

/** Pantalla de inicio de sesión: pide el nick y la contraseña y, si son correctos, lleva a la pantalla principal. */
@Component({
	selector: 'app-login',
	imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy, OnInit {
	//#region PUBLIC PROPERTIES

	/** Aviso del último intento fallido; vacío si no hay. */
	public ErrorText: string = STRING_UNDEFINED;

	/** Indica si hay un inicio de sesión en curso. */
	public IsLoading: boolean = false;

	// Los textos no son constantes: se vuelven a leer al cambiar el idioma con el selector
	/** Etiqueta del selector de idioma. */
	public LanguageText: string = LanguageManager.GetText('LOGIN_LANGUAGE');

	/** Alias escrito por el usuario. */
	public Nick: string = STRING_UNDEFINED;

	/** Etiqueta del campo del nick. */
	public NickText: string = LanguageManager.GetText('LOGIN_NICK');

	/** Idiomas que se ofrecen en el selector, con el nombre de cada uno en su idioma. */
	public Options: LanguageOption[] = LanguageManager.GetOptions();

	/** Contraseña escrita por el usuario. */
	public Password: string = STRING_UNDEFINED;

	/** Etiqueta del campo de la contraseña. */
	public PasswordText: string = LanguageManager.GetText('LOGIN_PASSWORD');

	/** Idioma elegido en el selector. */
	public SelectedLanguage: LanguageCode = LanguageManager.GetCode();

	/** Texto del botón que inicia sesión. */
	public SubmitText: string = LanguageManager.GetText('LOGIN_SUBMIT');

	/** Título de la pantalla. */
	public Title: string = LanguageManager.GetText('LOGIN_TITLE');

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Acceso al API. */
	private readonly _DataAccess: DataAccessService;

	/** Corta las peticiones pendientes al destruir el componente. */
	private readonly _HttpRequestCanceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Navegación entre pantallas. */
	private readonly _Router: Router;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dataAccess Acceso al API.
	 * @param router Navegación entre pantallas.
	 */
	constructor(dataAccess: DataAccessService, router: Router) {
		this._DataAccess = dataAccess;
		this._Router = router;

		if (CheckUtils.IsNull(SessionManager.GetCurrentSession())) {
			// Al volver aquí tras cerrar sesión o caducar, la pantalla recupera su idioma en vez del de la aplicación
			AppBootstrapUtils.SetLoginLanguage();
			this.loadTexts();
		} else {
			// Con sesión se va a la pantalla principal: se mantiene el idioma de la aplicación
		}

		if (SessionManager.TakeExpirationNotice()) {
			this.ErrorText = LanguageManager.GetText('LOGIN_SESSION_EXPIRED');
		} else {
			// Se llega al inicio de sesión sin motivo que explicar
		}
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this._HttpRequestCanceller.Destroy();
	}

	public ngOnInit(): void {
		if (!CheckUtils.IsNull(SessionManager.GetCurrentSession())) {
			// Ya hay una sesión abierta: no tiene sentido pedir las credenciales otra vez
			this._Router.navigateByUrl('/' + AppRoute.HOME).catch((error: unknown): void => {
				console.warn('Login.ngOnInit() => no se ha podido ir a la pantalla principal', error);
			});
		} else {
			// Sin sesión: se muestra el formulario
		}
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	/**
	 * Cambia el idioma de esta pantalla y lo recuerda para la próxima vez. Al entrar, manda el parámetro de la aplicación.
	 * @param event Idioma elegido en el selector.
	 */
	public OnLanguageChanged(event: MatSelectChange): void {
		const code: LanguageCode = event.value as LanguageCode;

		LanguageManager.SetLanguage(code);
		LocalStorageManager.SetLoginLanguage(code);
		this.loadTexts();
	}

	/** Inicia sesión con el nick y la contraseña escritos y, si son correctos, va a la pantalla principal. */
	public async OnSubmit(): Promise<void> {
		this.ErrorText = STRING_UNDEFINED;

		if (CheckUtils.IsEmptyString(this.Nick) || CheckUtils.IsEmptyString(this.Password)) {
			this.ErrorText = LanguageManager.GetText('LOGIN_ERROR_EMPTY');
		} else {
			this.IsLoading = true;

			try {
				const result: TryGetResult<Session> = await RequestUtils.AwaitRequest(
					this._DataAccess.Auth.Login(this.Nick, this.Password),
					this._HttpRequestCanceller
				);

				if (result.Success) {
					// Con la cookie ya puesta se piden los parámetros: la pantalla principal se crea con su idioma
					await AppBootstrapUtils.LoadApplicationSettings(this._DataAccess, this._HttpRequestCanceller);
					SessionManager.SetCurrentSession(result.Result);
					await this._Router.navigateByUrl('/' + AppRoute.HOME);
				} else {
					// Petición cancelada: no hay nada que hacer
				}
			} catch (error) {
				this.ErrorText = this.getErrorText(error);
			} finally {
				this.IsLoading = false;
			}
		}
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Elige el aviso que se muestra según el motivo del fallo.
	 * @param error Fallo de la petición.
	 * @returns El texto del aviso.
	 */
	private getErrorText(error: unknown): string {
		let result: string = LanguageManager.GetText('LOGIN_ERROR_UNEXPECTED');

		if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
			result = LanguageManager.GetText('LOGIN_ERROR_INVALID');
		} else if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.TooManyRequests) {
			result = LanguageManager.GetText('LOGIN_ERROR_TOO_MANY');
		} else {
			console.warn('Login.getErrorText() => fallo al iniciar sesión', error);
		}

		return result;
	}

	/** Vuelve a leer los textos de la pantalla, los idiomas del selector y el elegido, en el idioma actual. */
	private loadTexts(): void {
		this.Options = LanguageManager.GetOptions();
		this.SelectedLanguage = LanguageManager.GetCode();
		this.LanguageText = LanguageManager.GetText('LOGIN_LANGUAGE');
		this.NickText = LanguageManager.GetText('LOGIN_NICK');
		this.PasswordText = LanguageManager.GetText('LOGIN_PASSWORD');
		this.SubmitText = LanguageManager.GetText('LOGIN_SUBMIT');
		this.Title = LanguageManager.GetText('LOGIN_TITLE');
	}

	//#endregion PRIVATE METHODS
}
