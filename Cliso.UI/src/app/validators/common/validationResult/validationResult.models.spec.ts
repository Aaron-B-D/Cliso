import { FileExtensionBrokenRule } from 'src/app/validators/common/brokenRule/fileExtensionBrokenRule.models';
import { RequiredBrokenRule } from 'src/app/validators/common/brokenRule/requiredBrokenRule.models';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';

describe('ValidationResult', () => {
	it('es válido si no tiene reglas rotas', () => {
		const result: ValidationResult = new ValidationResult();

		expect(result.IsValid()).toBeTrue();
	});

	it('no es válido si tiene alguna regla rota', () => {
		const result: ValidationResult = new ValidationResult();

		result.Add(new RequiredBrokenRule('name', 'Nombre'));

		expect(result.IsValid()).toBeFalse();
	});

	it('añade las reglas rotas al final de la lista', () => {
		const result: ValidationResult = new ValidationResult();
		const first: RequiredBrokenRule = new RequiredBrokenRule('name', 'Nombre');
		const second: FileExtensionBrokenRule = new FileExtensionBrokenRule('file', 'modelo.txt', '.ifc');

		result.Add(first);
		result.Add(second);

		expect(result.BrokenRules.length).toBe(2);
		expect(result.BrokenRules[0]).toBe(first);
		expect(result.BrokenRules[1]).toBe(second);
	});

	it('indica si un campo tiene una regla rota', () => {
		const result: ValidationResult = new ValidationResult();

		result.Add(new RequiredBrokenRule('name', 'Nombre'));

		expect(result.HasField('name')).toBeTrue();
	});

	it('no indica una regla rota de un campo que no la tiene', () => {
		const result: ValidationResult = new ValidationResult();

		result.Add(new RequiredBrokenRule('name', 'Nombre'));

		expect(result.HasField('description')).toBeFalse();
	});

	it('devuelve los mensajes de las reglas rotas en el mismo orden', () => {
		const result: ValidationResult = new ValidationResult();

		result.Add(new RequiredBrokenRule('name', 'Nombre'));
		result.Add(new RequiredBrokenRule('description', 'Descripción'));

		expect(result.GetMessages()).toEqual([
			'Nombre: el campo es obligatorio',
			'Descripción: el campo es obligatorio'
		]);
	});
});
