import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';

/** Parámetro de la carpeta donde el API guarda los ficheros IFC de los modelos BIM. */
export class BimModelsDirectorySettingsParameter extends ApplicationSettingsParameterBase {
	//#region CONSTRUCTOR

	/**
	 * @param defaultValue Carpeta con la que se creó el parámetro.
	 * @param value Carpeta, como texto.
	 */
	constructor(defaultValue: string, value: string) {
		super(
			ApplicationSettingsParameter.BIM_MODELS_DIRECTORY,
			'AS_BIM_MODELS_DIRECTORY_NAME',
			'AS_BIM_MODELS_DIRECTORY_DESCRIPTION',
			'AS_BIM_MODELS_DIRECTORY_OBSERVATIONS',
			defaultValue,
			value
		);
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Devuelve la carpeta de los modelos BIM.
	 * @returns La carpeta, relativa a Cliso.API si no es absoluta.
	 */
	public override GetValue(): string {
		return this.Value;
	}

	//#endregion PUBLIC METHODS
}
