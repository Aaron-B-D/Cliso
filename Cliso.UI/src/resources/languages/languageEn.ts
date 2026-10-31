import { LanguageBase } from 'src/resources/languages/languageBase.type';

/** Hoja de textos en inglés. */
export class LanguageEn {
	//#region PUBLIC CONSTANTS

	/** Textos en inglés. */
	public static readonly TEXTS: LanguageBase = {
		AS_BIM_MODELS_DIRECTORY_DESCRIPTION:
			'Folder where the IFC files of the BIM models are stored (relative to Cliso.API if not absolute).',
		AS_BIM_MODELS_DIRECTORY_NAME: 'BIM models folder',
		AS_BIM_MODELS_DIRECTORY_OBSERVATIONS:
			'Read when the API starts: a change requires restarting it and files already uploaded are not moved.',
		AS_LANGUAGE_DESCRIPTION: 'Application language, as an international code (for example, en-GB).',
		AS_LANGUAGE_NAME: 'Language',
		AS_LANGUAGE_OBSERVATIONS: 'Supports es-ES, gl-ES and en-GB.',
		HOME_SEARCH_PLACEHOLDER: 'Search models and visualizations',
		SIDEBAR_MENU: 'Menu',
		WEB_HOME: 'Home'
	};

	//#endregion PUBLIC CONSTANTS
}
