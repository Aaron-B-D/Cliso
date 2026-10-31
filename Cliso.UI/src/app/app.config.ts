import {
	ApplicationConfig,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
	provideZoneChangeDetection
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_MENU_DEFAULT_OPTIONS } from '@angular/material/menu';
import { MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';
import { provideRouter } from '@angular/router';

import { routes } from 'src/app/app.routes';
import { AppBootstrapUtils } from 'src/app/core/utils/appBootstrap.utils';

/** Clase de los paneles flotantes (diálogos, menús): les pone el borde de 1 px definido en `_material.scss`. */
const FLOATING_PANEL_CLASS = 'floating-panel';

/** Clase de los tooltips: les pone el borde de 1 px definido en `_material.scss`. */
const FLOATING_TOOLTIP_CLASS = 'floating-tooltip';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(),
		// Angular espera a que termine el arranque antes de crear los componentes
		provideAppInitializer(() => AppBootstrapUtils.Start()),
		{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { panelClass: FLOATING_PANEL_CLASS } },
		{ provide: MAT_MENU_DEFAULT_OPTIONS, useValue: { overlayPanelClass: FLOATING_PANEL_CLASS } },
		{
			provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
			useValue: { hideDelay: 0, showDelay: 0, tooltipClass: FLOATING_TOOLTIP_CLASS, touchendHideDelay: 1500 }
		}
	]
};
