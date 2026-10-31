import { LanguageBase } from 'src/resources/languages/languageBase.type';

/** Hoja de textos en gallego. */
export class LanguageGl {
	//#region PUBLIC CONSTANTS

	/** Textos en gallego. */
	public static readonly TEXTS: LanguageBase = {
		AS_BIM_MODELS_DIRECTORY_DESCRIPTION:
			'Cartafol onde se gardan os ficheiros IFC dos modelos BIM (relativo a Cliso.API se non é absoluto).',
		AS_BIM_MODELS_DIRECTORY_NAME: 'Cartafol de modelos BIM',
		AS_BIM_MODELS_DIRECTORY_OBSERVATIONS:
			'Lese ao arrancar a API: un cambio require reiniciala e os ficheiros xa subidos non se moven.',
		AS_LANGUAGE_DESCRIPTION: 'Idioma da aplicación, como código internacional (por exemplo, gl-ES).',
		AS_LANGUAGE_NAME: 'Idioma',
		AS_LANGUAGE_OBSERVATIONS: 'Admite es-ES, gl-ES e en-GB.',
		HOME_SEARCH_PLACEHOLDER: 'Buscar modelos e visualizacións',
		SIDEBAR_MENU: 'Menú',
		WEB_HOME: 'Inicio'
	};

	//#endregion PUBLIC CONSTANTS
}
