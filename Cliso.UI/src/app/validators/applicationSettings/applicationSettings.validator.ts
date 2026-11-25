import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { ValidatorBase } from 'src/app/validators/common/validatorBase/validatorBase.validator';

/** Valida el valor que se edita de un parámetro de la aplicación. El resto de comprobaciones las hace el API. */
export class ApplicationSettingsValidator extends ValidatorBase {
	//#region PUBLIC CONSTANTS

	/** Identificador del campo del valor. */
	public static readonly VALUE: string = 'Value';

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC METHODS

	/**
	 * Valida el valor de un parámetro numérico.
	 * @param fieldText Nombre del parámetro, tal y como lo ve el usuario.
	 * @param value Valor escrito.
	 * @param min Valor mínimo permitido (incluido).
	 * @param max Valor máximo permitido (incluido); `null` si no hay máximo y solo se exige que sea un entero.
	 * @returns Las reglas rotas: debe ser un número entero entre el mínimo y el máximo.
	 */
	public ValidateNumber(fieldText: string, value: string, min: number, max: number | null): ValidationResult {
		const result: ValidationResult = new ValidationResult();

		this.checkNumber(result, ApplicationSettingsValidator.VALUE, fieldText, value);

		if (result.IsValid()) {
			if (!CheckUtils.IsNull(max)) {
				this.checkRange(result, ApplicationSettingsValidator.VALUE, fieldText, min, max, Number(value));
			} else {
				// Sin máximo no hay rango que mostrar en el mensaje: no se comprueba
			}
		} else {
			// No es un número: no tiene sentido comprobar el rango
		}

		return result;
	}

	/**
	 * Valida el valor de un parámetro de texto que no puede estar vacío.
	 * @param fieldText Nombre del parámetro, tal y como lo ve el usuario.
	 * @param value Valor escrito.
	 * @returns Las reglas rotas: el valor es obligatorio.
	 */
	public ValidateRequiredText(fieldText: string, value: string): ValidationResult {
		const result: ValidationResult = new ValidationResult();

		this.checkRequired(result, ApplicationSettingsValidator.VALUE, fieldText, value);

		return result;
	}

	//#endregion PUBLIC METHODS
}
