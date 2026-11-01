import { Temporal } from 'temporal-polyfill';

import { DateUtils } from 'src/app/shared/utils/date.utils';

// Las comprobaciones no dependen de la zona horaria de la máquina: comparan instantes o la hora local tal cual se escribió.
describe('DateUtils.Parse', () => {
	const timeZone: string = Temporal.Now.timeZoneId();

	describe('texto ISO 8601', () => {
		it('sin zona, lo entiende como hora local del navegador y conserva los microsegundos', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse('2026-11-01T00:25:30.123456');

			expect(result.toPlainDateTime().toString()).toBe('2026-11-01T00:25:30.123456');
			expect(result.timeZoneId).toBe(timeZone);
		});

		it('con Z, lo interpreta como UTC y lo lleva a la zona del navegador', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse('2026-11-01T00:25:30Z');

			expect(result.toInstant().toString()).toBe('2026-11-01T00:25:30Z');
			expect(result.timeZoneId).toBe(timeZone);
		});

		it('con desplazamiento, respeta el instante', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse('2026-11-01T00:25:30+02:00');

			expect(result.toInstant().toString()).toBe('2026-10-31T22:25:30Z');
		});

		it('solo con fecha, es la medianoche local', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse('2026-11-01');

			expect(result.toPlainDateTime().toString()).toBe('2026-11-01T00:00:00');
		});

		it('ignora los espacios por los extremos', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse('  2026-11-01T10:00:00  ');

			expect(result.toPlainDateTime().toString()).toBe('2026-11-01T10:00:00');
		});
	});

	describe('otros tipos de entrada', () => {
		it('un número son milisegundos desde 1970', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse(1793489181195);

			expect(result.epochMilliseconds).toBe(1793489181195);
		});

		it('un Date conserva el instante', () => {
			const date: Date = new Date(Date.UTC(2026, 10, 1, 10, 30, 0));
			const result: Temporal.ZonedDateTime = DateUtils.Parse(date);

			expect(result.epochMilliseconds).toBe(date.getTime());
		});

		it('un ZonedDateTime se devuelve tal cual, con su zona', () => {
			const zoned: Temporal.ZonedDateTime = Temporal.ZonedDateTime.from('2026-11-01T10:00:00+09:00[Asia/Tokyo]');
			const result: Temporal.ZonedDateTime = DateUtils.Parse(zoned);

			expect(result.equals(zoned)).toBeTrue();
			expect(result.timeZoneId).toBe('Asia/Tokyo');
		});

		it('un Instant conserva el instante y pasa a la zona del navegador', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse(Temporal.Instant.from('2026-11-01T10:00:00Z'));

			expect(result.toInstant().toString()).toBe('2026-11-01T10:00:00Z');
			expect(result.timeZoneId).toBe(timeZone);
		});

		it('un PlainDateTime se entiende como hora local del navegador', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse(Temporal.PlainDateTime.from('2026-11-01T10:00:00'));

			expect(result.toPlainDateTime().toString()).toBe('2026-11-01T10:00:00');
		});

		it('un PlainDate es la medianoche local de ese día', () => {
			const result: Temporal.ZonedDateTime = DateUtils.Parse(Temporal.PlainDate.from('2026-11-01'));

			expect(result.toPlainDateTime().toString()).toBe('2026-11-01T00:00:00');
		});
	});

	describe('valores no válidos', () => {
		it('un texto que no es una fecha lanza un error descriptivo', () => {
			expect(() => DateUtils.Parse('basura')).toThrowError(/DateUtils\.Parse\(\) => 'basura' no es una fecha válida/);
		});

		it('un texto vacío lanza un error', () => {
			expect(() => DateUtils.Parse('')).toThrowError(/no es una fecha válida/);
		});

		it('un Date inválido lanza un error', () => {
			expect(() => DateUtils.Parse(new Date('no es una fecha'))).toThrowError(/no es una fecha válida/);
		});

		it('NaN lanza un error', () => {
			expect(() => DateUtils.Parse(NaN)).toThrowError(/no es una fecha válida/);
		});
	});

	describe('el resultado', () => {
		it('es inmutable: operar con él devuelve otra fecha y no cambia la original', () => {
			const original: Temporal.ZonedDateTime = DateUtils.Parse('2026-11-01T10:00:00');
			const tomorrow: Temporal.ZonedDateTime = original.add({ days: 1 });

			expect(tomorrow.toPlainDate().toString()).toBe('2026-11-02');
			expect(original.toPlainDate().toString()).toBe('2026-11-01');
		});
	});
});
