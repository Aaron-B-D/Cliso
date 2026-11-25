import { StringUtils } from 'src/app/shared/utils/string.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { BrokenRule } from 'src/app/validators/common/brokenRule/brokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

/** Regla rota: un campo debería coincidir con otro y no lo hace (la repetición de una contraseña, por ejemplo). */
export class MismatchBrokenRule extends BrokenRule {
	//#region PUBLIC PROPERTIES

	/** Nombre, tal y como lo ve el usuario, del campo con el que debería coincidir. */
	public OtherFieldText: string;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param field Identificador del campo del formulario al que afecta (el que no coincide).
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 * @param otherFieldText Nombre, tal y como lo ve el usuario, del campo con el que debería coincidir.
	 */
	constructor(field: string, fieldText: string, otherFieldText: string) {
		super(BrokenRuleType.MISMATCH, field, fieldText);

		this.OtherFieldText = otherFieldText;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	public GetMessage(): string {
		return StringUtils.Format(LanguageManager.GetText('VALIDATION_MISMATCH'), [this.FieldText, this.OtherFieldText]);
	}

	//#endregion PUBLIC METHODS
}
