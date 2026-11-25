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
	/** Valor por defecto de un parámetro, con el valor en `{0}` (ApplicationSettingsEditor). */
	ASE_DEFAULT_VALUE: string;

	/** Texto cuando no hay ningún parámetro en la lista (ApplicationSettingsEditor). */
	ASE_EMPTY: string;

	/** Aviso de que no se han podido cargar los parámetros (ApplicationSettingsEditor). */
	ASE_LOAD_ERROR: string;

	/** Texto cuando no hay ningún parámetro seleccionado (ApplicationSettingsEditor). */
	ASE_NO_SELECTION: string;

	/** Mensaje tras guardar: los cambios se aplican al recargar la página (ApplicationSettingsEditor). */
	ASE_RELOAD_NOTICE: string;

	/** Mensaje que se añade al anterior si el parámetro también exige reiniciar la API (ApplicationSettingsEditor). */
	ASE_RESTART_NOTICE: string;

	/** Texto del botón que pone el valor por defecto de un parámetro (ApplicationSettingsEditor). */
	ASE_RESTORE_DEFAULT: string;

	/** Aviso de que el parámetro se ha guardado (ApplicationSettingsEditor). */
	ASE_SAVED: string;

	/** Aviso de que no se ha podido guardar el parámetro (ApplicationSettingsEditor). */
	ASE_SAVE_ERROR: string;

	/** Texto de ayuda del buscador (ApplicationSettingsEditor). */
	ASE_SEARCH: string;

	/** Etiqueta del campo del valor de un parámetro (ApplicationSettingsEditor). */
	ASE_VALUE: string;

	/** Aviso de que el API ha rechazado el valor del parámetro (ApplicationSettingsEditor). */
	ASE_VALUE_REJECTED: string;

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

	/** Descripción del parámetro del tiempo de caducidad de la sesión (parámetros de la aplicación). */
	AS_SESSION_TIMEOUT_DESCRIPTION: string;

	/** Nombre del parámetro del tiempo de caducidad de la sesión (parámetros de la aplicación). */
	AS_SESSION_TIMEOUT_NAME: string;

	/** Observaciones del parámetro del tiempo de caducidad de la sesión (parámetros de la aplicación). */
	AS_SESSION_TIMEOUT_OBSERVATIONS: string;

	/** Aviso de que el modelo se ha añadido correctamente (BimModelEditor). */
	BME_ADDED: string;

	/** Aviso de que el modelo se ha eliminado correctamente (BimModelEditor). */
	BME_DELETED: string;

	/** Pregunta de confirmación del borrado de un modelo, con su nombre en `{0}` (BimModelEditor). */
	BME_DELETE_CONFIRM: string;

	/** Aviso de que no se ha podido borrar un modelo (BimModelEditor). */
	BME_DELETE_ERROR: string;

	/** Texto de la zona donde se suelta o se elige el fichero IFC (BimModelEditor). */
	BME_DROP_FILE: string;

	/** Texto de un modelo que todavía no tiene fichero IFC (BimModelEditor). */
	BME_NO_FILE: string;

	/** Texto cuando no hay ningún modelo seleccionado (BimModelEditor). */
	BME_NO_SELECTION: string;

	/** Fichero elegido que se subirá al guardar, con su nombre en `{0}` (BimModelEditor). */
	BME_PENDING_FILE: string;

	/** Aviso de que no se ha podido guardar un modelo (BimModelEditor). */
	BME_SAVE_ERROR: string;

	/** Texto de ayuda del buscador de modelos (BimModelEditor). */
	BME_SEARCH: string;

	/** Aviso de que el modelo se ha modificado correctamente (BimModelEditor). */
	BME_UPDATED: string;

	/** Mensaje mientras se sube el fichero IFC, con el porcentaje en `{0}` (BimModelEditor). */
	BME_UPLOADING: string;

	/** Aviso de que el modelo se ha guardado pero no se ha podido subir su fichero (BimModelEditor). */
	BME_UPLOAD_ERROR: string;

	/** Aviso de que no se ha podido descargar el modelo para previsualizarlo (BimModelPreview). */
	BMP_DOWNLOAD_ERROR: string;

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

	/** Botón de mostrar u ocultar la rejilla (BimViewerPanel). */
	BVP_GRID: string;

	/** Color de la rejilla en el menú de estilos (BimViewerPanel). */
	BVP_GRID_COLOR: string;

	/** Tamaño de las cuadrículas de la rejilla secundaria en el menú de estilos (BimViewerPanel). */
	BVP_GRID_SECONDARY_SIZE: string;

	/** Tamaño de las cuadrículas de la rejilla primaria en el menú de estilos (BimViewerPanel). */
	BVP_GRID_SIZE: string;

	/** Botón de activar o desactivar el resaltado de elementos al hacer clic (BimViewerPanel). */
	BVP_HIGHLIGHT: string;

	/** Color del resaltado de elementos en el menú de estilos (BimViewerPanel). */
	BVP_HIGHLIGHT_COLOR: string;

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

	/** Etiqueta del selector de idioma (pantalla de inicio de sesión). */
	LOGIN_LANGUAGE: string;

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

	/** Título del submodal de la contraseña (UserEditorPasswordDialog). */
	UEPD_TITLE: string;

	/** Botón que oculta la contraseña escrita (UserEditorPasswordField). */
	UEPF_HIDE_PASSWORD: string;

	/** Botón que muestra la contraseña escrita (UserEditorPasswordField). */
	UEPF_SHOW_PASSWORD: string;

	/** Aviso de que el usuario se ha añadido correctamente (UserEditor). */
	UE_ADDED: string;

	/** Botón que abre el submodal para cambiar la contraseña de un usuario existente (UserEditor). */
	UE_CHANGE_PASSWORD: string;

	/** Aviso de que el usuario se ha eliminado correctamente (UserEditor). */
	UE_DELETED: string;

	/** Pregunta de confirmación del borrado de un usuario, con su nick en `{0}` (UserEditor). */
	UE_DELETE_CONFIRM: string;

	/** Aviso de que no se ha podido borrar un usuario (UserEditor). */
	UE_DELETE_ERROR: string;

	/** Aviso de que no se han podido cargar los usuarios (UserEditor). */
	UE_LOAD_ERROR: string;

	/** Aviso de que ya existe otro usuario con ese nick (UserEditor). */
	UE_NICK_EXISTS: string;

	/** Texto cuando no hay ningún usuario seleccionado (UserEditor). */
	UE_NO_SELECTION: string;

	/** Texto cuando no hay ningún usuario en la lista (UserEditor). */
	UE_NO_USERS: string;

	/** Requisito de contraseña: incluir un número (UserEditor). */
	UE_PASSWORD_DIGIT: string;

	/** Requisito de contraseña: incluir una minúscula (UserEditor). */
	UE_PASSWORD_LOWERCASE: string;

	/** Requisito de contraseña: tener la longitud mínima (UserEditor). */
	UE_PASSWORD_MIN_LENGTH: string;

	/** Aviso de que hay una contraseña nueva que se guardará con el resto de datos (UserEditor). */
	UE_PASSWORD_PENDING: string;

	/** Encabezado de la lista de requisitos que no cumple la contraseña (UserEditor). */
	UE_PASSWORD_REQUIREMENTS: string;

	/** Requisito de contraseña: incluir un símbolo (UserEditor). */
	UE_PASSWORD_SYMBOL: string;

	/** Requisito de contraseña: incluir una mayúscula (UserEditor). */
	UE_PASSWORD_UPPERCASE: string;

	/** Etiqueta del rol (UserEditor). */
	UE_ROLE: string;

	/** Nombre del rol de administrador (UserEditor). */
	UE_ROLE_ADMIN: string;

	/** Nombre del rol de operador (UserEditor). */
	UE_ROLE_OPERATOR: string;

	/** Nombre del rol de visor (UserEditor). */
	UE_ROLE_VIEWER: string;

	/** Aviso de que no se ha podido guardar un usuario (UserEditor). */
	UE_SAVE_ERROR: string;

	/** Texto de ayuda del buscador de usuarios (UserEditor). */
	UE_SEARCH: string;

	/** Etiqueta de los apellidos (UserEditor). */
	UE_SURNAME: string;

	/** Aviso de que el usuario se ha modificado correctamente (UserEditor). */
	UE_UPDATED: string;

	/** Regla rota: un fichero con extensión no admitida; con el nombre del fichero en `{0}` y la extensión esperada en `{1}` (validadores). */
	VALIDATION_FILE_EXTENSION: string;

	/** Regla rota: un campo debería coincidir con otro; con el nombre del campo en `{0}` y el del otro en `{1}` (validadores). */
	VALIDATION_MISMATCH: string;

	/** Regla rota: un texto que no es un número entero; con el nombre del campo en `{0}` (validadores). */
	VALIDATION_NOT_A_NUMBER: string;

	/** Regla rota: un número fuera de rango; con el nombre del campo en `{0}`, el mínimo en `{1}`, el máximo en `{2}` y el valor en `{3}` (validadores). */
	VALIDATION_OUT_OF_RANGE: string;

	/** Regla rota: un campo obligatorio vacío; con el nombre del campo en `{0}` (validadores). */
	VALIDATION_REQUIRED: string;

	/** Número de errores de un formulario cuando son varios, con el número en `{0}` (ValidationAlert). */
	VA_COUNT_MANY: string;

	/** Número de errores de un formulario cuando es uno solo (ValidationAlert). */
	VA_COUNT_ONE: string;

	/** Título del panel de errores, con el número de errores (`VA_COUNT_*`) en `{0}` (ValidationAlert). */
	VA_TITLE: string;

	/** Aviso de que la visualización se ha añadido correctamente (VisualizationEditor). */
	VE_ADDED: string;

	/** Aviso de que la visualización se ha eliminado correctamente (VisualizationEditor). */
	VE_DELETED: string;

	/** Pregunta de confirmación del borrado de una visualización, con su nombre en `{0}` (VisualizationEditor). */
	VE_DELETE_CONFIRM: string;

	/** Aviso de que no se ha podido borrar una visualización (VisualizationEditor). */
	VE_DELETE_ERROR: string;

	/** Aviso de que no se han podido cargar las visualizaciones (VisualizationEditor). */
	VE_LOAD_ERROR: string;

	/** Etiqueta del modelo BIM sobre el que trabaja una visualización (VisualizationEditor). */
	VE_MODEL: string;

	/** Texto cuando no hay ninguna visualización (VisualizationEditor). */
	VE_NO_ITEMS: string;

	/** Texto cuando no hay ninguna visualización seleccionada (VisualizationEditor). */
	VE_NO_SELECTION: string;

	/** Nombre accesible del icono de una visualización de otro usuario (VisualizationEditor). */
	VE_OTHER_USER: string;

	/** Nombre accesible del icono de una visualización del propio usuario (VisualizationEditor). */
	VE_OWN: string;

	/** Título de la pestaña con las piezas de la visualización (VisualizationEditor). */
	VE_PIECES: string;

	/** Aviso de que no se han podido cargar las piezas de una visualización (VisualizationEditor). */
	VE_PIECES_LOAD_ERROR: string;

	/** Casilla para que otros usuarios puedan ver la visualización (VisualizationEditor). */
	VE_PUBLIC: string;

	/** Aviso de que no se ha podido guardar una visualización (VisualizationEditor). */
	VE_SAVE_ERROR: string;

	/** Texto de ayuda del buscador de visualizaciones (VisualizationEditor). */
	VE_SEARCH: string;

	/** Aviso de que la visualización se ha modificado correctamente (VisualizationEditor). */
	VE_UPDATED: string;

	/** Etiqueta del elemento del modelo al que está anclado un marcador (VisualizationMarkerPanel). */
	VMP_ANCHOR: string;

	/** Etiqueta del color de un marcador (VisualizationMarkerPanel). */
	VMP_COLOR: string;

	/** Etiqueta de la descripción de un marcador (VisualizationMarkerPanel). */
	VMP_DESCRIPTION: string;

	/** Interruptor que atenúa un marcador mientras el ratón no está encima (VisualizationMarkerPanel). */
	VMP_DIM_WHEN_IDLE: string;

	/** Interruptor que resalta el elemento anclado al pulsar un marcador (VisualizationMarkerPanel). */
	VMP_HIGHLIGHT_ON_SELECT: string;

	/** Etiqueta del icono de un marcador (VisualizationMarkerPanel). */
	VMP_ICON: string;

	/** Nombre del icono de comprobación (VisualizationMarkerPanel). */
	VMP_ICON_CHECK: string;

	/** Nombre del icono de bandera (VisualizationMarkerPanel). */
	VMP_ICON_FLAG: string;

	/** Nombre del icono de información (VisualizationMarkerPanel). */
	VMP_ICON_INFO: string;

	/** Nombre del icono de chincheta (VisualizationMarkerPanel). */
	VMP_ICON_PIN: string;

	/** Nombre del icono de aviso (VisualizationMarkerPanel). */
	VMP_ICON_WARNING: string;

	/** Etiqueta del enlace de un marcador (VisualizationMarkerPanel). */
	VMP_LINK: string;

	/** Etiqueta de dónde se abre el enlace de un marcador (VisualizationMarkerPanel). */
	VMP_LINK_TARGET: string;

	/** Opción de abrir el enlace en la pestaña actual (VisualizationMarkerPanel). */
	VMP_LINK_TARGET_CURRENT_TAB: string;

	/** Opción de abrir el enlace en una ventana nueva (VisualizationMarkerPanel). */
	VMP_LINK_TARGET_NEW_WINDOW: string;

	/** Texto del desplegable de anclaje cuando ningún elemento coincide con lo escrito (VisualizationMarkerPanel). */
	VMP_NO_RESULTS: string;

	/** Etiqueta de la opacidad de un marcador, en porcentaje (VisualizationMarkerPanel). */
	VMP_OPACITY: string;

	/** Botón que quita el anclaje de un marcador (VisualizationMarkerPanel). */
	VMP_RELEASE: string;

	/** Título de la sección de aspecto del marcador (VisualizationMarkerPanel). */
	VMP_SECTION_APPEARANCE: string;

	/** Título de la sección de comportamiento del marcador (VisualizationMarkerPanel). */
	VMP_SECTION_BEHAVIOR: string;

	/** Título de la sección de contenido del marcador (VisualizationMarkerPanel). */
	VMP_SECTION_CONTENT: string;

	/** Título de la sección de posición y anclaje del marcador (VisualizationMarkerPanel). */
	VMP_SECTION_POSITION: string;

	/** Etiqueta del tamaño de un marcador (VisualizationMarkerPanel). */
	VMP_SIZE: string;

	/** Etiqueta del color del título de un marcador (VisualizationMarkerPanel). */
	VMP_TEXT_COLOR: string;

	/** Etiqueta del título de un marcador (VisualizationMarkerPanel). */
	VMP_TITLE: string;

	/** Etiqueta de la posición del título de un marcador (VisualizationMarkerPanel). */
	VMP_TITLE_POSITION: string;

	/** Opción de escribir el título encima del icono (VisualizationMarkerPanel). */
	VMP_TITLE_POSITION_ABOVE: string;

	/** Opción de escribir el título debajo del icono (VisualizationMarkerPanel). */
	VMP_TITLE_POSITION_BELOW: string;

	/** Opción de no escribir el título (VisualizationMarkerPanel). */
	VMP_TITLE_POSITION_HIDDEN: string;

	/** Opción de escribir el título a la derecha del icono (VisualizationMarkerPanel). */
	VMP_TITLE_POSITION_RIGHT: string;

	/** Interruptor que deja ver un marcador a través del modelo (VisualizationMarkerPanel). */
	VMP_VISIBLE_THROUGH_MODEL: string;

	/** Botón que quita la pieza seleccionada (VisualizationPieceDetail). */
	VPD_DELETE: string;

	/** Texto cuando no hay ninguna pieza seleccionada (VisualizationPieceDetail). */
	VPD_EMPTY: string;

	/** Botón que lleva la vista a la pieza seleccionada (VisualizationPieceDetail). */
	VPD_LOCATE: string;

	/** Título del panel de detalle cuando no hay ninguna pieza seleccionada (VisualizationPieceDetail). */
	VPD_TITLE: string;

	/** Texto cuando la pieza seleccionada es de un tipo que el panel aún no sabe mostrar (VisualizationPieceDetail). */
	VPD_UNSUPPORTED: string;

	/** Botón que abre el selector del tipo de pieza a añadir (VisualizationPieceList). */
	VPL_ADD: string;

	/** Texto cuando la visualización no tiene piezas (VisualizationPieceList). */
	VPL_EMPTY: string;

	/** Título de la lista de piezas, con el número de piezas en `{0}` (VisualizationPieceList). */
	VPL_TITLE: string;

	/** Botón que cierra el selector del tipo de pieza (VisualizationPiecePicker). */
	VPP_CLOSE: string;

	/** Título del selector del tipo de pieza (VisualizationPiecePicker). */
	VPP_TITLE: string;

	/** Aviso de que no se ha podido anclar la pieza al elemento elegido (VisualizationPieceWorkspace). */
	VPW_ANCHOR_ERROR: string;

	/** Nombre por defecto de una pieza, con el nombre de su tipo en `{0}` y su número en `{1}` (VisualizationPieceWorkspace). */
	VPW_DEFAULT_NAME: string;

	/** Aviso de que no se han podido cargar los elementos del modelo para anclar piezas (VisualizationPieceWorkspace). */
	VPW_ELEMENTS_LOAD_ERROR: string;

	/** Botón que pliega el panel de piezas junto al visor (VisualizationPieceWorkspace). */
	VPW_HIDE_PANEL: string;

	/** Aviso de que no se ha podido llevar la vista a la pieza (VisualizationPieceWorkspace). */
	VPW_LOCATE_ERROR: string;

	/** Aviso de que no se ha podido crear la pieza del tipo elegido (VisualizationPieceWorkspace). */
	VPW_PIECE_CREATE_ERROR: string;

	/** Indicación de que el siguiente clic en el modelo coloca la pieza elegida (VisualizationPieceWorkspace). */
	VPW_PLACING: string;

	/** Botón que despliega el panel de piezas junto al visor (VisualizationPieceWorkspace). */
	VPW_SHOW_PANEL: string;

	/** Botón de aceptar (se usa en más de un sitio). */
	WEB_ACCEPT: string;

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

	/** Pregunta de confirmación para descartar cambios sin guardar (se usa en más de un sitio). */
	WEB_DISCARD_CONFIRM: string;

	/** Pestaña con los datos generales de un elemento (se usa en más de un sitio). */
	WEB_GENERAL: string;

	/** Inicio: botón de la barra lateral y título de la pantalla principal (se usa en más de un sitio). */
	WEB_HOME: string;

	/** Nombre del idioma inglés, en inglés (se usa en más de un sitio). */
	WEB_LANGUAGE_EN: string;

	/** Nombre del idioma castellano, en castellano (se usa en más de un sitio). */
	WEB_LANGUAGE_ES: string;

	/** Nombre del idioma gallego, en gallego (se usa en más de un sitio). */
	WEB_LANGUAGE_GL: string;

	/** Cargando: se muestra mientras llega una información (se usa en más de un sitio). */
	WEB_LOADING: string;

	/** Modelos: entrada del panel de edición y título de su editor (se usa en más de un sitio). */
	WEB_MODELS: string;

	/** Nombre de un modelo o de un usuario (se usa en más de un sitio). */
	WEB_NAME: string;

	/** Etiqueta del nombre de usuario (nick) con el que se inicia sesión (se usa en más de un sitio). */
	WEB_NICK: string;

	/** Mensaje cuando no hay ningún modelo (se usa en más de un sitio). */
	WEB_NO_MODELS: string;

	/** Observaciones de un modelo (se usa en más de un sitio). */
	WEB_OBSERVATIONS: string;

	/** Etiqueta de la contraseña de un usuario (se usa en más de un sitio). */
	WEB_PASSWORD: string;

	/** Etiqueta del campo que repite la contraseña (se usa en más de un sitio). */
	WEB_PASSWORD_REPEAT: string;

	/** Descripción del tipo de pieza marcador: qué es y para qué sirve (se usa en más de un sitio). */
	WEB_PIECE_MARKER_DESCRIPTION: string;

	/** Nombre del tipo de pieza marcador (se usa en más de un sitio). */
	WEB_PIECE_MARKER_NAME: string;

	/** Pestaña de previsualización 3D (se usa en más de un sitio). */
	WEB_PREVIEW: string;

	/** Parámetros: entrada del panel de edición y título de su editor (se usa en más de un sitio). */
	WEB_SETTINGS: string;

	/** Usuarios: entrada del panel de edición y título de su editor (se usa en más de un sitio). */
	WEB_USERS: string;

	/** Visualizaciones: entrada del panel de edición y título de su editor (se usa en más de un sitio). */
	WEB_VISUALIZATIONS: string;
};
