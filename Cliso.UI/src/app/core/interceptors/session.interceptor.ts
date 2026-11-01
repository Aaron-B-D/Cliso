import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

import { AppRoute } from 'src/app/shared/definitions/routes.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { SessionManager } from 'src/app/shared/utils/session/sessionManager.utils';
import { Environment } from 'src/environments/environment';

/**
 * Gestiona la sesión en todas las llamadas al API: envía la cookie de sesión y, si el API responde que la sesión ya no
 * es válida (401), cierra lo abierto y lleva al inicio de sesión. Las llamadas a otras direcciones no se tocan.
 */
@Injectable()
export class SessionInterceptor implements HttpInterceptor {
	//#region PRIVATE PROPERTIES

	/** Servicio de diálogos de Angular Material. */
	private readonly _Dialog: MatDialog;

	/** Navegación entre pantallas. */
	private readonly _Router: Router;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dialog Servicio de diálogos de Angular Material.
	 * @param router Navegación entre pantallas.
	 */
	constructor(dialog: MatDialog, router: Router) {
		this._Dialog = dialog;
		this._Router = router;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const isApiRequest: boolean = request.url.startsWith(Environment.API_URL);
		let apiRequest: HttpRequest<unknown> = request;

		if (isApiRequest) {
			apiRequest = request.clone({ withCredentials: true });
		} else {
			// Otra dirección: se envía tal cual, sin la cookie de la sesión
		}

		return next.handle(apiRequest).pipe(
			catchError((error: unknown): Observable<HttpEvent<unknown>> => {
				if (isApiRequest && error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
					this.expireSession();
				} else {
					// Otro fallo: no tiene que ver con la sesión
				}

				return throwError((): unknown => error);
			})
		);
	}

	//#endregion ANGULAR LIFECYCLE

	//#region PRIVATE METHODS

	/**
	 * Da por caducada la sesión: cierra los diálogos abiertos y lleva al inicio de sesión, que explica el motivo. Solo
	 * actúa si había una sesión abierta: un 401 sin sesión es un inicio de sesión fallido o la comprobación inicial.
	 */
	private expireSession(): void {
		if (!CheckUtils.IsNull(SessionManager.GetCurrentSession())) {
			SessionManager.ExpireSession();
			this._Dialog.closeAll();
			this._Router.navigateByUrl('/' + AppRoute.LOGIN).catch((error: unknown): void => {
				console.warn('SessionInterceptor.expireSession() => no se ha podido ir al inicio de sesión', error);
			});
		} else {
			// Sin sesión abierta no hay nada que caducar
		}
	}

	//#endregion PRIVATE METHODS
}
