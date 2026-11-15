//#region ENUMS

/** Parámetros de configuración de la aplicación. Cada valor es el identificador que usa el API. */
enum ApplicationSettingsParameter {
	BIM_MODELS_DIRECTORY = 'BIM_MODELS_DIRECTORY',
	BIM_MODELS_REFRESH_INTERVAL = 'BIM_MODELS_REFRESH_INTERVAL',
	LANGUAGE = 'LANGUAGE',
	SESSION_TIMEOUT_MILLISECONDS = 'SESSION_TIMEOUT_MILLISECONDS'
}

//#endregion ENUMS

//#region TYPES

/** Valor al que recurrir si un parámetro no se puede recuperar del API. El resto de su información llega del API. */
type ApplicationSettingsDefault = {
	/** Identifica de qué parámetro se trata. */
	Parameter: ApplicationSettingsParameter;
	/** Valor por defecto, como texto (cada parámetro lo convierte a su tipo). */
	Value: string;
};

//#endregion TYPES

export { type ApplicationSettingsDefault, ApplicationSettingsParameter };
