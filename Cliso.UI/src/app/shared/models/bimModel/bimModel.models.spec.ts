import { Temporal } from 'temporal-polyfill';

import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';

describe('BimModel', () => {
	it('convierte al instante la fecha de creación que recibe como texto', () => {
		const model: BimModel = new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10, '2026-11-01T00:25:30.5');
		const creationDate: Temporal.ZonedDateTime | null = model.CreationDate;

		expect(creationDate).not.toBeNull();
		expect(creationDate?.toPlainDateTime().toString()).toBe('2026-11-01T00:25:30.5');
	});

	it('deja la fecha de creación a null si no se la da', () => {
		const model: BimModel = new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10, null);

		expect(model.CreationDate).toBeNull();
	});

	it('guarda las observaciones tal como las recibe', () => {
		const model: BimModel = new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10, null);

		expect(model.Observations).toBe('Observaciones');
	});

	it('lanza un error si la fecha de creación no es válida', () => {
		expect(() => new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10, 'basura')).toThrowError(
			/no es una fecha válida/
		);
	});
});
