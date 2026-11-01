import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppRoute } from 'src/app/shared/definitions/routes.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { SessionManager } from 'src/app/shared/utils/session/sessionManager.utils';

/**
 * Decide si se puede entrar en una ruta protegida: con sesión abierta deja pasar y sin ella lleva al inicio de sesión.
 * Es una función porque así lo exige `CanActivateFn`: es la única función suelta permitida del proyecto, y por eso
 * también es el único sitio, junto con `app.config.ts`, donde se usa `inject()`.
 * @returns `true` si hay sesión abierta; si no, la ruta del inicio de sesión.
 */
export const AuthGuard: CanActivateFn = (): boolean | UrlTree => {
	let result: boolean | UrlTree = true;

	if (CheckUtils.IsNull(SessionManager.GetCurrentSession())) {
		result = inject(Router).parseUrl('/' + AppRoute.LOGIN);
	} else {
		// Hay sesión abierta: puede entrar
	}

	return result;
};
