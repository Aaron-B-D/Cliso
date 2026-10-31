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
		{ Parameter: ApplicationSettingsParameter.LANGUAGE, Value: 'es-ES' }
	];

	//#endregion PUBLIC CONSTANTS
}
