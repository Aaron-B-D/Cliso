import { Temporal } from 'temporal-polyfill';

//#region TYPES

/**
 * Todo lo que `DateUtils.Parse` sabe convertir en una fecha: texto ISO 8601 (con o sin zona), milisegundos desde 1970,
 * `Date` y los tipos de fecha de Temporal. Es una unión de tipos a propósito: solo se usa para recibir fechas.
 */
type DateInput =
	| string
	| number
	| Date
	| Temporal.ZonedDateTime
	| Temporal.Instant
	| Temporal.PlainDateTime
	| Temporal.PlainDate;

//#endregion TYPES

export { type DateInput };
