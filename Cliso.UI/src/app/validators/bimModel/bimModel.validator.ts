import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { ValidatorBase } from 'src/app/validators/common/validatorBase/validatorBase.validator';

/** Valida el formulario de un modelo BIM y el fichero IFC que se elige para él. */
export class BimModelValidator extends ValidatorBase {
	//#region PUBLIC CONSTANTS

	/** Identificador del campo del fichero. */
	public static readonly FILE: string = 'File';

	/** Identificador del campo del nombre. */
	public static readonly NAME: string = 'Name';

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	//#region LANGUAGE TEXTS

	/** Nombre del campo del nombre, como lo ve el usuario. */
	private readonly _NAME_TEXT: string = LanguageManager.GetText('WEB_NAME');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC METHODS

	/**
	 * Valida los datos del modelo. Un modelo sin fichero es válido: el fichero se puede subir más tarde.
	 * @param model Modelo a validar.
	 * @returns Las reglas rotas: el nombre es obligatorio.
	 */
	public Validate(model: BimModel): ValidationResult {
		const result: ValidationResult = new ValidationResult();

		this.checkRequired(result, BimModelValidator.NAME, this._NAME_TEXT, model.Name);

		return result;
	}

	/**
	 * Valida un fichero elegido para el modelo, antes de aceptarlo.
	 * @param fileName Nombre del fichero elegido.
	 * @param extension Extensión que debe tener, con el punto (por ejemplo, `.ifc`).
	 * @returns Las reglas rotas: la extensión debe ser la esperada.
	 */
	public ValidateFile(fileName: string, extension: string): ValidationResult {
		const result: ValidationResult = new ValidationResult();

		this.checkFileExtension(result, BimModelValidator.FILE, fileName, extension);

		return result;
	}

	//#endregion PUBLIC METHODS
}
