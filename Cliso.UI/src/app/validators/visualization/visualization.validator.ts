import { Visualization } from 'src/app/shared/models/visualization/visualization.models';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { ValidatorBase } from 'src/app/validators/common/validatorBase/validatorBase.validator';

/** Valida el formulario de una visualización. */
export class VisualizationValidator extends ValidatorBase {
	//#region PUBLIC CONSTANTS

	/** Identificador del campo del modelo BIM. */
	public static readonly MODEL: string = 'Model';

	/** Identificador del campo del nombre. */
	public static readonly NAME: string = 'Name';

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	//#region LANGUAGE TEXTS

	/** Nombre del campo del modelo BIM, como lo ve el usuario. */
	private readonly _MODEL_TEXT: string = LanguageManager.GetText('VE_MODEL');

	/** Nombre del campo del nombre, como lo ve el usuario. */
	private readonly _NAME_TEXT: string = LanguageManager.GetText('WEB_NAME');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC METHODS

	/**
	 * Valida los datos de la visualización.
	 * @param visualization Visualización a validar.
	 * @returns Las reglas rotas: el modelo BIM y el nombre son obligatorios.
	 */
	public Validate(visualization: Visualization): ValidationResult {
		const result: ValidationResult = new ValidationResult();

		this.checkRequiredId(result, VisualizationValidator.MODEL, this._MODEL_TEXT, visualization.BimModelId);
		this.checkRequired(result, VisualizationValidator.NAME, this._NAME_TEXT, visualization.Name);

		return result;
	}

	//#endregion PUBLIC METHODS
}
