import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';

/** Visualización: lo que un usuario muestra sobre un modelo BIM, con sus piezas (marcadores y, a futuro, otros tipos). */
export class Visualization {
	//#region PUBLIC PROPERTIES

	/** Identificador del modelo BIM sobre el que trabaja la visualización. */
	public BimModelId: number;

	/** Descripción de la visualización. */
	public Description: string;

	/** Identificador de la visualización. Es el identificador sin definir mientras no se ha guardado. */
	public Id: number;

	/** `true` si otros usuarios pueden verla (pero no modificarla). */
	public IsPublic: boolean;

	/** Nombre de la visualización. */
	public Name: string;

	/** Observaciones adicionales. */
	public Observations: string;

	/** Piezas, por orden de añadido. Es `null` si no se han pedido al API. */
	public Pieces: VisualizationPiece[] | null;

	/** Identificador del usuario propietario. Es el identificador sin definir mientras la visualización no se ha guardado. */
	public UserId: number;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador de la visualización.
	 * @param userId Identificador del usuario propietario.
	 * @param bimModelId Identificador del modelo BIM sobre el que trabaja.
	 * @param name Nombre de la visualización.
	 * @param description Descripción de la visualización.
	 * @param observations Observaciones adicionales.
	 * @param isPublic `true` si otros usuarios pueden verla.
	 * @param pieces Piezas de la visualización, o `null` si no se han pedido.
	 */
	constructor(
		id: number,
		userId: number,
		bimModelId: number,
		name: string,
		description: string,
		observations: string,
		isPublic: boolean,
		pieces: VisualizationPiece[] | null
	) {
		this.BimModelId = bimModelId;
		this.Description = description;
		this.Id = id;
		this.IsPublic = isPublic;
		this.Name = name;
		this.Observations = observations;
		this.Pieces = pieces;
		this.UserId = userId;
	}

	//#endregion CONSTRUCTOR
}
