import { BrokenRule } from 'src/app/validators/common/brokenRule/brokenRule.models';

/** Resultado de validar un formulario: las reglas que se han roto, en el orden en que se han comprobado. */
export class ValidationResult {
	//#region PUBLIC PROPERTIES

	/** Reglas rotas. Vacío si el formulario es válido. */
	public BrokenRules: BrokenRule[] = [];

	//#endregion PUBLIC PROPERTIES

	//#region PUBLIC METHODS

	/**
	 * Añade una regla rota.
	 * @param rule Regla rota.
	 */
	public Add(rule: BrokenRule): void {
		this.BrokenRules.push(rule);
	}

	/**
	 * Devuelve el mensaje de cada regla rota, en el idioma actual.
	 * @returns Un mensaje por regla rota, en el mismo orden.
	 */
	public GetMessages(): string[] {
		return this.BrokenRules.map((rule: BrokenRule): string => rule.GetMessage());
	}

	/**
	 * Indica si algún campo tiene una regla rota.
	 * @param field Identificador del campo (el que declara el validador).
	 * @returns `true` si hay al menos una regla rota de ese campo.
	 */
	public HasField(field: string): boolean {
		return this.BrokenRules.some((rule: BrokenRule): boolean => rule.Field === field);
	}

	/**
	 * Indica si el formulario es válido.
	 * @returns `true` si no se ha roto ninguna regla.
	 */
	public IsValid(): boolean {
		return this.BrokenRules.length === 0;
	}

	//#endregion PUBLIC METHODS
}
