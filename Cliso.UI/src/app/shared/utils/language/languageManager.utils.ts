import { LanguageCode, LanguageOption } from 'src/app/shared/definitions/language.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { LanguageBase } from 'src/resources/languages/languageBase.type';
import { LanguageEn } from 'src/resources/languages/languageEn';
import { LanguageEs } from 'src/resources/languages/languageEs';
import { LanguageGl } from 'src/resources/languages/languageGl';

/** Gestiona el idioma actual de la aplicación y da acceso a sus textos. */
export class LanguageManager {
	//#region PRIVATE STATIC PROPERTIES

	/** Código del idioma actual. */
	private static _Code: LanguageCode = LanguageCode.ES_ES;

	/** Hoja de textos del idioma actual. */
	private static _Texts: LanguageBase = LanguageEs.TEXTS;

	//#endregion PRIVATE STATIC PROPERTIES

	//#region PUBLIC STATIC METHODS

	/**
	 * Busca, entre los idiomas que prefiere el navegador y por orden de preferencia, el primero que la aplicación admite.
	 * @returns El código del idioma; inglés si el navegador no prefiere ninguno de los admitidos.
	 */
	public static GetBrowserLanguage(): LanguageCode {
		let result: LanguageCode = LanguageCode.EN_GB;

		for (const browserLanguage of window.navigator.languages) {
			const code: LanguageCode | null = LanguageManager.getSupportedCode(browserLanguage);

			if (!CheckUtils.IsNull(code)) {
				result = code;
				break;
			} else {
				// Este idioma no está admitido: se mira el siguiente
			}
		}

		return result;
	}

	/**
	 * Devuelve el código del idioma actual.
	 * @returns El código del idioma.
	 */
	public static GetCode(): LanguageCode {
		return LanguageManager._Code;
	}

	/**
	 * Devuelve los idiomas admitidos para que el usuario elija uno.
	 * @returns Un elemento por idioma, con su nombre escrito en el propio idioma.
	 */
	public static GetOptions(): LanguageOption[] {
		return [
			{ Code: LanguageCode.ES_ES, Name: LanguageManager.GetText('WEB_LANGUAGE_ES') },
			{ Code: LanguageCode.GL_ES, Name: LanguageManager.GetText('WEB_LANGUAGE_GL') },
			{ Code: LanguageCode.EN_GB, Name: LanguageManager.GetText('WEB_LANGUAGE_EN') }
		];
	}

	/**
	 * Devuelve un texto en el idioma actual o en el que se indique.
	 * @param key Clave del texto; solo admite las que existen en la hoja base (si no, no compila).
	 * @param code Idioma en el que se quiere el texto; `null` para el idioma actual.
	 * @returns El texto traducido.
	 */
	public static GetText(key: keyof LanguageBase, code: LanguageCode | null = null): string {
		let texts: LanguageBase = LanguageManager._Texts;

		if (!CheckUtils.IsNull(code)) {
			texts = LanguageManager.getTexts(code);
		} else {
			// Idioma actual
		}

		return texts[key];
	}

	/**
	 * Cambia el idioma de la aplicación.
	 * Los componentes que ya estén en pantalla no se actualizan: solo los que se creen después.
	 * @param code Código del idioma.
	 */
	public static SetLanguage(code: LanguageCode): void {
		switch (code) {
			case LanguageCode.EN_GB:
			case LanguageCode.ES_ES:
			case LanguageCode.GL_ES:
				LanguageManager._Code = code;
				LanguageManager._Texts = LanguageManager.getTexts(code);
				break;
			default:
				console.warn('LanguageManager.SetLanguage() => idioma no admitido: ' + String(code));
				LanguageManager._Code = LanguageCode.ES_ES;
				LanguageManager._Texts = LanguageEs.TEXTS;
				break;
		}
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Traduce un idioma del navegador (por ejemplo, `es-MX`) al idioma admitido de la misma lengua.
	 * @param browserLanguage Idioma del navegador, con o sin región.
	 * @returns El código admitido (`es` → castellano, `gl` → gallego, `en` → inglés), o `null` si la lengua no está admitida.
	 */
	private static getSupportedCode(browserLanguage: string): LanguageCode | null {
		let result: LanguageCode | null = null;

		switch (browserLanguage.toLowerCase().split('-')[0]) {
			case 'en':
				result = LanguageCode.EN_GB;
				break;
			case 'es':
				result = LanguageCode.ES_ES;
				break;
			case 'gl':
				result = LanguageCode.GL_ES;
				break;
			default:
				// Lengua no admitida
				break;
		}

		return result;
	}

	/**
	 * Devuelve la hoja de textos de un idioma.
	 * @param code Código del idioma.
	 * @returns La hoja de textos; la del castellano si el idioma no es uno de los admitidos.
	 */
	private static getTexts(code: LanguageCode): LanguageBase {
		let result: LanguageBase = LanguageEs.TEXTS;

		switch (code) {
			case LanguageCode.EN_GB:
				result = LanguageEn.TEXTS;
				break;
			case LanguageCode.ES_ES:
				result = LanguageEs.TEXTS;
				break;
			case LanguageCode.GL_ES:
				result = LanguageGl.TEXTS;
				break;
			default:
				console.warn('LanguageManager.getTexts() => idioma no admitido: ' + String(code));
				break;
		}

		return result;
	}

	//#endregion PRIVATE STATIC METHODS
}
