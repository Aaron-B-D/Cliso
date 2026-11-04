/** Punto del espacio 3D, en coordenadas del mundo. */
export class BimViewerPoint {
	//#region PUBLIC PROPERTIES

	/** Coordenada X. */
	public X: number;

	/** Coordenada Y. */
	public Y: number;

	/** Coordenada Z. */
	public Z: number;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param x Coordenada X.
	 * @param y Coordenada Y.
	 * @param z Coordenada Z.
	 */
	constructor(x: number, y: number, z: number) {
		this.X = x;
		this.Y = y;
		this.Z = z;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC STATIC METHODS

	/**
	 * Recupera el punto a partir de su serialización en JSON.
	 * @param obj Objeto leído del JSON.
	 * @returns El punto, o `null` si falta o alguna coordenada no es un número.
	 */
	public static Convert(obj: Partial<BimViewerPoint> | null | undefined): BimViewerPoint | null {
		let result: BimViewerPoint | null = null;

		if (
			typeof obj?.X === 'number' &&
			typeof obj.Y === 'number' &&
			typeof obj.Z === 'number' &&
			Number.isFinite(obj.X) &&
			Number.isFinite(obj.Y) &&
			Number.isFinite(obj.Z)
		) {
			result = new BimViewerPoint(obj.X, obj.Y, obj.Z);
		} else {
			// Sin punto guardado o no válido
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
