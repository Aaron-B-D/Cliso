import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';
import { BimModelsDirectorySettingsParameter } from 'src/app/shared/models/applicationSettings/bimModelsDirectorySettingsParameter.models';
import { LanguageSettingsParameter } from 'src/app/shared/models/applicationSettings/languageSettingsParameter.models';
import {
	ApplicationSettingsDefault,
	ApplicationSettingsParameter
} from 'src/app/shared/definitions/applicationSettings.definitions';
import { LanguageCode } from 'src/app/shared/definitions/language.definitions';
import { ApplicationSettingsUtils } from 'src/app/shared/utils/applicationSettings/applicationSettings.utils';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
/**
 * Guarda los parámetros de la aplicación. Arranca con los valores por defecto de `ApplicationSettingsUtils` y se
 * actualiza con `SetValue` cuando se recuperan del API.
 */
export class ApplicationSettingsManager {
	//#region PRIVATE CONSTANTS

	/** Carpeta de los modelos BIM que se usa si no se encuentra el parámetro. */
	private static readonly _DEFAULT_BIM_MODELS_DIRECTORY: string = 'data/models';

	//#endregion PRIVATE CONSTANTS

	//#region PRIVATE STATIC PROPERTIES

	/** Un parámetro por cada valor de `ApplicationSettingsParameter`. */
	private static _Parameters: ApplicationSettingsParameterBase[] = ApplicationSettingsManager.createDefaults();

	//#endregion PRIVATE STATIC PROPERTIES

	//#region PUBLIC STATIC METHODS

	/**
	 * Devuelve la carpeta donde el API guarda los ficheros IFC de los modelos BIM.
	 * @returns La carpeta; la de por defecto si no se encuentra el parámetro.
	 */
	public static GetBimModelsDirectory(): string {
		let result: string = ApplicationSettingsManager._DEFAULT_BIM_MODELS_DIRECTORY;
		const parameter: ApplicationSettingsParameterBase | null = ApplicationSettingsManager.GetParameter(
			ApplicationSettingsParameter.BIM_MODELS_DIRECTORY
		);

		if (parameter instanceof BimModelsDirectorySettingsParameter) {
			result = parameter.GetValue();
		} else {
			console.warn('ApplicationSettingsManager.GetBimModelsDirectory() => no se encuentra el parámetro');
		}

		return result;
	}

	/**
	 * Devuelve el código del idioma de la aplicación.
	 * @returns El código del idioma; castellano si no se encuentra el parámetro.
	 */
	public static GetLanguage(): LanguageCode {
		let result: LanguageCode = LanguageCode.ES_ES;
		const parameter: ApplicationSettingsParameterBase | null = ApplicationSettingsManager.GetParameter(
			ApplicationSettingsParameter.LANGUAGE
		);

		if (parameter instanceof LanguageSettingsParameter) {
			result = parameter.GetValue();
		} else {
			console.warn('ApplicationSettingsManager.GetLanguage() => no se encuentra el parámetro');
		}

		return result;
	}

	/**
	 * Devuelve un parámetro de la aplicación.
	 * @param parameter Identifica de qué parámetro se trata.
	 * @returns El parámetro, o `null` si no existe.
	 */
	public static GetParameter(parameter: ApplicationSettingsParameter): ApplicationSettingsParameterBase | null {
		let result: ApplicationSettingsParameterBase | null = null;

		for (const item of ApplicationSettingsManager._Parameters) {
			if (item.Parameter === parameter) {
				result = item;
			} else {
				// No es el parámetro buscado
			}
		}

		return result;
	}

	/**
	 * Cambia el valor de un parámetro.
	 * @param parameter Identifica de qué parámetro se trata.
	 * @param value Nuevo valor, como texto.
	 */
	public static SetValue(parameter: ApplicationSettingsParameter, value: string): void {
		const item: ApplicationSettingsParameterBase | null = ApplicationSettingsManager.GetParameter(parameter);

		if (!CheckUtils.IsNull(item)) {
			item.Value = value;
		} else {
			console.warn('ApplicationSettingsManager.SetValue() => no se encuentra el parámetro ' + parameter);
		}
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Crea los parámetros con sus valores por defecto.
	 * @returns Un parámetro por cada elemento de los valores por defecto.
	 */
	private static createDefaults(): ApplicationSettingsParameterBase[] {
		const result: ApplicationSettingsParameterBase[] = [];

		for (const item of ApplicationSettingsUtils.DEFAULTS) {
			const parameter: ApplicationSettingsParameterBase | null = ApplicationSettingsManager.createParameter(item);

			if (!CheckUtils.IsNull(parameter)) {
				result.push(parameter);
			} else {
				// Ya se ha avisado en createParameter
			}
		}

		return result;
	}

	/**
	 * Crea la clase propia de un parámetro con su valor por defecto (que es también su valor actual hasta que llegue
	 * el del API). Su nombre, descripción y observaciones los pone la propia clase en el idioma activo.
	 * @param item Valor por defecto del parámetro.
	 * @returns El parámetro, o `null` si no hay clase para él.
	 */
	private static createParameter(item: ApplicationSettingsDefault): ApplicationSettingsParameterBase | null {
		let result: ApplicationSettingsParameterBase | null = null;

		switch (item.Parameter) {
			case ApplicationSettingsParameter.BIM_MODELS_DIRECTORY:
				result = new BimModelsDirectorySettingsParameter(item.Value, item.Value);
				break;
			case ApplicationSettingsParameter.LANGUAGE:
				result = new LanguageSettingsParameter(item.Value, item.Value);
				break;
			default:
				console.warn('ApplicationSettingsManager.createParameter() => parámetro sin clase: ' + String(item.Parameter));
				break;
		}

		return result;
	}

	//#endregion PRIVATE STATIC METHODS
}
