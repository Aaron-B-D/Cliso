import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { AppRoute } from 'src/app/shared/definitions/routes.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { UserManager } from 'src/app/shared/utils/user/userManager.utils';

/** Barra lateral de navegación: el botón de inicio y, abajo, el usuario actual. */
@Component({
	selector: 'app-sidebar',
	imports: [MatButtonModule, MatListModule, MatMenuModule, MatTooltipModule, RouterLink, RouterLinkActive],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Texto del botón de inicio. */
	public readonly HOME_TEXT: string = LanguageManager.GetText('WEB_HOME');

	/** Nombre accesible del botón que despliega el menú en móvil. */
	public readonly MENU_TEXT: string = LanguageManager.GetText('SIDEBAR_MENU');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono del botón de inicio. */
	public HomeIcon: string = IconsUtils.GetUrl(IconName.HOME);

	/** Ruta a la que lleva el botón de inicio. */
	public HomeRoute: string = '/' + AppRoute.HOME;

	/** Icono del botón que despliega el menú en móvil. */
	public MenuIcon: string = IconsUtils.GetUrl(IconName.MENU);

	/** Icono del usuario. */
	public UserIcon: string = IconsUtils.GetUrl(IconName.USER);

	/** Nombre completo del usuario actual. */
	public UserName: string = UserManager.GetFullName();

	//#endregion PUBLIC PROPERTIES
}
