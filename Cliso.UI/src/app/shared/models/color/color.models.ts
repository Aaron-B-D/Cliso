import { IComparable } from 'src/app/shared/interfaces/comparable.interface';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ColorUtils } from 'src/app/shared/utils/color/color.utils';

/**
 * La forma única de representar un color en la aplicación: lo guarda en un valor neutro (hexadecimal) y lo convierte al
 * formato que se necesite (hex, rgb, rgba, hsl o hsla), cada uno con su fábrica estática `FromX` y su propiedad de
 * lectura y escritura. Un valor que no es un color válido lanza un error.
 */
export class Color implements IComparable {
	//#region PRIVATE PROPERTIES

	/** Valor del color en hexadecimal, siempre en mayúsculas y en su forma completa (#RRGGBB o #RRGGBBAA). */
	private _Value: string;

	//#endregion PRIVATE PROPERTIES

	//#region PUBLIC PROPERTIES

	/** Color en hexadecimal (#RRGGBB o #RRGGBBAA). Al asignar admite también el abreviado (#RGB o #RGBA); si no es un hexadecimal válido, lanza un error. */
	public get HexColor(): string {
		return this._Value;
	}

	public set HexColor(value: string) {
		if (ColorUtils.IsHexColor(value)) {
			this._Value = ColorUtils.ExpandShorthandHex(value.trim()).toUpperCase();
		} else {
			throw new Error(`Color.HexColor => el valor no es un color hexadecimal válido: ${value}`);
		}
	}

	/** Color en formato hsl(). Al asignar, si no es un hsl() válido, lanza un error. */
	public get HslColor(): string {
		return ColorUtils.HexToHsl(this._Value);
	}

	public set HslColor(value: string) {
		if (ColorUtils.IsHslColor(value)) {
			this.HexColor = ColorUtils.HslToHex(value);
		} else {
			throw new Error(`Color.HslColor => el valor no es un color HSL válido: ${value}`);
		}
	}

	/** Color en formato hsla(). Al asignar, si no es un hsla() válido, lanza un error. */
	public get HslaColor(): string {
		return ColorUtils.HexToHsla(this._Value);
	}

	public set HslaColor(value: string) {
		if (ColorUtils.IsHslaColor(value)) {
			this.HexColor = ColorUtils.HslaToHex(value);
		} else {
			throw new Error(`Color.HslaColor => el valor no es un color HSLA válido: ${value}`);
		}
	}

	/** Color en formato rgb(), sin alfa. Al asignar, si no es un rgb() válido, lanza un error. */
	public get RgbColor(): string {
		return ColorUtils.HexToRgb(this._Value);
	}

	public set RgbColor(value: string) {
		if (ColorUtils.IsRgbColor(value)) {
			this.HexColor = ColorUtils.RgbToHex(value);
		} else {
			throw new Error(`Color.RgbColor => el valor no es un color RGB válido: ${value}`);
		}
	}

	/** Color en formato rgba(). Al asignar, si no es un rgba() válido, lanza un error. */
	public get RgbaColor(): string {
		return ColorUtils.HexToRgba(this._Value);
	}

	public set RgbaColor(value: string) {
		if (ColorUtils.IsRgbaColor(value)) {
			this.HexColor = ColorUtils.RgbaToHex(value);
		} else {
			throw new Error(`Color.RgbaColor => el valor no es un color RGBA válido: ${value}`);
		}
	}

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param hexColor Color en hexadecimal (abreviado o completo, con o sin alfa). Si no es un hexadecimal válido, lanza un error.
	 */
	constructor(hexColor: string) {
		this._Value = '';
		this.HexColor = hexColor;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Indica si otro color es el mismo.
	 * @param other Color con el que se compara.
	 * @returns `true` si tienen el mismo valor.
	 */
	public Equals(other: Color): boolean {
		return this._Value === other.HexColor;
	}

	/**
	 * Define cómo se serializa el color en JSON (`JSON.stringify` llama a este método, con este nombre, por contrato): con su
	 * propiedad pública, ya que el valor interno es privado.
	 * @returns El color como objeto con su `HexColor`.
	 */
	public toJSON(): Partial<Color> {
		return { HexColor: this._Value };
	}

	//#endregion PUBLIC METHODS

	//#region PUBLIC STATIC METHODS

	/**
	 * Recupera un color a partir de su serialización en JSON (ver `toJSON`).
	 * @param obj Objeto leído del JSON.
	 * @returns El color, o `null` si falta o no es un hexadecimal válido.
	 */
	public static Convert(obj: Partial<Color> | null | undefined): Color | null {
		let result: Color | null = null;

		if (!CheckUtils.IsNullOrUndefined(obj) && typeof obj.HexColor === 'string' && ColorUtils.IsHexColor(obj.HexColor)) {
			result = new Color(obj.HexColor);
		} else {
			// Sin color guardado o no válido
		}

		return result;
	}

	/**
	 * Crea un color a partir de un hexadecimal.
	 * @param value Color en hexadecimal.
	 * @returns El color.
	 * @throws Error Si no es un hexadecimal válido.
	 */
	public static FromHex(value: string): Color {
		return new Color(value);
	}

	/**
	 * Crea un color a partir de un hsl().
	 * @param value Color en formato hsl().
	 * @returns El color.
	 * @throws Error Si no es un hsl() válido.
	 */
	public static FromHsl(value: string): Color {
		return new Color(ColorUtils.HslToHex(value));
	}

	/**
	 * Crea un color a partir de un hsla().
	 * @param value Color en formato hsla().
	 * @returns El color.
	 * @throws Error Si no es un hsla() válido.
	 */
	public static FromHsla(value: string): Color {
		return new Color(ColorUtils.HslaToHex(value));
	}

	/**
	 * Crea un color a partir de un rgb().
	 * @param value Color en formato rgb().
	 * @returns El color.
	 * @throws Error Si no es un rgb() válido.
	 */
	public static FromRgb(value: string): Color {
		return new Color(ColorUtils.RgbToHex(value));
	}

	/**
	 * Crea un color a partir de un rgba().
	 * @param value Color en formato rgba().
	 * @returns El color.
	 * @throws Error Si no es un rgba() válido.
	 */
	public static FromRgba(value: string): Color {
		return new Color(ColorUtils.RgbaToHex(value));
	}

	/**
	 * Crea un color a partir de un texto en cualquiera de los formatos soportados (hex, rgb, rgba, hsl o hsla).
	 * @param value Color como texto.
	 * @returns El color.
	 * @throws Error Si no es un color válido.
	 */
	public static FromString(value: string): Color {
		let result: Color | null = null;

		if (ColorUtils.IsHexColor(value)) {
			result = Color.FromHex(value);
		} else if (ColorUtils.IsRgbColor(value)) {
			result = Color.FromRgb(value);
		} else if (ColorUtils.IsRgbaColor(value)) {
			result = Color.FromRgba(value);
		} else if (ColorUtils.IsHslColor(value)) {
			result = Color.FromHsl(value);
		} else if (ColorUtils.IsHslaColor(value)) {
			result = Color.FromHsla(value);
		} else {
			throw new Error(`Color.FromString() => el valor no es un color válido: ${value}`);
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
