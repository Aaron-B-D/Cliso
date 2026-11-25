import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

/**
 * Regla de validación que se ha roto. Es la base de todas: cada regla (campo obligatorio, valor fuera de rango...) es una
 * clase que hereda de esta y escribe su mensaje en `GetMessage()`.
 *
 * Equivale a una clase abstracta con un método abstracto en C#: no se puede crear una `BrokenRule` a secas.
 */
export abstract class BrokenRule {
	//#region PUBLIC PROPERTIES

	/** Identificador del campo del formulario al que afecta (el que declara su validador). Sirve para marcarlo en rojo. */
	public Field: string;

	/** Nombre del campo tal y como lo ve el usuario, ya en el idioma actual. */
	public FieldText: string;

	/** Tipo de regla rota. */
	public Type: BrokenRuleType;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param type Tipo de regla rota.
	 * @param field Identificador del campo del formulario al que afecta.
	 * @param fieldText Nombre del campo tal y como lo ve el usuario.
	 */
	constructor(type: BrokenRuleType, field: string, fieldText: string) {
		this.Field = field;
		this.FieldText = fieldText;
		this.Type = type;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Devuelve el mensaje de la regla rota en el idioma actual, con el nombre del campo y, si la regla los tiene, los
	 * valores que la concretan.
	 * @returns El mensaje para el usuario.
	 */
	public abstract GetMessage(): string;

	//#endregion PUBLIC METHODS
}
