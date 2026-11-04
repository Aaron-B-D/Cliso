import { HslChannels, RgbChannels } from 'src/app/shared/definitions/color.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Conversión y validación de colores entre los formatos hexadecimal, rgb(), rgba(), hsl() y hsla(). */
export class ColorUtils {
	//#region PRIVATE CONSTANTS

	/** Color rgb() que se devuelve si un hexadecimal no se reconoce. */
	private static readonly _DEFAULT_RGB: string = 'rgb(0,0,0)';

	/** Color rgba() que se devuelve si un hexadecimal no se reconoce. */
	private static readonly _DEFAULT_RGBA: string = 'rgba(0,0,0,1)';

	/** Hexadecimal válido: #RGB, #RGBA, #RRGGBB o #RRGGBBAA. */
	private static readonly _HEX_PATTERN: RegExp = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

	/** hsla() válido, con coma o con la sintaxis moderna (`hsla(120deg 100% 50% / 50%)`). Los patrones de hsl() y hsla() se comparten entre la detección y la conversión, para que reconozcan lo mismo. */
	private static readonly _HSLA_PATTERN: RegExp =
		/^hsla\(\s*(\d{1,3}(?:\.\d+)?(?:deg|rad|turn|grad)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%)\s*[,/]\s*([\d.]+%?)\s*\)$/;

	/** hsl() válido, con coma o con la sintaxis moderna (`hsl(120deg 100% 50%)`). */
	private static readonly _HSL_PATTERN: RegExp =
		/^hsl\(\s*(\d{1,3}(?:\.\d+)?(?:deg|rad|turn|grad)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%)\s*\)$/;

	/** rgba() válido, con coma o con la sintaxis moderna (`rgba(255 255 255 / 50%)`). */
	private static readonly _RGBA_PATTERN: RegExp =
		/^rgba\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,/]\s*([\d.]+%?)\s*\)$/;

	/** rgb() válido, con coma o con la sintaxis moderna (`rgb(255 255 255)`). */
	private static readonly _RGB_PATTERN: RegExp = /^rgb\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)$/;

	/** Hexadecimal abreviado: #RGB o #RGBA. */
	private static readonly _SHORTHAND_HEX_PATTERN: RegExp = /^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])?$/;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC STATIC METHODS

	/**
	 * Expande un hexadecimal abreviado (#RGB o #RGBA) a su forma completa (#RRGGBB o #RRGGBBAA).
	 * @param hex Color en hexadecimal.
	 * @returns El hexadecimal completo; cualquier otro valor se devuelve tal cual.
	 */
	public static ExpandShorthandHex(hex: string): string {
		let result: string = hex;
		const match: RegExpExecArray | null = ColorUtils._SHORTHAND_HEX_PATTERN.exec(hex.trim());

		if (!CheckUtils.IsNull(match)) {
			const red: string = match[1];
			const green: string = match[2];
			const blue: string = match[3];
			const alpha: string | undefined = match[4];

			if (CheckUtils.IsUndefined(alpha)) {
				result = `#${red}${red}${green}${green}${blue}${blue}`;
			} else {
				result = `#${red}${red}${green}${green}${blue}${blue}${alpha}${alpha}`;
			}
		} else {
			// No es un hexadecimal abreviado: se deja tal cual
		}

		return result;
	}

	/**
	 * Saca los canales de rojo, verde y azul de un color rgb().
	 * @param rgb Color en formato rgb().
	 * @returns Los tres canales, de 0 a 255.
	 * @throws Error Si el formato no es válido.
	 */
	public static ExtractRgbChannels(rgb: string): RgbChannels {
		const match: RegExpExecArray | null = ColorUtils._RGB_PATTERN.exec(rgb.trim());
		let result: RgbChannels = { Blue: 0, Green: 0, Red: 0 };

		if (!CheckUtils.IsNull(match) && ColorUtils.IsRgbColor(rgb)) {
			result = { Blue: parseInt(match[3]), Green: parseInt(match[2]), Red: parseInt(match[1]) };
		} else {
			throw new Error(`ColorUtils.ExtractRgbChannels() => formato del color RGB inválido: ${rgb}`);
		}

		return result;
	}

	/**
	 * Convierte un hexadecimal a hsl(), ignorando cualquier canal alfa.
	 * @param hex Color en hexadecimal (abreviado o completo).
	 * @returns El color en formato hsl().
	 */
	public static HexToHsl(hex: string): string {
		const hsl: HslChannels = ColorUtils.rgbToHsl(ColorUtils.ExtractRgbChannels(ColorUtils.HexToRgb(hex)));

		return `hsl(${Math.round(hsl.Hue * 360)}, ${Math.round(hsl.Saturation * 100)}%, ${Math.round(hsl.Lightness * 100)}%)`;
	}

	/**
	 * Convierte un hexadecimal a hsla(). El alfa es 1 si el hexadecimal no lo incluye.
	 * @param hex Color en hexadecimal (abreviado o completo, con o sin alfa).
	 * @returns El color en formato hsla().
	 */
	public static HexToHsla(hex: string): string {
		const expandedHex: string = ColorUtils.ExpandShorthandHex(hex.trim());
		const hsl: HslChannels = ColorUtils.rgbToHsl(ColorUtils.ExtractRgbChannels(ColorUtils.HexToRgb(expandedHex)));
		const alphaHex: string = expandedHex.length === 9 ? expandedHex.slice(7, 9) : 'FF';
		const alpha: string = (parseInt(alphaHex, 16) / 255).toFixed(2);

		return `hsla(${Math.round(hsl.Hue * 360)}, ${Math.round(hsl.Saturation * 100)}%, ${Math.round(hsl.Lightness * 100)}%, ${alpha})`;
	}

	/**
	 * Convierte un hexadecimal a rgb().
	 * @param hex Color en hexadecimal (abreviado o completo, con o sin alfa).
	 * @returns El color en formato rgb(); `rgb(0,0,0)` si el formato no se reconoce.
	 */
	public static HexToRgb(hex: string): string {
		let result: string = ColorUtils._DEFAULT_RGB;
		const match: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(ColorUtils.ExpandShorthandHex(hex));

		if (!CheckUtils.IsNull(match)) {
			result = `rgb(${parseInt(match[1], 16)},${parseInt(match[2], 16)},${parseInt(match[3], 16)})`;
		} else {
			// No se reconoce el formato: se devuelve el color por defecto
		}

		return result;
	}

	/**
	 * Convierte un hexadecimal a rgba(). El alfa es 1 si el hexadecimal no lo incluye.
	 * @param hex Color en hexadecimal (abreviado o completo, con o sin alfa).
	 * @returns El color en formato rgba(); `rgba(0,0,0,1)` si el formato no se reconoce.
	 */
	public static HexToRgba(hex: string): string {
		let result: string = ColorUtils._DEFAULT_RGBA;
		const match: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
			ColorUtils.ExpandShorthandHex(hex)
		);

		if (!CheckUtils.IsNull(match)) {
			const alphaHex: string | undefined = match[4];
			const isOpaque: boolean = CheckUtils.IsUndefined(alphaHex) || alphaHex.toUpperCase() === 'FF';
			const opacity: string = isOpaque ? '1' : (parseInt(alphaHex ?? 'FF', 16) / 255).toFixed(2);

			result = `rgba(${parseInt(match[1], 16)},${parseInt(match[2], 16)},${parseInt(match[3], 16)},${opacity})`;
		} else {
			// No se reconoce el formato: se devuelve el color por defecto
		}

		return result;
	}

	/**
	 * Convierte un hsl() a hexadecimal (#RRGGBB).
	 * @param hsl Color en formato hsl().
	 * @returns El color en hexadecimal.
	 * @throws Error Si el formato no es válido.
	 */
	public static HslToHex(hsl: string): string {
		const match: RegExpExecArray | null = ColorUtils._HSL_PATTERN.exec(hsl.trim());
		let result: string = '';

		if (!CheckUtils.IsNull(match) && ColorUtils.IsHslColor(hsl)) {
			result = ColorUtils.hslChannelsToHex({
				Hue: ColorUtils.parseHueFraction(match[1]),
				Lightness: parseFloat(match[3]) / 100,
				Saturation: parseFloat(match[2]) / 100
			});
		} else {
			throw new Error(`ColorUtils.HslToHex() => formato del color HSL inválido: ${hsl}`);
		}

		return result;
	}

	/**
	 * Convierte un hsla() a hexadecimal (#RRGGBBAA).
	 * @param hsla Color en formato hsla().
	 * @returns El color en hexadecimal.
	 * @throws Error Si el formato no es válido.
	 */
	public static HslaToHex(hsla: string): string {
		const match: RegExpExecArray | null = ColorUtils._HSLA_PATTERN.exec(hsla.trim());
		let result: string = '';

		if (!CheckUtils.IsNull(match) && ColorUtils.IsHslaColor(hsla)) {
			const hex: string = ColorUtils.hslChannelsToHex({
				Hue: ColorUtils.parseHueFraction(match[1]),
				Lightness: parseFloat(match[3]) / 100,
				Saturation: parseFloat(match[2]) / 100
			});

			result = `${hex}${ColorUtils.toHexByte(Math.round(ColorUtils.parseAlpha(match[4]) * 255))}`.toUpperCase();
		} else {
			throw new Error(`ColorUtils.HslaToHex() => formato del color HSLA inválido: ${hsla}`);
		}

		return result;
	}

	/**
	 * Comprueba si un texto es un color hexadecimal válido (#RGB, #RGBA, #RRGGBB o #RRGGBBAA).
	 * @param color Texto a comprobar.
	 * @returns `true` si es un hexadecimal válido.
	 */
	public static IsHexColor(color: string): boolean {
		return ColorUtils._HEX_PATTERN.test(color.trim());
	}

	/**
	 * Comprueba si un texto es un color hsl() válido.
	 * @param color Texto a comprobar.
	 * @returns `true` si es un hsl() válido.
	 */
	public static IsHslColor(color: string): boolean {
		let result: boolean = false;
		const match: RegExpExecArray | null = ColorUtils._HSL_PATTERN.exec(color.trim());

		if (!CheckUtils.IsNull(match)) {
			result = parseFloat(match[2]) <= 100 && parseFloat(match[3]) <= 100;
		} else {
			// No tiene el formato de un hsl()
		}

		return result;
	}

	/**
	 * Comprueba si un texto es un color hsla() válido.
	 * @param color Texto a comprobar.
	 * @returns `true` si es un hsla() válido.
	 */
	public static IsHslaColor(color: string): boolean {
		let result: boolean = false;
		const match: RegExpExecArray | null = ColorUtils._HSLA_PATTERN.exec(color.trim());

		if (!CheckUtils.IsNull(match)) {
			const alpha: number = ColorUtils.parseAlpha(match[4]);

			result = parseFloat(match[2]) <= 100 && parseFloat(match[3]) <= 100 && alpha >= 0 && alpha <= 1;
		} else {
			// No tiene el formato de un hsla()
		}

		return result;
	}

	/**
	 * Comprueba si un texto es un color rgb() válido.
	 * @param color Texto a comprobar.
	 * @returns `true` si es un rgb() válido.
	 */
	public static IsRgbColor(color: string): boolean {
		let result: boolean = false;
		const match: RegExpExecArray | null = ColorUtils._RGB_PATTERN.exec(color.trim());

		if (!CheckUtils.IsNull(match)) {
			result = parseInt(match[1]) <= 255 && parseInt(match[2]) <= 255 && parseInt(match[3]) <= 255;
		} else {
			// No tiene el formato de un rgb()
		}

		return result;
	}

	/**
	 * Comprueba si un texto es un color rgba() válido.
	 * @param color Texto a comprobar.
	 * @returns `true` si es un rgba() válido.
	 */
	public static IsRgbaColor(color: string): boolean {
		let result: boolean = false;
		const match: RegExpExecArray | null = ColorUtils._RGBA_PATTERN.exec(color.trim());

		if (!CheckUtils.IsNull(match)) {
			const alpha: number = ColorUtils.parseAlpha(match[4]);

			result = parseInt(match[1]) <= 255 && parseInt(match[2]) <= 255 && parseInt(match[3]) <= 255 && alpha >= 0 && alpha <= 1;
		} else {
			// No tiene el formato de un rgba()
		}

		return result;
	}

	/**
	 * Convierte un rgb() a hexadecimal (#RRGGBB).
	 * @param rgb Color en formato rgb().
	 * @returns El color en hexadecimal.
	 * @throws Error Si el formato no es válido.
	 */
	public static RgbToHex(rgb: string): string {
		const channels: RgbChannels = ColorUtils.ExtractRgbChannels(rgb);

		return `#${ColorUtils.toHexByte(channels.Red)}${ColorUtils.toHexByte(channels.Green)}${ColorUtils.toHexByte(channels.Blue)}`.toUpperCase();
	}

	/**
	 * Convierte un rgba() a hexadecimal (#RRGGBBAA).
	 * @param rgba Color en formato rgba().
	 * @returns El color en hexadecimal.
	 * @throws Error Si el formato no es válido.
	 */
	public static RgbaToHex(rgba: string): string {
		const match: RegExpExecArray | null = ColorUtils._RGBA_PATTERN.exec(rgba.trim());
		let result: string = '';

		if (!CheckUtils.IsNull(match) && ColorUtils.IsRgbaColor(rgba)) {
			const alphaByte: number = Math.round(ColorUtils.parseAlpha(match[4]) * 255);

			result =
				`#${ColorUtils.toHexByte(parseInt(match[1]))}${ColorUtils.toHexByte(parseInt(match[2]))}${ColorUtils.toHexByte(parseInt(match[3]))}${ColorUtils.toHexByte(alphaByte)}`.toUpperCase();
		} else {
			throw new Error(`ColorUtils.RgbaToHex() => formato del color RGBA inválido: ${rgba}`);
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Convierte un canal de 0 a 1 en dos dígitos hexadecimales.
	 * @param channel Canal de 0 a 1 (lo que se salga se recorta).
	 * @returns El canal en hexadecimal.
	 */
	private static channelToHex(channel: number): string {
		return ColorUtils.toHexByte(Math.round(Math.max(0, Math.min(1, channel)) * 255));
	}

	/**
	 * Convierte un color en matiz, saturación y luminosidad a hexadecimal (#RRGGBB).
	 * @param hsl Canales del color, cada uno de 0 a 1.
	 * @returns El color en hexadecimal.
	 */
	private static hslChannelsToHex(hsl: HslChannels): string {
		let red: number = hsl.Lightness;
		let green: number = hsl.Lightness;
		let blue: number = hsl.Lightness;

		if (hsl.Saturation === 0) {
			// Es un gris: los tres canales valen lo mismo que la luminosidad
		} else {
			const q: number =
				hsl.Lightness < 0.5
					? hsl.Lightness * (1 + hsl.Saturation)
					: hsl.Lightness + hsl.Saturation - hsl.Lightness * hsl.Saturation;
			const p: number = 2 * hsl.Lightness - q;

			red = ColorUtils.hueToRgbChannel(p, q, hsl.Hue + 1 / 3);
			green = ColorUtils.hueToRgbChannel(p, q, hsl.Hue);
			blue = ColorUtils.hueToRgbChannel(p, q, hsl.Hue - 1 / 3);
		}

		return `#${ColorUtils.channelToHex(red)}${ColorUtils.channelToHex(green)}${ColorUtils.channelToHex(blue)}`.toUpperCase();
	}

	/**
	 * Calcula un canal de rojo, verde o azul a partir del matiz.
	 * @param p Valor auxiliar de la conversión.
	 * @param q Valor auxiliar de la conversión.
	 * @param hueOffset Matiz desplazado para el canal.
	 * @returns El canal, de 0 a 1.
	 */
	private static hueToRgbChannel(p: number, q: number, hueOffset: number): number {
		let hue: number = hueOffset;
		let result: number = p;

		if (hue < 0) {
			hue += 1;
		} else if (hue > 1) {
			hue -= 1;
		} else {
			// El matiz ya está en el rango [0, 1]
		}

		if (hue < 1 / 6) {
			result = p + (q - p) * 6 * hue;
		} else if (hue < 1 / 2) {
			result = q;
		} else if (hue < 2 / 3) {
			result = p + (q - p) * (2 / 3 - hue) * 6;
		} else {
			// El canal vale p
		}

		return result;
	}

	/**
	 * Convierte el alfa de un rgba() o hsla() (un número o un porcentaje) a un número de 0 a 1.
	 * @param text Alfa como texto (`0.5` o `50%`).
	 * @returns El alfa, de 0 a 1.
	 */
	private static parseAlpha(text: string): number {
		return text.endsWith('%') ? parseFloat(text) / 100 : parseFloat(text);
	}

	/**
	 * Convierte el matiz de un hsl() o hsla() (en grados sin unidad, deg, rad, turn o grad) en una fracción de la vuelta completa.
	 * @param hueText Matiz como texto.
	 * @returns El matiz, de 0 a 1 (sin llegar a 1).
	 * @throws Error Si no tiene un formato numérico reconocido.
	 */
	private static parseHueFraction(hueText: string): number {
		const match: RegExpExecArray | null = /^(\d+(?:\.\d+)?)(deg|rad|turn|grad)?$/.exec(hueText.trim());
		let result: number = 0;

		if (!CheckUtils.IsNull(match)) {
			const value: number = parseFloat(match[1]);
			let degrees: number = value;

			switch (match[2]) {
				case 'rad':
					degrees = (value * 180) / Math.PI;
					break;
				case 'turn':
					degrees = value * 360;
					break;
				case 'grad':
					degrees = value * 0.9;
					break;
				default:
					// Sin unidad o en grados: el valor ya está en grados
					break;
			}

			// Los grados nunca son negativos, porque el patrón no admite signo
			result = (degrees / 360) % 1;
		} else {
			throw new Error(`ColorUtils.parseHueFraction() => el matiz no tiene un formato numérico reconocido: ${hueText}`);
		}

		return result;
	}

	/**
	 * Convierte un color RGB a matiz, saturación y luminosidad.
	 * @param rgb Canales del color, de 0 a 255.
	 * @returns Los canales del color, cada uno de 0 a 1.
	 */
	private static rgbToHsl(rgb: RgbChannels): HslChannels {
		const red: number = rgb.Red / 255;
		const green: number = rgb.Green / 255;
		const blue: number = rgb.Blue / 255;
		const max: number = Math.max(red, green, blue);
		const min: number = Math.min(red, green, blue);
		const lightness: number = (max + min) / 2;
		let hue: number = 0;
		let saturation: number = 0;

		if (max === min) {
			// Es un gris: no tiene matiz ni saturación
		} else {
			const delta: number = max - min;

			saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

			if (max === red) {
				hue = (green - blue) / delta + (green < blue ? 6 : 0);
			} else if (max === green) {
				hue = (blue - red) / delta + 2;
			} else {
				hue = (red - green) / delta + 4;
			}

			hue /= 6;
		}

		return { Hue: hue, Lightness: lightness, Saturation: saturation };
	}

	/**
	 * Convierte un número de 0 a 255 en dos dígitos hexadecimales.
	 * @param value Número a convertir.
	 * @returns Dos dígitos hexadecimales.
	 */
	private static toHexByte(value: number): string {
		return value.toString(16).padStart(2, '0');
	}

	//#endregion PRIVATE STATIC METHODS
}
