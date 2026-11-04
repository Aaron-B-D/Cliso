import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';

describe('BimModel', () => {
	it('guarda las observaciones tal como las recibe', () => {
		const model: BimModel = new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10);

		expect(model.Observations).toBe('Observaciones');
	});

	it('considera iguales dos modelos con los mismos datos', () => {
		const first: BimModel = new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10);
		const second: BimModel = new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10);

		expect(first.Equals(second)).toBeTrue();
	});

	it('considera distintos dos modelos con algún dato diferente', () => {
		const first: BimModel = new BimModel(1, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10);
		const second: BimModel = new BimModel(1, 'Otro nombre', 'Descripción', 'Observaciones', 'modelo.ifc', 10);

		expect(first.Equals(second)).toBeFalse();
	});
});
