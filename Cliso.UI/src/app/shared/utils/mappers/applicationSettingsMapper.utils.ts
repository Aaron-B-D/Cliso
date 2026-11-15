import { ApplicationParameterDto } from 'src/app/shared/definitions/dtos.definitions';
import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';
import { BimModelsDirectorySettingsParameter } from 'src/app/shared/models/applicationSettings/bimModelsDirectorySettingsParameter.models';
import { BimModelsRefreshIntervalSettingsParameter } from 'src/app/shared/models/applicationSettings/bimModelsRefreshIntervalSettingsParameter.models';
import { LanguageSettingsParameter } from 'src/app/shared/models/applicationSettings/languageSettingsParameter.models';
import { SessionTimeoutSettingsParameter } from 'src/app/shared/models/applicationSettings/sessionTimeoutSettingsParameter.models';

/** Convierte los parámetros de la aplicación entre el formato del API y la clase propia de cada parámetro del front. */
export class ApplicationSettingsMapper {
	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte un parámetro que envía el API en la clase propia de ese parámetro.
	 * @param dto Parámetro tal y como lo envía el API.
	 * @returns El parámetro, o `null` si el front no conoce su tipo.
	 */
	public static ToModel(dto: ApplicationParameterDto): ApplicationSettingsParameterBase | null {
		let result: ApplicationSettingsParameterBase | null = null;

		switch (ApplicationSettingsMapper.toParameter(dto.type)) {
			case ApplicationSettingsParameter.BIM_MODELS_DIRECTORY:
				result = new BimModelsDirectorySettingsParameter(dto.default_value, dto.value);
				break;
			case ApplicationSettingsParameter.BIM_MODELS_REFRESH_INTERVAL:
				result = new BimModelsRefreshIntervalSettingsParameter(dto.default_value, dto.value);
				break;
			case ApplicationSettingsParameter.LANGUAGE:
				result = new LanguageSettingsParameter(dto.default_value, dto.value);
				break;
			case ApplicationSettingsParameter.SESSION_TIMEOUT_MILLISECONDS:
				result = new SessionTimeoutSettingsParameter(dto.default_value, dto.value);
				break;
			case null:
				console.warn('ApplicationSettingsMapper.ToModel() => parámetro no admitido: ' + dto.type);
				break;
			default:
				console.warn('ApplicationSettingsMapper.ToModel() => parámetro sin clase: ' + dto.type);
				break;
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Convierte el texto del tipo de un parámetro que envía el API en un parámetro del front.
	 * @param text Tipo del parámetro como texto.
	 * @returns El parámetro, o `null` si el texto no es de un tipo conocido.
	 */
	private static toParameter(text: string): ApplicationSettingsParameter | null {
		let result: ApplicationSettingsParameter | null = null;

		for (const parameter of Object.values(ApplicationSettingsParameter)) {
			if (parameter === text) {
				result = parameter;
			} else {
				// No es este parámetro
			}
		}

		return result;
	}

	//#endregion PRIVATE STATIC METHODS
}
