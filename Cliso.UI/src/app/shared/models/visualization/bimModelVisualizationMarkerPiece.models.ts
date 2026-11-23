import {
	BimViewerMarkerIcon,
	BimViewerMarkerLinkTarget,
	BimViewerMarkerTitlePosition
} from 'src/app/shared/definitions/bimViewer.definitions';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { BimModelVisualizationMarkerPieceDto } from 'src/app/shared/definitions/dtos.definitions';
import { VisualizationPieceType } from 'src/app/shared/definitions/visualization.definitions';
import { BimViewerHit } from 'src/app/shared/models/bimViewer/bimViewerHit.models';
import { BimViewerMarker } from 'src/app/shared/models/bimViewer/bimViewerMarker.models';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { Color } from 'src/app/shared/models/color/color.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { BimModelVisualizationMarkerPieceMapper } from 'src/app/shared/utils/mappers/bimModelVisualizationMarkerPieceMapper.utils';

/** Pieza de marcador de una visualización: un icono de un color, con un título, en una coordenada del modelo BIM. */
export class BimModelVisualizationMarkerPiece extends VisualizationPiece {
	//#region PRIVATE CONSTANTS

	/** Color con el que se crea un marcador nuevo. */
	private static readonly _DEFAULT_COLOR: string = '#FF0000';

	/** Tamaño con el que se crea un marcador nuevo: el normal. */
	private static readonly _DEFAULT_SIZE: number = 1;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Identificador local, dentro del modelo BIM, del elemento al que está anclado el marcador. Es `null` si está libre. */
	public AnchorId: number | null;

	/** Color del icono. */
	public Color: Color;

	/** Descripción del marcador, que se muestra en su información emergente. */
	public Description: string = STRING_UNDEFINED;

	/** Indica si el marcador se atenúa mientras el ratón no está encima de él. */
	public DimWhenIdle: boolean = false;

	/** Indica si al pulsar el marcador se resalta el elemento al que está anclado. */
	public HighlightOnSelect: boolean = false;

	/** Icono del marcador. */
	public Icon: BimViewerMarkerIcon;

	/** Enlace asociado al marcador. Vacío si no tiene. */
	public Link: string = STRING_UNDEFINED;

	/** Dónde se abre el enlace. */
	public LinkTarget: BimViewerMarkerLinkTarget = BimViewerMarkerLinkTarget.NEW_WINDOW;

	/** Opacidad del marcador, de 0 (invisible) a 1 (opaco). */
	public Opacity: number = 1;

	/** Coordenada del modelo BIM donde está el marcador. */
	public Position: BimViewerPoint;

	/** Tamaño del marcador, como factor del tamaño normal (1 es el normal). */
	public Size: number;

	/** Color del título. */
	public TextColor: Color = new Color('#FFFFFF');

	/** Título del marcador. */
	public Title: string;

	/** Dónde se escribe el título respecto al icono. */
	public TitlePosition: BimViewerMarkerTitlePosition = BimViewerMarkerTitlePosition.BELOW;

	/** Indica si el marcador se ve a través del modelo cuando hay elementos del modelo delante. */
	public VisibleThroughModel: boolean = true;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador de la pieza.
	 * @param position Coordenada del modelo BIM donde está el marcador.
	 * @param color Color del icono.
	 * @param icon Icono del marcador.
	 * @param size Tamaño del marcador, como factor del tamaño normal.
	 * @param title Título del marcador.
	 * @param anchorId Identificador local del elemento al que está anclado. Con `null` está libre.
	 */
	constructor(
		id: number,
		position: BimViewerPoint,
		color: Color,
		icon: BimViewerMarkerIcon,
		size: number,
		title: string,
		anchorId: number | null
	) {
		super(id, VisualizationPieceType.MARKER);

		this.AnchorId = anchorId;
		this.Color = color;
		this.Icon = icon;
		this.Position = position;
		this.Size = size;
		this.Title = title;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	public Clone(): BimModelVisualizationMarkerPiece {
		const clone: BimModelVisualizationMarkerPiece = new BimModelVisualizationMarkerPiece(
			this.Id,
			new BimViewerPoint(this.Position.X, this.Position.Y, this.Position.Z),
			new Color(this.Color.HexColor),
			this.Icon,
			this.Size,
			this.Title,
			this.AnchorId
		);

		clone.Description = this.Description;
		clone.DimWhenIdle = this.DimWhenIdle;
		clone.HighlightOnSelect = this.HighlightOnSelect;
		clone.Link = this.Link;
		clone.LinkTarget = this.LinkTarget;
		clone.Opacity = this.Opacity;
		clone.TextColor = new Color(this.TextColor.HexColor);
		clone.TitlePosition = this.TitlePosition;
		clone.VisibleThroughModel = this.VisibleThroughModel;

		return clone;
	}

	public GetFocusPoint(): BimViewerPoint | null {
		return new BimViewerPoint(this.Position.X, this.Position.Y, this.Position.Z);
	}

	public GetLabel(): string {
		return this.Title;
	}

	public Move(point: BimViewerPoint, elementId: number): void {
		this.Position = new BimViewerPoint(point.X, point.Y, point.Z);
		// Un marcador libre sigue libre; uno anclado se ancla al elemento donde se suelta
		this.AnchorId = CheckUtils.IsNull(this.AnchorId) ? null : elementId;
	}

	public GetViewerMarkers(id: number): BimViewerMarker[] {
		const marker: BimViewerMarker = new BimViewerMarker(id, this.Position, this.Color, this.Icon, this.Size, this.Title);

		marker.AnchorId = this.AnchorId;
		marker.Description = this.Description;
		marker.DimWhenIdle = this.DimWhenIdle;
		marker.HighlightOnSelect = this.HighlightOnSelect;
		marker.Link = this.Link;
		marker.LinkTarget = this.LinkTarget;
		marker.Opacity = this.Opacity;
		marker.TextColor = this.TextColor;
		marker.TitlePosition = this.TitlePosition;
		marker.VisibleThroughModel = this.VisibleThroughModel;

		return [marker];
	}

	public ToDto(): BimModelVisualizationMarkerPieceDto {
		return BimModelVisualizationMarkerPieceMapper.ToDto(this);
	}

	//#endregion PUBLIC METHODS

	//#region PUBLIC STATIC METHODS

	/**
	 * Crea un marcador nuevo colocado donde se ha hecho clic en el modelo, anclado al elemento que hay en ese punto.
	 * @param hit Lo alcanzado en el modelo con el clic.
	 * @param title Título del marcador.
	 * @returns El marcador.
	 */
	public static CreateAt(hit: BimViewerHit, title: string): BimModelVisualizationMarkerPiece {
		return new BimModelVisualizationMarkerPiece(
			ID_NUMERIC_UNDEFINED,
			new BimViewerPoint(hit.Point.X, hit.Point.Y, hit.Point.Z),
			new Color(BimModelVisualizationMarkerPiece._DEFAULT_COLOR),
			BimViewerMarkerIcon.PIN,
			BimModelVisualizationMarkerPiece._DEFAULT_SIZE,
			title,
			hit.ElementId
		);
	}

	/**
	 * Crea un marcador con los valores por defecto: sin guardar, en el origen, rojo, con el icono de chincheta, de tamaño normal,
	 * sin título y libre.
	 * @returns El marcador.
	 */
	public static CreateDefault(): BimModelVisualizationMarkerPiece {
		return new BimModelVisualizationMarkerPiece(
			ID_NUMERIC_UNDEFINED,
			new BimViewerPoint(0, 0, 0),
			new Color(BimModelVisualizationMarkerPiece._DEFAULT_COLOR),
			BimViewerMarkerIcon.PIN,
			BimModelVisualizationMarkerPiece._DEFAULT_SIZE,
			STRING_UNDEFINED,
			null
		);
	}

	//#endregion PUBLIC STATIC METHODS
}
