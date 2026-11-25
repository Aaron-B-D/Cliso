import { ID_NUMERIC_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { FileExtensionBrokenRule } from 'src/app/validators/common/brokenRule/fileExtensionBrokenRule.models';
import { MismatchBrokenRule } from 'src/app/validators/common/brokenRule/mismatchBrokenRule.models';
import { NotANumberBrokenRule } from 'src/app/validators/common/brokenRule/notANumberBrokenRule.models';
import { OutOfRangeBrokenRule } from 'src/app/validators/common/brokenRule/outOfRangeBrokenRule.models';
import { RequiredBrokenRule } from 'src/app/validators/common/brokenRule/requiredBrokenRule.models';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';

/**
 * Base de los validadores: reúne las comprobaciones generales que varios reutilizan. Cada validador (`UserFormValidator`...)
 * hereda de esta, tiene su propio método `Validate` que recibe la clase que valida y llama a las comprobaciones que
 * necesite; cada una añade al resultado la regla rota si el valor no la cumple.
 */
export abstract class ValidatorBase {
	//#region PROTECTED METHODS

	/**
	 * Comprueba que un fichero tiene la extensión esperada (sin distinguir mayúsculas de minúsculas).
	 * @param result Resultado al que se añade la regla rota.
	 * @param field Identificador del campo del fichero.
	 * @param fileName Nombre del fichero.
	 * @param extension Extensión esperada, con el punto (por ejemplo, `.ifc`).
	 */
	protected checkFileExtension(result: ValidationResult, field: string, fileName: string, extension: string): void {
		if (!fileName.toLowerCase().endsWith(extension.toLowerCase())) {
			result.Add(new FileExtensionBrokenRule(field, fileName, extension));
		} else {
			// Tiene la extensión esperada
		}
	}

	/**
	 * Comprueba que dos valores coinciden.
	 * @param result Resultado al que se añade la regla rota.
	 * @param field Identificador del campo que debe coincidir.
	 * @param fieldText Nombre de ese campo tal y como lo ve el usuario.
	 * @param otherFieldText Nombre, tal y como lo ve el usuario, del campo con el que debe coincidir.
	 * @param value Valor del campo.
	 * @param otherValue Valor con el que debe coincidir.
	 */
	protected checkMismatch(
		result: ValidationResult,
		field: string,
		fieldText: string,
		otherFieldText: string,
		value: string,
		otherValue: string
	): void {
		if (value !== otherValue) {
			result.Add(new MismatchBrokenRule(field, fieldText, otherFieldText));
		} else {
			// Coinciden
		}
	}

	/**
	 * Comprueba que un texto es un número entero (con signo opcional).
	 * @param result Resultado al que se añade la regla rota.
	 * @param field Identificador del campo.
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 * @param value Texto a comprobar.
	 */
	protected checkNumber(result: ValidationResult, field: string, fieldText: string, value: string): void {
		if (!/^-?[0-9]+$/.test(value.trim()) || !Number.isSafeInteger(Number(value.trim()))) {
			result.Add(new NotANumberBrokenRule(field, fieldText));
		} else {
			// Es un número entero
		}
	}

	/**
	 * Comprueba que un número está dentro de un rango.
	 * @param result Resultado al que se añade la regla rota.
	 * @param field Identificador del campo.
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 * @param min Valor mínimo permitido (incluido).
	 * @param max Valor máximo permitido (incluido).
	 * @param value Valor a comprobar.
	 */
	protected checkRange(result: ValidationResult, field: string, fieldText: string, min: number, max: number, value: number): void {
		if (!Number.isFinite(value) || value < min || value > max) {
			result.Add(new OutOfRangeBrokenRule(field, fieldText, min, max, value));
		} else {
			// Está dentro del rango
		}
	}

	/**
	 * Comprueba que un texto no está vacío (los espacios por los extremos no cuentan).
	 * @param result Resultado al que se añade la regla rota.
	 * @param field Identificador del campo.
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 * @param value Texto a comprobar.
	 */
	protected checkRequired(result: ValidationResult, field: string, fieldText: string, value: string): void {
		if (CheckUtils.IsEmptyString(value)) {
			result.Add(new RequiredBrokenRule(field, fieldText));
		} else {
			// Tiene contenido
		}
	}

	/**
	 * Comprueba que un identificador numérico está definido (no es el de «sin definir»).
	 * @param result Resultado al que se añade la regla rota.
	 * @param field Identificador del campo.
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 * @param id Identificador a comprobar.
	 */
	protected checkRequiredId(result: ValidationResult, field: string, fieldText: string, id: number): void {
		if (id === ID_NUMERIC_UNDEFINED) {
			result.Add(new RequiredBrokenRule(field, fieldText));
		} else {
			// Tiene un identificador
		}
	}

	//#endregion PROTECTED METHODS
}
