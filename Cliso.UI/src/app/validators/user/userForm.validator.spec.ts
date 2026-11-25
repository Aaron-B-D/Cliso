import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { UserRole } from 'src/app/shared/definitions/user.definitions';
import { UserForm } from 'src/app/validators/user/userForm.models';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { UserFormValidator } from 'src/app/validators/user/userForm.validator';

describe('UserFormValidator', () => {
	const validator: UserFormValidator = new UserFormValidator();

	describe('Validate', () => {
		it('rompe alias, nombre, apellidos y rol si están vacíos', () => {
			// Un rol sin elegir llega como texto vacío
			const form: UserForm = new UserForm(STRING_UNDEFINED, STRING_UNDEFINED, STRING_UNDEFINED, '' as UserRole, false);

			const result: ValidationResult = validator.Validate(form);

			expect(result.HasField(UserFormValidator.NICK)).toBeTrue();
			expect(result.HasField(UserFormValidator.NAME)).toBeTrue();
			expect(result.HasField(UserFormValidator.SURNAME)).toBeTrue();
			expect(result.HasField(UserFormValidator.ROLE)).toBeTrue();
			expect(result.BrokenRules.length).toBe(4);
		});

		it('rompe alias, nombre y apellidos si son solo espacios', () => {
			const form: UserForm = new UserForm('  ', '  ', '  ', UserRole.VIEWER, false);

			const result: ValidationResult = validator.Validate(form);

			expect(result.HasField(UserFormValidator.NICK)).toBeTrue();
			expect(result.HasField(UserFormValidator.NAME)).toBeTrue();
			expect(result.HasField(UserFormValidator.SURNAME)).toBeTrue();
			expect(result.HasField(UserFormValidator.ROLE)).toBeFalse();
		});

		it('no rompe reglas con los datos obligatorios y sin contraseña requerida', () => {
			const form: UserForm = new UserForm('alias', 'Nombre', 'Apellidos', UserRole.VIEWER, false);

			const result: ValidationResult = validator.Validate(form);

			expect(result.IsValid()).toBeTrue();
		});

		it('exige la contraseña si RequiresPassword es true', () => {
			const form: UserForm = new UserForm('alias', 'Nombre', 'Apellidos', UserRole.ADMIN, true, STRING_UNDEFINED, STRING_UNDEFINED);

			const result: ValidationResult = validator.Validate(form);

			expect(result.HasField(UserFormValidator.PASSWORD)).toBeTrue();
		});

		it('no comprueba la repetición si falta la contraseña', () => {
			const form: UserForm = new UserForm('alias', 'Nombre', 'Apellidos', UserRole.ADMIN, true, STRING_UNDEFINED, 'Clave1');

			const result: ValidationResult = validator.Validate(form);

			expect(result.HasField(UserFormValidator.PASSWORD)).toBeTrue();
			expect(result.HasField(UserFormValidator.PASSWORD_REPEAT)).toBeFalse();
		});

		it('rompe la repetición si no coincide con la contraseña', () => {
			const form: UserForm = new UserForm('alias', 'Nombre', 'Apellidos', UserRole.OPERATOR, true, 'Clave1', 'Clave2');

			const result: ValidationResult = validator.Validate(form);

			expect(result.HasField(UserFormValidator.PASSWORD_REPEAT)).toBeTrue();
			expect(result.HasField(UserFormValidator.PASSWORD)).toBeFalse();
		});

		it('no rompe reglas si la contraseña y su repetición coinciden', () => {
			const form: UserForm = new UserForm('alias', 'Nombre', 'Apellidos', UserRole.OPERATOR, true, 'Clave1', 'Clave1');

			const result: ValidationResult = validator.Validate(form);

			expect(result.IsValid()).toBeTrue();
		});

		it('ignora una contraseña distinta de su repetición si la contraseña no es requerida', () => {
			const form: UserForm = new UserForm('alias', 'Nombre', 'Apellidos', UserRole.VIEWER, false, STRING_UNDEFINED, 'Clave2');

			const result: ValidationResult = validator.Validate(form);

			expect(result.HasField(UserFormValidator.PASSWORD_REPEAT)).toBeFalse();
			expect(result.IsValid()).toBeTrue();
		});
	});

	describe('ValidatePassword', () => {
		it('rompe la contraseña si está vacía', () => {
			const result: ValidationResult = validator.ValidatePassword(STRING_UNDEFINED, STRING_UNDEFINED);

			expect(result.HasField(UserFormValidator.PASSWORD)).toBeTrue();
			expect(result.HasField(UserFormValidator.PASSWORD_REPEAT)).toBeFalse();
		});

		it('rompe la contraseña si son solo espacios', () => {
			const result: ValidationResult = validator.ValidatePassword('   ', '   ');

			expect(result.HasField(UserFormValidator.PASSWORD)).toBeTrue();
		});

		it('rompe la repetición si no coincide', () => {
			const result: ValidationResult = validator.ValidatePassword('Clave1', 'Clave2');

			expect(result.HasField(UserFormValidator.PASSWORD_REPEAT)).toBeTrue();
			expect(result.IsValid()).toBeFalse();
			expect(result.GetMessages()).toEqual(['Repetir contraseña: no coincide con «Contraseña»']);
		});

		it('rompe la contraseña vacía con su mensaje de campo obligatorio', () => {
			const result: ValidationResult = validator.ValidatePassword(STRING_UNDEFINED, STRING_UNDEFINED);

			expect(result.GetMessages()).toEqual(['Contraseña: el campo es obligatorio']);
		});

		it('es válida si la contraseña y su repetición coinciden', () => {
			const result: ValidationResult = validator.ValidatePassword('Clave1', 'Clave1');

			expect(result.IsValid()).toBeTrue();
		});
	});
});
