import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';

/** Lo que hay bajo el puntero en el modelo: el punto del mundo y el elemento del modelo al que pertenece. */
export class BimViewerHit {
	//#region PUBLIC PROPERTIES

	/** Identificador local, dentro del modelo, del elemento alcanzado. */
	public ElementId: number;

	/** Coordenada del mundo alcanzada. */
	public Point: BimViewerPoint;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param point Coordenada del mundo alcanzada.
	 * @param elementId Identificador local, dentro del modelo, del elemento alcanzado.
	 */
	constructor(point: BimViewerPoint, elementId: number) {
		this.ElementId = elementId;
		this.Point = point;
	}

	//#endregion CONSTRUCTOR
}
