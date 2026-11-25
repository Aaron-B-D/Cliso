import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { BimModelValidator } from 'src/app/validators/bimModel/bimModel.validator';

describe('BimModelValidator', () => {
	const validator: BimModelValidator = new BimModelValidator();

	describe('Validate', () => {
		it('rompe el campo del nombre si el nombre está vacío', () => {
			const model: BimModel = new BimModel(ID_NUMERIC_UNDEFINED, STRING_UNDEFINED, 'Descripción', 'Observaciones', 'modelo.ifc', 10);

			const result: ValidationResult = validator.Validate(model);

			expect(result.IsValid()).toBeFalse();
			expect(result.HasField(BimModelValidator.NAME)).toBeTrue();
		});

		it('rompe el campo del nombre si el nombre son solo espacios', () => {
			const model: BimModel = new BimModel(ID_NUMERIC_UNDEFINED, '   ', 'Descripción', 'Observaciones', 'modelo.ifc', 10);

			const result: ValidationResult = validator.Validate(model);

			expect(result.HasField(BimModelValidator.NAME)).toBeTrue();
		});

		it('no rompe reglas si el nombre tiene texto', () => {
			const model: BimModel = new BimModel(ID_NUMERIC_UNDEFINED, 'Modelo', 'Descripción', 'Observaciones', 'modelo.ifc', 10);

			const result: ValidationResult = validator.Validate(model);

			expect(result.IsValid()).toBeTrue();
			expect(result.BrokenRules.length).toBe(0);
		});

		it('acepta un modelo sin fichero, porque el fichero se puede subir más tarde', () => {
			const model: BimModel = new BimModel(ID_NUMERIC_UNDEFINED, 'Modelo', 'Descripción', 'Observaciones', STRING_UNDEFINED, 0);

			const result: ValidationResult = validator.Validate(model);

			expect(result.IsValid()).toBeTrue();
		});
	});

	describe('ValidateFile', () => {
		it('acepta un fichero con la extensión .ifc', () => {
			const result: ValidationResult = validator.ValidateFile('modelo.ifc', '.ifc');

			expect(result.IsValid()).toBeTrue();
		});

		it('acepta la extensión en mayúsculas', () => {
			const result: ValidationResult = validator.ValidateFile('MODELO.IFC', '.ifc');

			expect(result.IsValid()).toBeTrue();
		});

		it('rechaza un fichero con otra extensión', () => {
			const result: ValidationResult = validator.ValidateFile('plano.dwg', '.ifc');

			expect(result.IsValid()).toBeFalse();
			expect(result.BrokenRules.length).toBe(1);
			expect(result.BrokenRules[0].Type).toBe(BrokenRuleType.FILE_EXTENSION);
			expect(result.HasField(BimModelValidator.FILE)).toBeTrue();
			expect(result.GetMessages()).toEqual(['El fichero «plano.dwg» no es un fichero reconocido (se esperaba .ifc)']);
		});
	});
});
