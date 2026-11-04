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

	/** Descripción del parámetro del intervalo de comprobación de modelos BIM nuevos (parámetros de la aplicación). */
	AS_BIM_MODELS_REFRESH_INTERVAL_DESCRIPTION: string;

	/** Nombre del parámetro del intervalo de comprobación de modelos BIM nuevos (parámetros de la aplicación). */
	AS_BIM_MODELS_REFRESH_INTERVAL_NAME: string;

	/** Observaciones del parámetro del intervalo de comprobación de modelos BIM nuevos (parámetros de la aplicación). */
	AS_BIM_MODELS_REFRESH_INTERVAL_OBSERVATIONS: string;

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

	/** Pregunta de confirmación para descartar cambios sin guardar (BimModelEditor). */
	BME_DISCARD_CONFIRM: string;

	/** Texto de la zona donde se suelta o se elige el fichero IFC (BimModelEditor). */
	BME_DROP_FILE: string;

	/** Aviso de que el fichero elegido no es un IFC (BimModelEditor). */
	BME_FILE_INVALID: string;

	/** Pestaña con los datos generales de un modelo (BimModelEditor). */
	BME_GENERAL: string;

	/** Aviso de que el nombre del modelo es obligatorio (BimModelEditor). */
	BME_NAME_REQUIRED: string;

	/** Nombre provisional de un modelo que aún no se ha guardado (BimModelEditor). */
	BME_NEW_MODEL: string;

	/** Texto de un modelo que todavía no tiene fichero IFC (BimModelEditor). */
	BME_NO_FILE: string;

	/** Texto cuando no hay ningún modelo seleccionado (BimModelEditor). */
	BME_NO_SELECTION: string;

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

	/** Aviso de que la descarga del modelo se ha cancelado (BimViewerLoadingPanel). */
	BVLP_CANCELED: string;

	/** Mensaje mientras se descarga el modelo y aún no se conoce el avance (BimViewerLoadingPanel). */
	BVLP_DOWNLOADING_NO_PROGRESS: string;

	/** Aviso de que no se ha podido descargar el modelo (BimViewerLoadingPanel). */
	BVLP_ERROR: string;

	/** Título del bloque con los datos del modelo (BimViewerLoadingPanel). */
	BVLP_GENERAL_INFO: string;

	/** Botón de reintentar la descarga del modelo (BimViewerLoadingPanel). */
	BVLP_RETRY: string;

	/** Color de fondo del visor en el menú de estilos (BimViewerPanel). */
	BVP_BACKGROUND_COLOR: string;

	/** Aviso de que se ha fijado la vista actual como vista inicial (BimViewerPanel). */
	BVP_DEFAULT_VIEW_SET: string;

	/** Color de la rejilla en el menú de estilos (BimViewerPanel). */
	BVP_GRID_COLOR: string;

	/** Tamaño de las cuadrículas de la rejilla secundaria en el menú de estilos (BimViewerPanel). */
	BVP_GRID_SECONDARY_SIZE: string;

	/** Tamaño de las cuadrículas de la rejilla primaria en el menú de estilos (BimViewerPanel). */
	BVP_GRID_SIZE: string;

	/** Botón de mostrar u ocultar la rejilla (BimViewerPanel). */
	BVP_GRID: string;

	/** Color del resaltado de piezas en el menú de estilos (BimViewerPanel). */
	BVP_HIGHLIGHT_COLOR: string;

	/** Botón de activar o desactivar el resaltado de piezas al hacer clic (BimViewerPanel). */
	BVP_HIGHLIGHT: string;

	/** Botón de volver con la cámara a la vista inicial (BimViewerPanel). */
	BVP_RESET_VIEW: string;

	/** Botón de fijar la vista actual como vista inicial (BimViewerPanel). */
	BVP_SET_DEFAULT_VIEW: string;

	/** Botón que abre el menú de estilos (BimViewerPanel). */
	BVP_STYLES: string;

	/** Nombre accesible de la barra de herramientas del visor (BimViewerToolbar). */
	BVT_TOOLBAR: string;

	/** Nombre accesible del lienzo del visor 3D (BimViewer). */
	BV_CANVAS: string;

	/** Mensaje cuando no hay ningún modelo que mostrar (BimViewer). */
	BV_EMPTY: string;

	/** Mensaje cuando el modelo no se ha podido mostrar (BimViewer). */
	BV_ERROR: string;

	/** Mensaje mientras se procesa el modelo ya descargado (BimViewer). */
	BV_PROCESSING: string;

	/** Botón de aceptar del diálogo de confirmación (ConfirmDialog). */
	CD_ACCEPT: string;

	/** Botón de añadir del pie del editor (EditorShell). */
	ES_ADD: string;

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

	/** Aviso de que el modelo elegido no tiene fichero IFC que mostrar (Home). */
	HOME_NO_FILE: string;

	/** Mensaje cuando el buscador no encuentra ningún modelo (Home). */
	HOME_NO_RESULTS: string;

	/** Pregunta de confirmación antes de abrir un modelo, con su nombre en `{0}` (Home). */
	HOME_OPEN_CONFIRM: string;

	/** Pregunta de si se recupera el modelo y la configuración con los que se estaba trabajando antes de recargar (Home). */
	HOME_RESTORE_CONFIRM: string;

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

	/** Botón para volver a la lista de modelos (se usa en más de un sitio). */
	WEB_BACK_TO_LIST: string;

	/** Aviso de que no se han podido cargar los modelos (se usa en más de un sitio). */
	WEB_BIM_MODELS_LOAD_ERROR: string;

	/** Mensaje mientras se descarga el modelo, con el porcentaje en `{0}` (se usa en más de un sitio). */
	WEB_BIM_MODEL_DOWNLOADING: string;

	/** Botón de cancelar (se usa en más de un sitio). */
	WEB_CANCEL: string;

	/** Descripción de un modelo (se usa en más de un sitio). */
	WEB_DESCRIPTION: string;

	/** Inicio: botón de la barra lateral y título de la pantalla principal (se usa en más de un sitio). */
	WEB_HOME: string;

	/** Cargando: se muestra mientras llega una información (se usa en más de un sitio). */
	WEB_LOADING: string;

	/** Modelos: entrada del panel de edición y título de su editor (se usa en más de un sitio). */
	WEB_MODELS: string;

	/** Nombre de un modelo (se usa en más de un sitio). */
	WEB_NAME: string;

	/** Mensaje cuando no hay ningún modelo (se usa en más de un sitio). */
	WEB_NO_MODELS: string;

	/** Observaciones de un modelo (se usa en más de un sitio). */
	WEB_OBSERVATIONS: string;

	/** Usuarios: entrada del panel de edición (se usará también en su editor). */
	WEB_USERS: string;

	/** Visualizaciones: entrada del panel de edición (se usará también en su editor). */
	WEB_VISUALIZATIONS: string;
};
