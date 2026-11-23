import { BimViewerHit } from 'src/app/shared/models/bimViewer/bimViewerHit.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';

//#region ENUMS

/** Tipos de pieza que puede llevar una visualización. Sus valores son los que usa el API. */
enum VisualizationPieceType {
	MARKER = 'MARKER'
}

//#endregion ENUMS

//#region TYPES

/**
 * Cómo se presenta al usuario un tipo de pieza (su nombre, para qué sirve y su icono) y cómo se crea una nueva donde se
 * hace clic en el modelo, con el título que se le da por defecto.
 */
type VisualizationPieceTypeInfo = {
	Create: (hit: BimViewerHit, title: string) => VisualizationPiece;
	Description: string;
	IconUrl: string;
	Name: string;
	Type: VisualizationPieceType;
};

//#endregion TYPES

//#region CONSTANTS

/** Valor de `depth` para recuperar visualizaciones con sus piezas. */
const VISUALIZATION_DEPTH_WITH_PIECES: number = 1;

/** Valor de `depth` para recuperar visualizaciones sin sus piezas. */
const VISUALIZATION_DEPTH_WITHOUT_PIECES: number = 0;

/** Valor de `force` para borrar una visualización de forma lógica: se conservan sus datos. */
const VISUALIZATION_LOGICAL_DELETE: boolean = false;

//#endregion CONSTANTS

export {
	type VisualizationPieceTypeInfo,
	VISUALIZATION_DEPTH_WITH_PIECES,
	VISUALIZATION_DEPTH_WITHOUT_PIECES,
	VISUALIZATION_LOGICAL_DELETE,
	VisualizationPieceType
};
