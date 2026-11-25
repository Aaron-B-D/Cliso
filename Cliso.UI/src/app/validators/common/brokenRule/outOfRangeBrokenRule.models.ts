import { StringUtils } from 'src/app/shared/utils/string.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { BrokenRule } from 'src/app/validators/common/brokenRule/brokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

/** Regla rota: un número queda fuera del rango permitido. El mensaje dice qué se esperaba y qué se ha introducido. */
export class OutOfRangeBrokenRule extends BrokenRule {
	//#region PUBLIC PROPERTIES

	/** Valor máximo permitido (incluido). */
	public Max: number;

	/** Valor mínimo permitido (incluido). */
	public Min: number;

	/** Valor introducido. */
	public Value: number;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param field Identificador del campo del formulario al que afecta.
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 * @param min Valor mínimo permitido (incluido).
	 * @param max Valor máximo permitido (incluido).
	 * @param value Valor introducido.
	 */
	constructor(field: string, fieldText: string, min: number, max: number, value: number) {
		super(BrokenRuleType.OUT_OF_RANGE, field, fieldText);

		this.Max = max;
		this.Min = min;
		this.Value = value;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	public GetMessage(): string {
		return StringUtils.Format(LanguageManager.GetText('VALIDATION_OUT_OF_RANGE'), [
			this.FieldText,
			String(this.Min),
			String(this.Max),
			String(this.Value)
		]);
	}

	//#endregion PUBLIC METHODS
}
