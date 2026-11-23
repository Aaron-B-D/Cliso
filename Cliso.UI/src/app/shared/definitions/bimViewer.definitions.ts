import { BimViewerElement } from 'src/app/shared/models/bimViewer/bimViewerElement.models';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { BimViewerStyle } from 'src/app/shared/models/bimViewer/bimViewerStyle.models';
import { BimViewerView } from 'src/app/shared/models/bimViewer/bimViewerView.models';

//#region ENUMS

/** Estados del panel que se muestra mientras se descarga el modelo. */
enum BimViewerLoadingPanelState {
	CANCELED = 'CANCELED',
	LOADING = 'LOADING',
	LOAD_ERROR = 'LOAD_ERROR'
}

/** Iconos con los que se pinta un marcador. Sus valores son los que usa el API. */
enum BimViewerMarkerIcon {
	CHECK = 'CHECK',
	FLAG = 'FLAG',
	INFO = 'INFO',
	PIN = 'PIN',
	WARNING = 'WARNING'
}

/** Dónde se abre el enlace de un marcador. */
enum BimViewerMarkerLinkTarget {
	CURRENT_TAB = 'CURRENT_TAB',
	NEW_WINDOW = 'NEW_WINDOW'
}

/** Dónde se escribe el título de un marcador respecto a su icono. */
enum BimViewerMarkerTitlePosition {
	ABOVE = 'ABOVE',
	BELOW = 'BELOW',
	HIDDEN = 'HIDDEN',
	RIGHT = 'RIGHT'
}

/** Identificadores de los botones de la barra de herramientas del visor. */
enum BimViewerToolbarItemId {
	GRID = 'GRID',
	HIGHLIGHT = 'HIGHLIGHT',
	RESET_VIEW = 'RESET_VIEW',
	SET_DEFAULT_VIEW = 'SET_DEFAULT_VIEW'
}

//#endregion ENUMS

//#region TYPES

/**
 * Botón de la barra de herramientas del visor. `IsActive` es `null` si no es de dos estados; si lo es, dice si está
 * pulsado. `IsDisabled` indica si el botón no se puede pulsar.
 */
type BimViewerToolbarItem = {
	IconUrl: string;
	Id: BimViewerToolbarItemId;
	IsActive: boolean | null;
	IsDisabled: boolean;
	Text: string;
};

//#endregion TYPES

//#region INTERFACES

/** Contrato con el que el visor 3D deja operar desde fuera: quien lo recibe al estar listo el visor puede pedirle acciones. */
interface IBimViewerAccess {
	/**
	 * Lleva la vista a un punto del modelo: la cámara se centra en él sin cambiar desde dónde mira ni a qué distancia.
	 * @param point Punto en coordenadas del mundo.
	 */
	FocusPoint(point: BimViewerPoint): Promise<void>;

	/**
	 * Calcula el centro de un elemento del modelo cargado.
	 * @param elementId Identificador local del elemento dentro del modelo.
	 * @returns El centro del elemento en coordenadas del mundo, o `null` si no hay modelo cargado o el elemento no tiene geometría.
	 */
	GetElementCenter(elementId: number): Promise<BimViewerPoint | null>;

	/**
	 * Lista los elementos con geometría del modelo cargado.
	 * @returns Los elementos, con su identificador, nombre y categoría. Vacío si no hay modelo cargado.
	 */
	GetElements(): Promise<BimViewerElement[]>;

	/** Devuelve la cámara a la vista por defecto: la del encuadre inicial del modelo o la fijada con `SetCurrentViewAsDefault`. */
	ResetView(): Promise<void>;

	/**
	 * Fija la vista actual de la cámara como la vista por defecto.
	 * @returns La vista fijada, o `null` si no hay modelo cargado.
	 */
	SetCurrentViewAsDefault(): BimViewerView | null;

	/**
	 * Cambia el aspecto del visor, también con un modelo ya cargado.
	 * @param style Nuevo aspecto.
	 */
	SetStyle(style: BimViewerStyle): void;
}

//#endregion INTERFACES

//#region CONSTANTS

/** Porcentaje máximo de la descarga de un modelo. */
const BIM_VIEWER_MAX_PROGRESS: number = 100;

//#endregion CONSTANTS

export {
	BIM_VIEWER_MAX_PROGRESS,
	BimViewerLoadingPanelState,
	BimViewerMarkerIcon,
	BimViewerMarkerLinkTarget,
	BimViewerMarkerTitlePosition,
	type BimViewerToolbarItem,
	BimViewerToolbarItemId,
	type IBimViewerAccess
};
