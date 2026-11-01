import { LanguageBase } from 'src/resources/languages/languageBase.type';

/** Hoja de textos en gallego. */
export class LanguageGl {
	//#region PUBLIC CONSTANTS

	/** Textos en gallego. */
	public static readonly TEXTS: LanguageBase = {
		AS_BIM_MODELS_DIRECTORY_DESCRIPTION:
			'Cartafol onde se gardan os ficheiros IFC dos modelos BIM (relativo a Cliso.API se non é absoluto).',
		AS_BIM_MODELS_DIRECTORY_NAME: 'Cartafol de modelos BIM',
		AS_BIM_MODELS_DIRECTORY_OBSERVATIONS:
			'Lese ao arrancar a API: un cambio require reiniciala e os ficheiros xa subidos non se moven.',
		AS_LANGUAGE_DESCRIPTION: 'Idioma da aplicación, como código internacional (por exemplo, gl-ES).',
		AS_LANGUAGE_NAME: 'Idioma',
		AS_LANGUAGE_OBSERVATIONS: 'Admite es-ES, gl-ES e en-GB.',
		BME_ADDED: 'Modelo engadido correctamente',
		BME_DELETED: 'Modelo eliminado correctamente',
		BME_DELETE_CONFIRM: 'Borrar o modelo «{0}»?',
		BME_DELETE_ERROR: 'Non se puido borrar o modelo',
		BME_DESCRIPTION: 'Descrición',
		BME_DISCARD_CONFIRM: 'Hai cambios sen gardar. Descartalos?',
		BME_DROP_FILE: 'Arrastra aquí o ficheiro IFC ou fai clic para elixilo',
		BME_FILE_INVALID: 'O ficheiro debe ser un IFC (.ifc)',
		BME_GENERAL: 'Xeral',
		BME_LOAD_ERROR: 'Non se puideron cargar os modelos',
		BME_NAME: 'Nome',
		BME_NAME_REQUIRED: 'O nome é obrigatorio',
		BME_NEW_MODEL: 'Novo modelo',
		BME_NO_FILE: 'Sen ficheiro IFC',
		BME_NO_MODELS: 'Non hai modelos',
		BME_NO_SELECTION: 'Selecciona un modelo ou engade un novo',
		BME_OBSERVATIONS: 'Observacións',
		BME_PENDING_FILE: 'Subirase ao gardar: {0}',
		BME_PREVIEW: 'Previsualización',
		BME_SAVE_ERROR: 'Non se puido gardar o modelo',
		BME_SEARCH: 'Buscar modelos',
		BME_UPDATED: 'Modelo modificado correctamente',
		BME_UPLOAD_ERROR: 'O modelo gardouse, pero non se puido subir o seu ficheiro',
		BME_UPLOADING: 'Subindo ficheiro… {0} %',
		BV_CANVAS: 'Visor 3D do modelo',
		BV_DOWNLOADING: 'Descargando modelo… {0} %',
		BV_EMPTY: 'Non hai ningún modelo que amosar',
		BV_ERROR: 'Non se puido amosar o modelo',
		BV_PROCESSING: 'Procesando modelo…',
		CD_ACCEPT: 'Aceptar',
		CD_CANCEL: 'Cancelar',
		ES_ADD: 'Engadir',
		ES_BACK: 'Volver á lista',
		ES_CLOSE: 'Pechar',
		ES_COLLAPSE: 'Pregar a lista',
		ES_DELETE: 'Borrar',
		ES_DISCARD: 'Descartar os cambios',
		ES_EDIT: 'Editar',
		ES_EXPAND: 'Despregar a lista',
		ES_MAXIMIZE: 'Maximizar',
		ES_RESIZE: 'Cambiar o ancho da lista',
		ES_RESTORE: 'Restaurar',
		ES_SAVE: 'Gardar',
		HOME_SEARCH_PLACEHOLDER: 'Buscar modelos e visualizacións',
		SIDEBAR_EDITION: 'Edición',
		SIDEBAR_EDITOR_ERROR: 'Non se puido abrir o editor',
		SIDEBAR_MENU: 'Menú',
		WEB_HOME: 'Inicio',
		WEB_LOADING: 'Cargando…',
		WEB_MODELS: 'Modelos',
		WEB_USERS: 'Usuarios',
		WEB_VISUALIZATIONS: 'Visualizacións'
	};

	//#endregion PUBLIC CONSTANTS
}
