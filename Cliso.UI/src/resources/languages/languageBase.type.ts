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

	/** Aviso de que el modelo se ha añadido correctamente (BimModelEditor). */
	BME_ADDED: string;

	/** Aviso de que el modelo se ha eliminado correctamente (BimModelEditor). */
	BME_DELETED: string;

	/** Pregunta de confirmación del borrado de un modelo, con su nombre en `{0}` (BimModelEditor). */
	BME_DELETE_CONFIRM: string;

	/** Aviso de que no se ha podido borrar un modelo (BimModelEditor). */
	BME_DELETE_ERROR: string;

	/** Descripción de un modelo (BimModelEditor). */
	BME_DESCRIPTION: string;

	/** Pregunta de confirmación para descartar cambios sin guardar (BimModelEditor). */
	BME_DISCARD_CONFIRM: string;

	/** Texto de la zona donde se suelta o se elige el fichero IFC (BimModelEditor). */
	BME_DROP_FILE: string;

	/** Aviso de que el fichero elegido no es un IFC (BimModelEditor). */
	BME_FILE_INVALID: string;

	/** Pestaña con los datos generales de un modelo (BimModelEditor). */
	BME_GENERAL: string;

	/** Aviso de que no se han podido cargar los modelos (BimModelEditor). */
	BME_LOAD_ERROR: string;

	/** Nombre de un modelo (BimModelEditor). */
	BME_NAME: string;

	/** Aviso de que el nombre del modelo es obligatorio (BimModelEditor). */
	BME_NAME_REQUIRED: string;

	/** Nombre provisional de un modelo que aún no se ha guardado (BimModelEditor). */
	BME_NEW_MODEL: string;

	/** Texto de un modelo que todavía no tiene fichero IFC (BimModelEditor). */
	BME_NO_FILE: string;

	/** Texto cuando no hay ningún modelo en la lista (BimModelEditor). */
	BME_NO_MODELS: string;

	/** Texto cuando no hay ningún modelo seleccionado (BimModelEditor). */
	BME_NO_SELECTION: string;

	/** Observaciones de un modelo (BimModelEditor). */
	BME_OBSERVATIONS: string;

	/** Fichero elegido que se subirá al guardar, con su nombre en `{0}` (BimModelEditor). */
	BME_PENDING_FILE: string;

	/** Pestaña de previsualización 3D de un modelo (BimModelEditor). */
	BME_PREVIEW: string;

	/** Aviso de que no se ha podido guardar un modelo (BimModelEditor). */
	BME_SAVE_ERROR: string;

	/** Texto de ayuda del buscador de modelos (BimModelEditor). */
	BME_SEARCH: string;

	/** Aviso de que el modelo se ha modificado correctamente (BimModelEditor). */
	BME_UPDATED: string;

	/** Aviso de que el modelo se ha guardado pero no se ha podido subir su fichero (BimModelEditor). */
	BME_UPLOAD_ERROR: string;

	/** Mensaje mientras se sube el fichero IFC, con el porcentaje en `{0}` (BimModelEditor). */
	BME_UPLOADING: string;

	/** Nombre accesible del lienzo del visor 3D (BimViewer). */
	BV_CANVAS: string;

	/** Mensaje mientras se descarga el modelo, con el porcentaje en `{0}` (BimViewer). */
	BV_DOWNLOADING: string;

	/** Mensaje cuando no hay ningún modelo que mostrar (BimViewer). */
	BV_EMPTY: string;

	/** Mensaje cuando el modelo no se ha podido mostrar (BimViewer). */
	BV_ERROR: string;

	/** Mensaje mientras se procesa el modelo ya descargado (BimViewer). */
	BV_PROCESSING: string;

	/** Botón de aceptar del diálogo de confirmación (ConfirmDialog). */
	CD_ACCEPT: string;

	/** Botón de cancelar del diálogo de confirmación (ConfirmDialog). */
	CD_CANCEL: string;

	/** Botón de añadir del pie del editor (EditorShell). */
	ES_ADD: string;

	/** Botón para volver de un detalle a la lista, en móvil (EditorShell). */
	ES_BACK: string;

	/** Botón de cerrar el editor (EditorShell). */
	ES_CLOSE: string;

	/** Botón para plegar la lista del editor (EditorShell). */
	ES_COLLAPSE: string;

	/** Botón de borrar del pie del editor (EditorShell). */
	ES_DELETE: string;

	/** Botón de descartar cambios del pie del editor (EditorShell). */
	ES_DISCARD: string;

	/** Botón de editar del pie del editor (EditorShell). */
	ES_EDIT: string;

	/** Botón para desplegar la lista del editor (EditorShell). */
	ES_EXPAND: string;

	/** Botón para maximizar el editor (EditorShell). */
	ES_MAXIMIZE: string;

	/** Nombre accesible de la barra que cambia el ancho de la lista del editor (EditorShell). */
	ES_RESIZE: string;

	/** Botón para restaurar el tamaño del editor (EditorShell). */
	ES_RESTORE: string;

	/** Botón de guardar del pie del editor (EditorShell). */
	ES_SAVE: string;

	/** Texto de ayuda del buscador de la pantalla principal (módulo Home). */
	HOME_SEARCH_PLACEHOLDER: string;

	/** Aviso de que falta el nick o la contraseña (pantalla de inicio de sesión). */
	LOGIN_ERROR_EMPTY: string;

	/** Aviso de que el nick o la contraseña no son correctos (pantalla de inicio de sesión). */
	LOGIN_ERROR_INVALID: string;

	/** Aviso de que hay demasiados intentos fallidos seguidos (pantalla de inicio de sesión). */
	LOGIN_ERROR_TOO_MANY: string;

	/** Aviso de que no se ha podido iniciar sesión por otro motivo (pantalla de inicio de sesión). */
	LOGIN_ERROR_UNEXPECTED: string;

	/** Etiqueta del campo del nick (pantalla de inicio de sesión). */
	LOGIN_NICK: string;

	/** Etiqueta del campo de la contraseña (pantalla de inicio de sesión). */
	LOGIN_PASSWORD: string;

	/** Aviso de que la sesión ha caducado por inactividad y hay que iniciarla de nuevo (pantalla de inicio de sesión). */
	LOGIN_SESSION_EXPIRED: string;

	/** Texto del botón que inicia sesión (pantalla de inicio de sesión). */
	LOGIN_SUBMIT: string;

	/** Título de la pantalla de inicio de sesión. */
	LOGIN_TITLE: string;

	/** Botón de la barra lateral que abre el panel de edición (Sidebar). */
	SIDEBAR_EDITION: string;

	/** Aviso de que no se ha podido abrir el editor (Sidebar). */
	SIDEBAR_EDITOR_ERROR: string;

	/** Botón que cierra la sesión (Sidebar). */
	SIDEBAR_LOGOUT: string;

	/** Aviso de que no se ha podido cerrar la sesión (Sidebar). */
	SIDEBAR_LOGOUT_ERROR: string;

	/** Nombre accesible del botón que despliega el menú en móvil (Sidebar). */
	SIDEBAR_MENU: string;

	/** Inicio: botón de la barra lateral y título de la pantalla principal (se usa en más de un sitio). */
	WEB_HOME: string;

	/** Cargando: se muestra mientras llega una información (se usa en más de un sitio). */
	WEB_LOADING: string;

	/** Modelos: entrada del panel de edición y título de su editor (se usa en más de un sitio). */
	WEB_MODELS: string;

	/** Usuarios: entrada del panel de edición (se usará también en su editor). */
	WEB_USERS: string;

	/** Visualizaciones: entrada del panel de edición (se usará también en su editor). */
	WEB_VISUALIZATIONS: string;
};
