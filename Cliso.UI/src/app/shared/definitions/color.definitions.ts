//#region TYPES

/** Un color expresado en matiz, saturación y luminosidad, cada uno normalizado en el rango [0, 1] (el matiz es una fracción de la vuelta completa: [0, 1] equivale a [0, 360º]). */
type HslChannels = {
	Hue: number;
	Lightness: number;
	Saturation: number;
};

/** Un color expresado en sus canales de rojo, verde y azul, cada uno de 0 a 255. */
type RgbChannels = {
	Blue: number;
	Green: number;
	Red: number;
};

//#endregion TYPES

export { type HslChannels, type RgbChannels };
