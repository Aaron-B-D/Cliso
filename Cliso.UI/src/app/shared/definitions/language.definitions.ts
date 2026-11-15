//#region ENUMS

/** Códigos de idioma admitidos, con el mismo formato que devuelve el parámetro LANGUAGE del API. */
enum LanguageCode {
	ES_ES = 'es-ES',
	GL_ES = 'gl-ES',
	EN_GB = 'en-GB'
}

//#endregion ENUMS

//#region TYPES

/** Idioma que se ofrece para elegir: su código y su nombre, escrito en el propio idioma. */
type LanguageOption = {
	Code: LanguageCode;
	Name: string;
};

//#endregion TYPES

export { LanguageCode, type LanguageOption };
