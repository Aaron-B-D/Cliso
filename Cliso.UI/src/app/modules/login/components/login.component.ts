import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { AppRoute } from 'src/app/shared/definitions/routes.definitions';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { Session } from 'src/app/shared/models/session/session.models';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { SessionManager } from 'src/app/shared/utils/session/sessionManager.utils';

/** Pantalla de inicio de sesión: pide el nick y la contraseña y, si son correctos, lleva a la pantalla principal. */
@Component({
	selector: 'app-login',
	imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy, OnInit {
	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Etiqueta del campo del nick. */
	public readonly NICK_TEXT: string = LanguageManager.GetText('LOGIN_NICK');

	/** Etiqueta del campo de la contraseña. */
	public readonly PASSWORD_TEXT: string = LanguageManager.GetText('LOGIN_PASSWORD');

	/** Texto del botón que inicia sesión. */
	public readonly SUBMIT_TEXT: string = LanguageManager.GetText('LOGIN_SUBMIT');

	/** Título de la pantalla. */
	public readonly TITLE: string = LanguageManager.GetText('LOGIN_TITLE');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Aviso del último intento fallido; vacío si no hay. */
	public ErrorText: string = STRING_UNDEFINED;

	/** Indica si hay un inicio de sesión en curso. */
	public IsLoading: boolean = false;

	/** Alias escrito por el usuario. */
	public Nick: string = STRING_UNDEFINED;

	/** Contraseña escrita por el usuario. */
	public Password: string = STRING_UNDEFINED;

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

	//#endregion PRIVATE METHODS
}
