import { BimModelVisualizationMarkerPieceDto } from 'src/app/shared/definitions/dtos.definitions';
import { VisualizationPieceType } from 'src/app/shared/definitions/visualization.definitions';
import { BimViewerMarker } from 'src/app/shared/models/bimViewer/bimViewerMarker.models';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';

/**
 * Pieza de una visualización: lo que se muestra sobre el modelo BIM. Establece el contrato común de todos los tipos de
 * pieza; cada tipo lo implementa con sus datos, de modo que quien trabaja con piezas no necesita distinguir de qué tipo es cada una.
 */
export abstract class VisualizationPiece {
	//#region PUBLIC PROPERTIES

	/** Identificador de la pieza. Es el identificador sin definir mientras la pieza no se ha guardado. */
	public Id: number;

	/** Tipo de la pieza. */
	public readonly Type: VisualizationPieceType;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador de la pieza.
	 * @param type Tipo de la pieza.
	 */
	constructor(id: number, type: VisualizationPieceType) {
		this.Id = id;
		this.Type = type;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Hace una copia de la pieza, de su mismo tipo, para editarla sin tocar la original.
	 * @returns La copia.
	 */
	public abstract Clone(): VisualizationPiece;

	/**
	 * Devuelve el punto del modelo al que llevar la vista para encontrar la pieza.
	 * @returns El punto, en coordenadas del mundo, o `null` si la pieza no tiene un lugar en el modelo.
	 */
	public abstract GetFocusPoint(): BimViewerPoint | null;

	/**
	 * Devuelve el nombre propio de la pieza, con el que se muestra en las listas.
	 * @returns El nombre, o una cadena vacía si la pieza no tiene.
	 */
	public abstract GetLabel(): string;

	/**
	 * Lleva la pieza a un punto del modelo, tras arrastrarla o al recolocarla sobre otro elemento del modelo.
	 * @param point Punto del modelo, en coordenadas del mundo.
	 * @param elementId Identificador local del elemento del modelo que hay en ese punto.
	 */
	public abstract Move(point: BimViewerPoint, elementId: number): void;

	/**
	 * Devuelve cómo se pinta la pieza en el visor 3D.
	 * @param id Identificador con el que el visor avisa de esta pieza al seleccionarla o moverla.
	 * @returns Los marcadores con los que se pinta; vacío si este tipo de pieza no se pinta en el visor.
	 */
	public abstract GetViewerMarkers(id: number): BimViewerMarker[];

	/**
	 * Convierte la pieza a la que entiende el API.
	 * @returns La pieza para el API.
	 */
	public abstract ToDto(): BimModelVisualizationMarkerPieceDto;

	//#endregion PUBLIC METHODS
}
