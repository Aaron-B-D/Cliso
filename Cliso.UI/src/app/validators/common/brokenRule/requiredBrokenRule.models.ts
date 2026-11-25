import { StringUtils } from 'src/app/shared/utils/string.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { BrokenRule } from 'src/app/validators/common/brokenRule/brokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

/** Regla rota: un campo obligatorio está vacío. */
export class RequiredBrokenRule extends BrokenRule {
	//#region CONSTRUCTOR

	/**
	 * @param field Identificador del campo del formulario al que afecta.
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 */
	constructor(field: string, fieldText: string) {
		super(BrokenRuleType.REQUIRED, field, fieldText);
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	public GetMessage(): string {
		return StringUtils.Format(LanguageManager.GetText('VALIDATION_REQUIRED'), [this.FieldText]);
	}

	//#endregion PUBLIC METHODS
}
