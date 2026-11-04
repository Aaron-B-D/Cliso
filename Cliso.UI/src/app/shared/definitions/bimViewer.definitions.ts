import { BimViewerStyle } from 'src/app/shared/models/bimViewer/bimViewerStyle.models';
import { BimViewerView } from 'src/app/shared/models/bimViewer/bimViewerView.models';

//#region ENUMS

/** Estados del panel que se muestra mientras se descarga el modelo. */
enum BimViewerLoadingPanelState {
	CANCELED = 'CANCELED',
	LOADING = 'LOADING',
	LOAD_ERROR = 'LOAD_ERROR'
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
	type BimViewerToolbarItem,
	BimViewerToolbarItemId,
	type IBimViewerAccess
};
