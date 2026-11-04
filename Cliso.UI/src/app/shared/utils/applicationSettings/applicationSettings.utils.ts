import {
	ApplicationSettingsDefault,
	ApplicationSettingsParameter
} from 'src/app/shared/definitions/applicationSettings.definitions';

/** Valores por defecto de los parámetros de la aplicación, que se usan mientras no se recuperan del API. */
export class ApplicationSettingsUtils {
	//#region PUBLIC CONSTANTS

	/** Un elemento por cada valor de `ApplicationSettingsParameter`. */
	public static readonly DEFAULTS: ApplicationSettingsDefault[] = [
		{ Parameter: ApplicationSettingsParameter.BIM_MODELS_DIRECTORY, Value: 'data/models' },
		// TODO Aarón https://trello.com/c/VGtyoR8y: este valor es simulado, porque el front aún no recupera los parámetros del API; cuando se conecte esa recuperación, el intervalo de refresco de los modelos debe leerse de ahí (si no se hace ya)
		{ Parameter: ApplicationSettingsParameter.BIM_MODELS_REFRESH_INTERVAL, Value: '30000' },
		{ Parameter: ApplicationSettingsParameter.LANGUAGE, Value: 'es-ES' }
	];

	//#endregion PUBLIC CONSTANTS
}
