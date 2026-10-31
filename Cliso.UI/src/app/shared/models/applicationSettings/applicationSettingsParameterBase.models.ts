import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import { LanguageCode } from 'src/app/shared/definitions/language.definitions';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { LanguageBase } from 'src/resources/languages/languageBase.type';

/**
 * Parámetro de configuración de la aplicación. Del API solo llegan su identificador, su valor por defecto y su valor
 * actual: el nombre, la descripción y las observaciones los pone el front, como claves de la hoja de idiomas que cada
 * clase de parámetro indica. Cada parámetro tiene su clase, que convierte el valor a su tipo.
 */
export abstract class ApplicationSettingsParameterBase {
	//#region PUBLIC PROPERTIES

	/** Valor con el que se creó el parámetro, como texto. */
	public DefaultValue: string;

	/** Identifica de qué parámetro se trata. */
	public Parameter: ApplicationSettingsParameter;

	/** Valor actual como texto, tal y como llega de la base de datos. */
	public Value: string;

	//#endregion PUBLIC PROPERTIES

	//#region PROTECTED PROPERTIES

	/** Clave del texto con la descripción del parámetro. */
	protected _DescriptionKey: keyof LanguageBase;

	/** Clave del texto con el nombre del parámetro. */
	protected _NameKey: keyof LanguageBase;

	/** Clave del texto con las observaciones del parámetro. */
	protected _ObservationsKey: keyof LanguageBase;

	//#endregion PROTECTED PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param parameter Identifica de qué parámetro se trata.
	 * @param nameKey Clave del texto con el nombre del parámetro.
	 * @param descriptionKey Clave del texto con la descripción del parámetro.
	 * @param observationsKey Clave del texto con las observaciones del parámetro.
	 * @param defaultValue Valor con el que se creó el parámetro, como texto.
	 * @param value Valor actual como texto.
	 */
	constructor(
		parameter: ApplicationSettingsParameter,
		nameKey: keyof LanguageBase,
		descriptionKey: keyof LanguageBase,
		observationsKey: keyof LanguageBase,
		defaultValue: string,
		value: string
	) {
		this._DescriptionKey = descriptionKey;
		this._NameKey = nameKey;
		this._ObservationsKey = observationsKey;
		this.DefaultValue = defaultValue;
		this.Parameter = parameter;
		this.Value = value;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Qué es y para qué sirve el parámetro.
	 * @param language Idioma en el que se quiere el texto; `null` para el idioma actual.
	 * @returns La descripción.
	 */
	public GetDescription(language: LanguageCode | null = null): string {
		return this.getText(this._DescriptionKey, language);
	}

	/**
	 * Nombre del parámetro.
	 * @param language Idioma en el que se quiere el texto; `null` para el idioma actual.
	 * @returns El nombre.
	 */
	public GetName(language: LanguageCode | null = null): string {
		return this.getText(this._NameKey, language);
	}

	/**
	 * Observaciones adicionales sobre el parámetro.
	 * @param language Idioma en el que se quiere el texto; `null` para el idioma actual.
	 * @returns Las observaciones.
	 */
	public GetObservations(language: LanguageCode | null = null): string {
		return this.getText(this._ObservationsKey, language);
	}

	/**
	 * Convierte el texto de `Value` al tipo propio del parámetro.
	 * @returns El valor convertido.
	 */
	public abstract GetValue(): unknown;

	//#endregion PUBLIC METHODS

	//#region PROTECTED METHODS

	/**
	 * Recupera un texto de la hoja de idiomas.
	 * @param key Clave del texto.
	 * @param language Idioma en el que se quiere el texto; `null` para el idioma actual.
	 * @returns El texto.
	 */
	protected getText(key: keyof LanguageBase, language: LanguageCode | null): string {
		return LanguageManager.GetText(key, language);
	}

	//#endregion PROTECTED METHODS
}
