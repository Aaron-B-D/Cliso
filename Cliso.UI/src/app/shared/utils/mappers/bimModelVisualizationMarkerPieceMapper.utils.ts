import { ID_NUMERIC_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import {
	BimViewerMarkerIcon,
	BimViewerMarkerLinkTarget,
	BimViewerMarkerTitlePosition
} from 'src/app/shared/definitions/bimViewer.definitions';
import { BimModelVisualizationMarkerPieceDto } from 'src/app/shared/definitions/dtos.definitions';
import { VisualizationPieceType } from 'src/app/shared/definitions/visualization.definitions';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { Color } from 'src/app/shared/models/color/color.models';
import { BimModelVisualizationMarkerPiece } from 'src/app/shared/models/visualization/bimModelVisualizationMarkerPiece.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Convierte, campo a campo, entre la pieza de marcador del front y la que envía y recibe el API. */
export class BimModelVisualizationMarkerPieceMapper {
	//#region PRIVATE CONSTANTS

	/** Tipo que el API da a las piezas de marcador. */
	private static readonly _MARKER_TYPE: string = VisualizationPieceType.MARKER;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte la pieza del front a la que entiende el API. El API asigna el identificador, así que una pieza sin guardar va sin él.
	 * @param piece Pieza del front.
	 * @returns La pieza para el API.
	 */
	public static ToDto(piece: BimModelVisualizationMarkerPiece): BimModelVisualizationMarkerPieceDto {
		return {
			anchor_id: piece.AnchorId,
			color: piece.Color.HexColor,
			description: piece.Description,
			dim_when_idle: piece.DimWhenIdle,
			highlight_on_select: piece.HighlightOnSelect,
			icon: piece.Icon,
			id: piece.Id === ID_NUMERIC_UNDEFINED ? null : piece.Id,
			link: piece.Link,
			link_target: piece.LinkTarget,
			opacity: piece.Opacity,
			size: piece.Size,
			text_color: piece.TextColor.HexColor,
			title: piece.Title,
			title_position: piece.TitlePosition,
			type: BimModelVisualizationMarkerPieceMapper._MARKER_TYPE,
			visible_through_model: piece.VisibleThroughModel,
			x: piece.Position.X,
			y: piece.Position.Y,
			z: piece.Position.Z
		};
	}

	/**
	 * Convierte la pieza que envía el API a la del front.
	 * @param dto Pieza del API.
	 * @returns La pieza del front.
	 */
	public static ToModel(dto: BimModelVisualizationMarkerPieceDto): BimModelVisualizationMarkerPiece {
		const piece: BimModelVisualizationMarkerPiece = new BimModelVisualizationMarkerPiece(
			CheckUtils.IsNull(dto.id) ? ID_NUMERIC_UNDEFINED : dto.id,
			new BimViewerPoint(dto.x, dto.y, dto.z),
			new Color(dto.color),
			dto.icon as BimViewerMarkerIcon,
			dto.size,
			dto.title,
			dto.anchor_id
		);

		piece.Description = dto.description;
		piece.DimWhenIdle = dto.dim_when_idle;
		piece.HighlightOnSelect = dto.highlight_on_select;
		piece.Link = dto.link;
		piece.LinkTarget = dto.link_target as BimViewerMarkerLinkTarget;
		piece.Opacity = dto.opacity;
		piece.TextColor = new Color(dto.text_color);
		piece.TitlePosition = dto.title_position as BimViewerMarkerTitlePosition;
		piece.VisibleThroughModel = dto.visible_through_model;

		return piece;
	}

	//#endregion PUBLIC STATIC METHODS
}
