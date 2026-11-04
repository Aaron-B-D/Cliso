import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';

/** Parámetro del intervalo con el que se comprueba si hay modelos BIM nuevos. */
export class BimModelsRefreshIntervalSettingsParameter extends ApplicationSettingsParameterBase {
	//#region CONSTRUCTOR

	/**
	 * @param defaultValue Intervalo con el que se creó el parámetro, en milisegundos y como texto.
	 * @param value Intervalo, en milisegundos y como texto.
	 */
	constructor(defaultValue: string, value: string) {
		super(
			ApplicationSettingsParameter.BIM_MODELS_REFRESH_INTERVAL,
			'AS_BIM_MODELS_REFRESH_INTERVAL_NAME',
			'AS_BIM_MODELS_REFRESH_INTERVAL_DESCRIPTION',
			'AS_BIM_MODELS_REFRESH_INTERVAL_OBSERVATIONS',
			defaultValue,
			value
		);
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Devuelve el intervalo de comprobación.
	 * @returns El intervalo en milisegundos; el de por defecto si el texto no es un número positivo.
	 */
	public override GetValue(): number {
		let result: number = Number(this.DefaultValue);
		const value: number = Number(this.Value);

		if (Number.isFinite(value) && value > 0) {
			result = value;
		} else {
			console.warn('BimModelsRefreshIntervalSettingsParameter.GetValue() => intervalo no válido: ' + this.Value);
		}

		return result;
	}

	//#endregion PUBLIC METHODS
}
