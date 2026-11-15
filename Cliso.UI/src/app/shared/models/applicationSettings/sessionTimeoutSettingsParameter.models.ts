import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';

/** Parámetro del tiempo de inactividad tras el cual caduca la sesión de un usuario. */
export class SessionTimeoutSettingsParameter extends ApplicationSettingsParameterBase {
	//#region PUBLIC CONSTANTS

	/** Tiempo máximo, en milisegundos: 1 año (365 días). */
	public static readonly MAX_VALUE: number = 31536000000;

	/** Tiempo mínimo, en milisegundos. */
	public static readonly MIN_VALUE: number = 1;

	//#endregion PUBLIC CONSTANTS

	//#region CONSTRUCTOR

	/**
	 * @param defaultValue Tiempo con el que se creó el parámetro, en milisegundos y como texto.
	 * @param value Tiempo, en milisegundos y como texto.
	 */
	constructor(defaultValue: string, value: string) {
		super(
			ApplicationSettingsParameter.SESSION_TIMEOUT_MILLISECONDS,
			'AS_SESSION_TIMEOUT_NAME',
			'AS_SESSION_TIMEOUT_DESCRIPTION',
			'AS_SESSION_TIMEOUT_OBSERVATIONS',
			defaultValue,
			value
		);
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Devuelve el tiempo de caducidad de la sesión.
	 * @returns El tiempo en milisegundos; el de por defecto si el texto no es un número entre el mínimo y el máximo.
	 */
	public override GetValue(): number {
		let result: number = Number(this.DefaultValue);
		const value: number = Number(this.Value);

		if (
			Number.isFinite(value) &&
			value >= SessionTimeoutSettingsParameter.MIN_VALUE &&
			value <= SessionTimeoutSettingsParameter.MAX_VALUE
		) {
			result = value;
		} else {
			console.warn('SessionTimeoutSettingsParameter.GetValue() => tiempo no válido: ' + this.Value);
		}

		return result;
	}

	//#endregion PUBLIC METHODS
}
