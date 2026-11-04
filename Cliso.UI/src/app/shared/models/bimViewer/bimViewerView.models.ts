import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Vista de la cámara: dónde está y hacia qué punto mira, en coordenadas del mundo. */
export class BimViewerView {
	//#region PUBLIC PROPERTIES

	/** Dónde está la cámara. */
	public Position: BimViewerPoint;

	/** Punto hacia el que mira la cámara. */
	public Target: BimViewerPoint;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param position Dónde está la cámara.
	 * @param target Punto hacia el que mira la cámara.
	 */
	constructor(position: BimViewerPoint, target: BimViewerPoint) {
		this.Position = position;
		this.Target = target;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC STATIC METHODS

	/**
	 * Recupera la vista a partir de su serialización en JSON.
	 * @param obj Objeto leído del JSON.
	 * @returns La vista, o `null` si falta o la posición o el punto de mira no son válidos.
	 */
	public static Convert(obj: Partial<BimViewerView> | null | undefined): BimViewerView | null {
		let result: BimViewerView | null = null;
		const position: BimViewerPoint | null = BimViewerPoint.Convert(obj?.Position);
		const target: BimViewerPoint | null = BimViewerPoint.Convert(obj?.Target);

		if (!CheckUtils.IsNull(position) && !CheckUtils.IsNull(target)) {
			result = new BimViewerView(position, target);
		} else {
			// Sin vista guardada o no válida
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
