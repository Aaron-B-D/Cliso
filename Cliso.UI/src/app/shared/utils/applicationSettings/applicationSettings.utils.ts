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
		{ Parameter: ApplicationSettingsParameter.BIM_MODELS_REFRESH_INTERVAL, Value: '30000' },
		{ Parameter: ApplicationSettingsParameter.LANGUAGE, Value: 'es-ES' },
		{ Parameter: ApplicationSettingsParameter.SESSION_TIMEOUT_MILLISECONDS, Value: '1800000' }
	];

	//#endregion PUBLIC CONSTANTS
}
