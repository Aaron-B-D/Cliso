import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { ApplicationSettingsValidator } from 'src/app/validators/applicationSettings/applicationSettings.validator';

describe('ApplicationSettingsValidator', () => {
	const validator: ApplicationSettingsValidator = new ApplicationSettingsValidator();

	describe('ValidateNumber', () => {
		it('acepta un entero dentro del rango', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', '5', 1, 10);

			expect(result.IsValid()).toBeTrue();
		});

		it('acepta el mínimo y el máximo, que están incluidos', () => {
			const minResult: ValidationResult = validator.ValidateNumber('Parámetro', '1', 1, 10);
			const maxResult: ValidationResult = validator.ValidateNumber('Parámetro', '10', 1, 10);

			expect(minResult.IsValid()).toBeTrue();
			expect(maxResult.IsValid()).toBeTrue();
		});

		it('acepta negativos dentro del rango', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', '-3', -5, 0);

			expect(result.IsValid()).toBeTrue();
		});

		it('rompe el rango por debajo del mínimo', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', '0', 1, 10);

			expect(result.HasField(ApplicationSettingsValidator.VALUE)).toBeTrue();
			expect(result.BrokenRules[0].Type).toBe(BrokenRuleType.OUT_OF_RANGE);
		});

		it('rompe el rango por encima del máximo', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', '11', 1, 10);

			expect(result.HasField(ApplicationSettingsValidator.VALUE)).toBeTrue();
			expect(result.BrokenRules[0].Type).toBe(BrokenRuleType.OUT_OF_RANGE);
			expect(result.GetMessages()).toEqual(['Parámetro: se esperaba un valor entre 1 y 10 y se ha introducido 11']);
		});

		it('con máximo null acepta cualquier entero, sin comprobar el rango', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', '999999', 1, null);

			expect(result.IsValid()).toBeTrue();
		});

		it('rompe si el valor no es un número', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', 'abc', 1, 10);

			expect(result.BrokenRules.length).toBe(1);
			expect(result.BrokenRules[0].Type).toBe(BrokenRuleType.NOT_A_NUMBER);
		});

		it('rompe si el valor es decimal, porque solo se admiten enteros', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', '2.5', 1, 10);

			expect(result.BrokenRules[0].Type).toBe(BrokenRuleType.NOT_A_NUMBER);
		});

		it('rompe si el valor está vacío, sin comprobar el rango', () => {
			const result: ValidationResult = validator.ValidateNumber('Parámetro', STRING_UNDEFINED, 1, 10);

			expect(result.BrokenRules.length).toBe(1);
			expect(result.BrokenRules[0].Type).toBe(BrokenRuleType.NOT_A_NUMBER);
		});
	});

	describe('ValidateRequiredText', () => {
		it('rompe si el texto está vacío', () => {
			const result: ValidationResult = validator.ValidateRequiredText('Parámetro', STRING_UNDEFINED);

			expect(result.HasField(ApplicationSettingsValidator.VALUE)).toBeTrue();
		});

		it('rompe si el texto son solo espacios', () => {
			const result: ValidationResult = validator.ValidateRequiredText('Parámetro', '   ');

			expect(result.HasField(ApplicationSettingsValidator.VALUE)).toBeTrue();
		});

		it('acepta un texto con contenido', () => {
			const result: ValidationResult = validator.ValidateRequiredText('Parámetro', 'Valor');

			expect(result.IsValid()).toBeTrue();
		});
	});
});
