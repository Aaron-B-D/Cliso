import { ID_NUMERIC_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { ValidatorBase } from 'src/app/validators/common/validatorBase/validatorBase.validator';

/** Validador de prueba: vuelve públicos los métodos protegidos de la base para poder probarlos. */
class ValidatorBaseTest extends ValidatorBase {
	//#region PUBLIC METHODS

	// Mantienen el nombre de la base (camelCase): se redefinen para hacerlos públicos, no son métodos nuevos

	public override checkFileExtension(result: ValidationResult, field: string, fileName: string, extension: string): void {
		super.checkFileExtension(result, field, fileName, extension);
	}

	public override checkMismatch(
		result: ValidationResult,
		field: string,
		fieldText: string,
		otherFieldText: string,
		value: string,
		otherValue: string
	): void {
		super.checkMismatch(result, field, fieldText, otherFieldText, value, otherValue);
	}

	public override checkNumber(result: ValidationResult, field: string, fieldText: string, value: string): void {
		super.checkNumber(result, field, fieldText, value);
	}

	public override checkRange(
		result: ValidationResult,
		field: string,
		fieldText: string,
		min: number,
		max: number,
		value: number
	): void {
		super.checkRange(result, field, fieldText, min, max, value);
	}

	public override checkRequired(result: ValidationResult, field: string, fieldText: string, value: string): void {
		super.checkRequired(result, field, fieldText, value);
	}

	public override checkRequiredId(result: ValidationResult, field: string, fieldText: string, id: number): void {
		super.checkRequiredId(result, field, fieldText, id);
	}

	//#endregion PUBLIC METHODS
}

describe('ValidatorBase', () => {
	it('checkRequired no rompe si el texto tiene contenido', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRequired(result, 'name', 'Nombre', 'Modelo');

		expect(result.IsValid()).toBeTrue();
	});

	it('checkRequired rompe si el texto solo tiene espacios', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRequired(result, 'name', 'Nombre', '   ');

		expect(result.IsValid()).toBeFalse();
		expect(result.HasField('name')).toBeTrue();
	});

	it('checkFileExtension no rompe si la extensión coincide', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkFileExtension(result, 'file', 'modelo.ifc', '.ifc');

		expect(result.IsValid()).toBeTrue();
	});

	it('checkFileExtension ignora mayúsculas y minúsculas', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkFileExtension(result, 'file', 'MODELO.IFC', '.ifc');

		expect(result.IsValid()).toBeTrue();
	});

	it('checkFileExtension rompe si la extensión no coincide', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkFileExtension(result, 'file', 'modelo.txt', '.ifc');

		expect(result.IsValid()).toBeFalse();
		expect(result.HasField('file')).toBeTrue();
	});

	it('checkMismatch no rompe si los valores son iguales', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkMismatch(result, 'repeat', 'Repetir contraseña', 'Contraseña', 'abc', 'abc');

		expect(result.IsValid()).toBeTrue();
	});

	it('checkMismatch rompe si los valores son distintos', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkMismatch(result, 'repeat', 'Repetir contraseña', 'Contraseña', 'abc', 'abd');

		expect(result.IsValid()).toBeFalse();
		expect(result.HasField('repeat')).toBeTrue();
	});

	it('checkNumber acepta números enteros, positivos y negativos', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkNumber(result, 'age', 'Edad', '12');
		validator.checkNumber(result, 'age', 'Edad', '-3');

		expect(result.IsValid()).toBeTrue();
	});

	it('checkNumber rompe con un decimal', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkNumber(result, 'age', 'Edad', '1.5');

		expect(result.IsValid()).toBeFalse();
	});

	it('checkNumber rompe con texto', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkNumber(result, 'age', 'Edad', 'abc');

		expect(result.IsValid()).toBeFalse();
	});

	it('checkRange no rompe dentro del rango', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRange(result, 'height', 'Altura', 1, 10, 5);

		expect(result.IsValid()).toBeTrue();
	});

	it('checkRange incluye los extremos del rango', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRange(result, 'height', 'Altura', 1, 10, 1);
		validator.checkRange(result, 'height', 'Altura', 1, 10, 10);

		expect(result.IsValid()).toBeTrue();
	});

	it('checkRange rompe por encima del máximo', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRange(result, 'height', 'Altura', 1, 10, 11);

		expect(result.IsValid()).toBeFalse();
		expect(result.HasField('height')).toBeTrue();
	});

	it('checkRange rompe por debajo del mínimo', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRange(result, 'height', 'Altura', 1, 10, 0);

		expect(result.IsValid()).toBeFalse();
		expect(result.HasField('height')).toBeTrue();
	});

	it('checkRange rompe si el valor no es un número', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRange(result, 'height', 'Altura', 1, 10, NaN);

		expect(result.IsValid()).toBeFalse();
	});

	it('checkRequired rompe si el texto está vacío', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRequired(result, 'name', 'Nombre', '');

		expect(result.HasField('name')).toBeTrue();
	});

	it('checkFileExtension rompe si la extensión no está al final del nombre', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkFileExtension(result, 'file', 'modelo.ifc.txt', '.ifc');

		expect(result.HasField('file')).toBeTrue();
	});

	it('checkNumber ignora los espacios por los extremos', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkNumber(result, 'age', 'Edad', ' 12 ');

		expect(result.IsValid()).toBeTrue();
	});

	it('checkNumber rompe con un texto vacío', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkNumber(result, 'age', 'Edad', '');

		expect(result.HasField('age')).toBeTrue();
	});

	it('checkNumber rompe con un número de 400 dígitos', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkNumber(result, 'age', 'Edad', '9'.repeat(400));

		expect(result.HasField('age')).toBeTrue();
	});

	it('checkNumber rompe con un entero que no es seguro', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkNumber(result, 'age', 'Edad', '9007199254740993');

		expect(result.HasField('age')).toBeTrue();
	});

	it('checkRange rompe con Infinity', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRange(result, 'height', 'Altura', 1, 10, Infinity);

		expect(result.HasField('height')).toBeTrue();
	});

	it('checkRange rompe con NaN', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRange(result, 'height', 'Altura', 1, 10, NaN);

		expect(result.HasField('height')).toBeTrue();
	});

	it('checkRequiredId rompe si el identificador no está definido', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRequiredId(result, 'model', 'Modelo', ID_NUMERIC_UNDEFINED);

		expect(result.HasField('model')).toBeTrue();
	});

	it('checkRequiredId no rompe con un identificador válido', () => {
		const validator: ValidatorBaseTest = new ValidatorBaseTest();
		const result: ValidationResult = new ValidationResult();

		validator.checkRequiredId(result, 'model', 'Modelo', 1);

		expect(result.IsValid()).toBeTrue();
	});
});
