/**
 * Hoja base de los idiomas: define todas las claves de texto de la aplicación.
 * Toda clave nueva se añade aquí y, a continuación, en las hojas de cada idioma (si falta en alguna, no compila).
 *
 * Las claves van en MAYÚSCULAS con un prefijo:
 * - `WEB_`: textos que se usan en más de un sitio (por ejemplo, `WEB_EXIT`).
 * - El de un componente, para los textos que solo usa él: las iniciales de su nombre (`BME_` para
 *   BimModelEditor) o, si tiene una sola palabra, la palabra entera (`SIDEBAR_`).
 * Si un texto de un componente pasa a usarse en otro sitio, se renombra con `WEB_`.
 */
export type LanguageBase = {
	/** Descripción del parámetro de la carpeta de los modelos BIM (parámetros de la aplicación). */
	AS_BIM_MODELS_DIRECTORY_DESCRIPTION: string;

	/** Nombre del parámetro de la carpeta de los modelos BIM (parámetros de la aplicación). */
	AS_BIM_MODELS_DIRECTORY_NAME: string;

	/** Observaciones del parámetro de la carpeta de los modelos BIM (parámetros de la aplicación). */
	AS_BIM_MODELS_DIRECTORY_OBSERVATIONS: string;

	/** Descripción del parámetro del idioma (parámetros de la aplicación). */
	AS_LANGUAGE_DESCRIPTION: string;

	/** Nombre del parámetro del idioma (parámetros de la aplicación). */
	AS_LANGUAGE_NAME: string;

	/** Observaciones del parámetro del idioma (parámetros de la aplicación). */
	AS_LANGUAGE_OBSERVATIONS: string;

	/** Texto de ayuda del buscador de la pantalla principal (módulo Home). */
	HOME_SEARCH_PLACEHOLDER: string;

	/** Nombre accesible del botón que despliega el menú en móvil (Sidebar). */
	SIDEBAR_MENU: string;

	/** Inicio: botón de la barra lateral y título de la pantalla principal (se usa en más de un sitio). */
	WEB_HOME: string;
};
