import { LanguageBase } from 'src/resources/languages/languageBase.type';

/** Hoja de textos en castellano. */
export class LanguageEs {
	//#region PUBLIC CONSTANTS

	/** Textos en castellano. */
	public static readonly TEXTS: LanguageBase = {
		AS_BIM_MODELS_DIRECTORY_DESCRIPTION:
			'Carpeta donde se guardan los ficheros IFC de los modelos BIM (relativa a Cliso.API si no es absoluta).',
		AS_BIM_MODELS_DIRECTORY_NAME: 'Carpeta de modelos BIM',
		AS_BIM_MODELS_DIRECTORY_OBSERVATIONS:
			'Se lee al arrancar la API: un cambio requiere reiniciarla y los ficheros ya subidos no se mueven.',
		AS_LANGUAGE_DESCRIPTION: 'Idioma de la aplicación, como código internacional (por ejemplo, es-ES).',
		AS_LANGUAGE_NAME: 'Idioma',
		AS_LANGUAGE_OBSERVATIONS: 'Admite es-ES, gl-ES y en-GB.',
		HOME_SEARCH_PLACEHOLDER: 'Buscar modelos y visualizaciones',
		SIDEBAR_MENU: 'Menú',
		WEB_HOME: 'Inicio'
	};

	//#endregion PUBLIC CONSTANTS
}
