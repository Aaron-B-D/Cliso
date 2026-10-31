import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import { LanguageCode } from 'src/app/shared/definitions/language.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';

/** Parámetro del idioma de la aplicación. */
export class LanguageSettingsParameter extends ApplicationSettingsParameterBase {
	//#region CONSTRUCTOR

	/**
	 * @param defaultValue Código del idioma con el que se creó el parámetro.
	 * @param value Código del idioma, como texto (por ejemplo, `es-ES`).
	 */
	constructor(defaultValue: string, value: string) {
		super(
			ApplicationSettingsParameter.LANGUAGE,
			'AS_LANGUAGE_NAME',
			'AS_LANGUAGE_DESCRIPTION',
			'AS_LANGUAGE_OBSERVATIONS',
			defaultValue,
			value
		);
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Devuelve el código del idioma, uno de los admitidos.
	 * @returns El código del idioma; castellano si el texto no es de un idioma admitido.
	 */
	public override GetValue(): LanguageCode {
		let result: LanguageCode = LanguageCode.ES_ES;

		switch (this.Value) {
			case LanguageCode.EN_GB:
				result = LanguageCode.EN_GB;
				break;
			case LanguageCode.ES_ES:
				result = LanguageCode.ES_ES;
				break;
			case LanguageCode.GL_ES:
				result = LanguageCode.GL_ES;
				break;
			default:
				console.warn('LanguageSettingsParameter.GetValue() => idioma no admitido: ' + this.Value);
				break;
		}

		return result;
	}

	//#endregion PUBLIC METHODS
}
