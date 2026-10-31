import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';

/** Comprobaciones de valores que se hacen a menudo en el front (nulos, indefinidos, vacíos, números, identificadores). */
export class CheckUtils {
	//#region PUBLIC STATIC METHODS

	/**
	 * Comprueba si un texto está vacío o solo tiene espacios.
	 * @param value Texto a comprobar.
	 * @returns `true` si, sin espacios por los extremos, no queda nada.
	 */
	public static IsEmptyString(value: string): boolean {
		return value.trim() === STRING_UNDEFINED;
	}

	/**
	 * Comprueba si un valor es `null`.
	 * @param value Valor a comprobar.
	 * @returns `true` si es `null`.
	 */
	public static IsNull(value: unknown): value is null {
		return value === null;
	}

	/**
	 * Comprueba si un valor es `null` o `undefined`.
	 * @param value Valor a comprobar.
	 * @returns `true` si es `null` o `undefined`.
	 */
	public static IsNullOrUndefined(value: unknown): value is null | undefined {
		return CheckUtils.IsNull(value) || CheckUtils.IsUndefined(value);
	}

	/**
	 * Comprueba si una lista es `null`, `undefined` o (opcionalmente) está vacía.
	 * @param value Lista a comprobar.
	 * @param considerEmptyAsNull Si es `true`, una lista vacía cuenta como nula.
	 * @returns `true` si es `null`, `undefined` o, según la opción, vacía.
	 */
	public static IsNullOrUndefinedArray(value: unknown[] | null | undefined, considerEmptyAsNull: boolean): boolean {
		let result: boolean = false;

		if (CheckUtils.IsNullOrUndefined(value)) {
			result = true;
		} else if (value.length === 0) {
			result = considerEmptyAsNull;
		} else {
			// Tiene elementos
		}

		return result;
	}

	/**
	 * Comprueba si un número es `null`, `undefined` o (opcionalmente) cero.
	 * @param value Número a comprobar.
	 * @param tolerateZero Si es `true`, el cero cuenta como definido.
	 * @returns `true` si es `null`, `undefined` o, si no se tolera, cero.
	 */
	public static IsNullOrUndefinedNumber(value: number | null | undefined, tolerateZero: boolean): boolean {
		let result: boolean = false;

		if (CheckUtils.IsNullOrUndefined(value)) {
			result = true;
		} else if (value === 0) {
			result = !tolerateZero;
		} else {
			// Tiene un valor distinto de cero
		}

		return result;
	}

	/**
	 * Comprueba si un texto es `null`, `undefined` o (opcionalmente) vacío.
	 * @param value Texto a comprobar.
	 * @param tolerateEmpty Si es `true`, el texto vacío cuenta como definido.
	 * @returns `true` si es `null`, `undefined` o, si no se tolera, vacío.
	 */
	public static IsNullOrUndefinedString(value: string | null | undefined, tolerateEmpty: boolean): boolean {
		let result: boolean = false;

		if (CheckUtils.IsNullOrUndefined(value)) {
			result = true;
		} else if (value.length === 0) {
			result = !tolerateEmpty;
		} else {
			// Tiene texto
		}

		return result;
	}

	/**
	 * Comprueba si un valor es un número (y no `NaN`).
	 * @param value Valor a comprobar.
	 * @returns `true` si es de tipo número y no es `NaN`.
	 */
	public static IsNumber(value: unknown): value is number {
		return typeof value === 'number' && !isNaN(value);
	}

	/**
	 * Comprueba si un valor es `undefined`.
	 * @param value Valor a comprobar.
	 * @returns `true` si es `undefined`.
	 */
	public static IsUndefined(value: unknown): value is undefined {
		return value === undefined;
	}

	/**
	 * Comprueba si un identificador numérico es válido: un número que no es el de «sin definir».
	 * @param id Identificador a comprobar.
	 * @returns `true` si es un número distinto de `ID_NUMERIC_UNDEFINED`.
	 */
	public static IsValidNumericId(id: unknown): boolean {
		return CheckUtils.IsNumber(id) && id !== ID_NUMERIC_UNDEFINED;
	}

	//#endregion PUBLIC STATIC METHODS
}
