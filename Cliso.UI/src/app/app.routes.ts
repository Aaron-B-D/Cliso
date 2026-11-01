import { Routes } from '@angular/router';

import { AuthGuard } from 'src/app/core/guards/authGuard.guard';
import { HomeComponent } from 'src/app/modules/home/components/home.component';
import { LoginComponent } from 'src/app/modules/login/components/login.component';
import { MainLayoutComponent } from 'src/app/modules/mainLayout/components/mainLayout.component';
import { AppRoute } from 'src/app/shared/definitions/routes.definitions';

/**
 * Rutas de la aplicación. El inicio de sesión va aparte y las pantallas con sesión van dentro de
 * `MainLayoutComponent` (la barra lateral y el contenido), protegidas por `AuthGuard`. Para añadir una pantalla con
 * sesión: su valor en `AppRoute` y una línea en los hijos de `MainLayoutComponent` (antes de la ruta comodín).
 */
export const routes: Routes = [
	{ path: AppRoute.LOGIN, component: LoginComponent },
	{
		path: '',
		component: MainLayoutComponent,
		canActivate: [AuthGuard],
		children: [
			{ path: '', redirectTo: AppRoute.HOME, pathMatch: 'full' },
			{ path: AppRoute.HOME, component: HomeComponent }
		]
	},
	{ path: '**', redirectTo: AppRoute.HOME }
];
