import { LanguageBase } from 'src/resources/languages/languageBase.type';

/** Hoja de textos en castellano. */
export class LanguageEs {
	//#region PUBLIC CONSTANTS

	/** Textos en castellano. */
	public static readonly TEXTS: LanguageBase = {
		AS_BIM_MODELS_DIRECTORY_DESCRIPTION:
			'Carpeta donde se guardan los ficheros IFC de los modelos BIM (relativa a Cliso.API si no es absoluta).',
		AS_BIM_MODELS_DIRECTORY_NAME: 'Carpeta de modelos BIM',
		AS_BIM_MODELS_DIRECTORY_OBSERVATIONS:
			'Se lee al arrancar la API: un cambio requiere reiniciarla y los ficheros ya subidos no se mueven.',
		AS_LANGUAGE_DESCRIPTION: 'Idioma de la aplicación, como código internacional (por ejemplo, es-ES).',
		AS_LANGUAGE_NAME: 'Idioma',
		AS_LANGUAGE_OBSERVATIONS: 'Admite es-ES, gl-ES y en-GB.',
		BME_ADDED: 'Modelo añadido correctamente',
		BME_DELETED: 'Modelo eliminado correctamente',
		BME_DELETE_CONFIRM: '¿Borrar el modelo «{0}»?',
		BME_DELETE_ERROR: 'No se ha podido borrar el modelo',
		BME_DESCRIPTION: 'Descripción',
		BME_DISCARD_CONFIRM: 'Hay cambios sin guardar. ¿Descartarlos?',
		BME_DROP_FILE: 'Arrastra aquí el fichero IFC o haz clic para elegirlo',
		BME_FILE_INVALID: 'El fichero debe ser un IFC (.ifc)',
		BME_GENERAL: 'General',
		BME_LOAD_ERROR: 'No se han podido cargar los modelos',
		BME_NAME: 'Nombre',
		BME_NAME_REQUIRED: 'El nombre es obligatorio',
		BME_NEW_MODEL: 'Nuevo modelo',
		BME_NO_FILE: 'Sin fichero IFC',
		BME_NO_MODELS: 'No hay modelos',
		BME_NO_SELECTION: 'Selecciona un modelo o añade uno nuevo',
		BME_OBSERVATIONS: 'Observaciones',
		BME_PENDING_FILE: 'Se subirá al guardar: {0}',
		BME_PREVIEW: 'Previsualización',
		BME_SAVE_ERROR: 'No se ha podido guardar el modelo',
		BME_SEARCH: 'Buscar modelos',
		BME_UPDATED: 'Modelo modificado correctamente',
		BME_UPLOAD_ERROR: 'El modelo se ha guardado, pero no se ha podido subir su fichero',
		BME_UPLOADING: 'Subiendo fichero… {0} %',
		BV_CANVAS: 'Visor 3D del modelo',
		BV_DOWNLOADING: 'Descargando modelo… {0} %',
		BV_EMPTY: 'No hay ningún modelo que mostrar',
		BV_ERROR: 'No se ha podido mostrar el modelo',
		BV_PROCESSING: 'Procesando modelo…',
		CD_ACCEPT: 'Aceptar',
		CD_CANCEL: 'Cancelar',
		ES_ADD: 'Añadir',
		ES_BACK: 'Volver a la lista',
		ES_CLOSE: 'Cerrar',
		ES_COLLAPSE: 'Plegar la lista',
		ES_DELETE: 'Borrar',
		ES_DISCARD: 'Descartar los cambios',
		ES_EDIT: 'Editar',
		ES_EXPAND: 'Desplegar la lista',
		ES_MAXIMIZE: 'Maximizar',
		ES_RESIZE: 'Cambiar el ancho de la lista',
		ES_RESTORE: 'Restaurar',
		ES_SAVE: 'Guardar',
		HOME_SEARCH_PLACEHOLDER: 'Buscar modelos y visualizaciones',
		SIDEBAR_EDITION: 'Edición',
		SIDEBAR_EDITOR_ERROR: 'No se ha podido abrir el editor',
		SIDEBAR_MENU: 'Menú',
		WEB_HOME: 'Inicio',
		WEB_LOADING: 'Cargando…',
		WEB_MODELS: 'Modelos',
		WEB_USERS: 'Usuarios',
		WEB_VISUALIZATIONS: 'Visualizaciones'
	};

	//#endregion PUBLIC CONSTANTS
}
