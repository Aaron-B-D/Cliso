import { Temporal } from 'temporal-polyfill';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { type DateInput } from 'src/app/shared/definitions/date.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';

/** Utilidades para trabajar con fechas: cualquier valor que represente una fecha se convierte en una con la que se puede operar. */
export class DateUtils {
	//#region PRIVATE CONSTANTS

	/** Detecta un texto de fecha y hora que termina con una zona horaria (`Z` o un desplazamiento como `+02:00`). */
	private static readonly _HAS_OFFSET_REGEX: RegExp = /T[\d:.]+(Z|[+-]\d{2}(:?\d{2})?)$/i;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte en una fecha con zona horaria (la del navegador, salvo que ya venga con la suya) cualquier valor que
	 * represente una fecha:
	 * - Texto ISO 8601, con fecha y hora (`2026-11-01T00:25:30.123456`), con zona (`...Z`, `...+02:00`) o solo fecha
	 *   (`2026-11-01`). Sin zona, se entiende que es hora local del navegador.
	 * - Número: milisegundos desde 1970.
	 * - `Date` y los tipos de fecha de Temporal.
	 * @param value Valor a convertir.
	 * @returns La fecha, inmutable: cada operación (`add`, `subtract`...) devuelve una nueva.
	 */
	public static Parse(value: DateInput): Temporal.ZonedDateTime {
		const timeZone: string = Temporal.Now.timeZoneId();
		let reason: string = STRING_UNDEFINED;
		let result: Temporal.ZonedDateTime | null = null;

		try {
			if (typeof value === 'string') {
				result = DateUtils.parseString(value.trim(), timeZone);
			} else if (typeof value === 'number') {
				result = Temporal.Instant.fromEpochMilliseconds(value).toZonedDateTimeISO(timeZone);
			} else if (value instanceof Date) {
				result = Temporal.Instant.fromEpochMilliseconds(value.getTime()).toZonedDateTimeISO(timeZone);
			} else if (value instanceof Temporal.ZonedDateTime) {
				result = value;
			} else if (value instanceof Temporal.Instant) {
				result = value.toZonedDateTimeISO(timeZone);
			} else if (value instanceof Temporal.PlainDateTime) {
				result = value.toZonedDateTime(timeZone);
			} else {
				result = value.toZonedDateTime(timeZone);
			}
		} catch (error) {
			reason = ErrorUtils.GetMessage(error);
		}

		if (CheckUtils.IsNull(result)) {
			throw new Error(`DateUtils.Parse() => '${String(value)}' no es una fecha válida: ${reason}`);
		} else {
			// Es una fecha válida
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Convierte un texto ISO 8601 en una fecha. Lanza un error si el texto no lo es.
	 * @param value Texto ya sin espacios por los extremos.
	 * @param timeZone Zona horaria para los textos que no traen la suya.
	 */
	private static parseString(value: string, timeZone: string): Temporal.ZonedDateTime {
		const result: Temporal.ZonedDateTime = DateUtils._HAS_OFFSET_REGEX.test(value)
			? Temporal.Instant.from(value).toZonedDateTimeISO(timeZone)
			: Temporal.PlainDateTime.from(value).toZonedDateTime(timeZone);

		return result;
	}

	//#endregion PRIVATE STATIC METHODS
}
