import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Pantalla principal de la aplicación: el buscador de modelos y visualizaciones. */
@Component({
	selector: 'app-home',
	imports: [MatFormFieldModule, MatInputModule],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss'
})
export class HomeComponent {
	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Texto de ayuda del buscador. */
	public readonly SEARCH_PLACEHOLDER: string = LanguageManager.GetText('HOME_SEARCH_PLACEHOLDER');

	/** Título de la pantalla, oculto visualmente. */
	public readonly TITLE: string = LanguageManager.GetText('WEB_HOME');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono del buscador. */
	public SearchIcon: string = IconsUtils.GetUrl(IconName.SEARCH);

	//#endregion PUBLIC PROPERTIES
}
