import { Routes } from '@angular/router';

import { AuthGuard } from 'src/app/core/guards/authGuard.guard';
import { HomeComponent } from 'src/app/modules/home/components/home.component';
import { AppRoute } from 'src/app/shared/definitions/routes.definitions';

/**
 * Rutas de la aplicación. Para añadir una pantalla: su valor en `AppRoute` y una línea aquí (antes de la ruta
 * comodín). Las pantallas protegidas llevan `canActivate: [AuthGuard]`.
 */
export const routes: Routes = [
	{ path: '', redirectTo: AppRoute.HOME, pathMatch: 'full' },
	{ path: AppRoute.HOME, component: HomeComponent, canActivate: [AuthGuard] },
	{ path: '**', redirectTo: AppRoute.HOME }
];
