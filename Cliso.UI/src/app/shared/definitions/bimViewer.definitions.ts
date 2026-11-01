//#region TYPES

/** Punto del espacio 3D, en coordenadas del mundo. */
type BimViewerPoint = {
	X: number;
	Y: number;
	Z: number;
};

/** Aspecto del visor 3D: colores en hexadecimal (`#rrggbb`) y si se pinta la rejilla. */
type BimViewerStyle = {
	BackgroundColor: string;
	GridColor: string;
	GridVisible: boolean;
};

//#endregion TYPES

//#region CONSTANTS

/** Nombre de la variable CSS de la que sale el color de fondo del visor. */
const BIM_VIEWER_BACKGROUND_CSS_VARIABLE: string = '--color-bg';

/** Nombre de la variable CSS de la que sale el color de la rejilla del visor. */
const BIM_VIEWER_GRID_CSS_VARIABLE: string = '--color-border';

/** Porcentaje máximo de la descarga de un modelo. */
const BIM_VIEWER_MAX_PROGRESS: number = 100;

//#endregion CONSTANTS

export {
	BIM_VIEWER_BACKGROUND_CSS_VARIABLE,
	BIM_VIEWER_GRID_CSS_VARIABLE,
	BIM_VIEWER_MAX_PROGRESS,
	type BimViewerPoint,
	type BimViewerStyle
};
