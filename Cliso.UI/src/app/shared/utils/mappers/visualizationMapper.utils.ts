import { ID_NUMERIC_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { BimModelVisualizationMarkerPieceDto, VisualizationDto } from 'src/app/shared/definitions/dtos.definitions';
import { Visualization } from 'src/app/shared/models/visualization/visualization.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { VisualizationPieceMapper } from 'src/app/shared/utils/mappers/visualizationPieceMapper.utils';

/** Convierte, campo a campo, entre la visualización del front y la que envía y recibe el API. */
export class VisualizationMapper {
	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte la visualización del front a la que entiende el API. El API asigna el identificador y el propietario (lo toma de
	 * la sesión), así que no se envían.
	 * @param visualization Visualización del front.
	 * @returns La visualización para el API.
	 */
	public static ToDto(visualization: Visualization): VisualizationDto {
		let pieces: BimModelVisualizationMarkerPieceDto[] | null = null;

		if (!CheckUtils.IsNull(visualization.Pieces)) {
			pieces = visualization.Pieces.map(
				(piece: VisualizationPiece): BimModelVisualizationMarkerPieceDto => VisualizationPieceMapper.ToDto(piece)
			);
		} else {
			// Sin piezas: el API deja las guardadas como están
		}

		return {
			id: visualization.Id === ID_NUMERIC_UNDEFINED ? null : visualization.Id,
			user_id: null,
			bim_model_id: visualization.BimModelId,
			name: visualization.Name,
			description: visualization.Description,
			observations: visualization.Observations,
			is_public: visualization.IsPublic,
			pieces: pieces
		};
	}

	/**
	 * Convierte la visualización que envía el API a la del front.
	 * @param dto Visualización del API.
	 * @returns La visualización del front.
	 */
	public static ToModel(dto: VisualizationDto): Visualization {
		let pieces: VisualizationPiece[] | null = null;

		if (!CheckUtils.IsNull(dto.pieces)) {
			pieces = dto.pieces.map(
				(piece: BimModelVisualizationMarkerPieceDto): VisualizationPiece => VisualizationPieceMapper.ToModel(piece)
			);
		} else {
			// El API no ha enviado las piezas (no se pidieron)
		}

		return new Visualization(
			CheckUtils.IsNull(dto.id) ? ID_NUMERIC_UNDEFINED : dto.id,
			CheckUtils.IsNull(dto.user_id) ? ID_NUMERIC_UNDEFINED : dto.user_id,
			dto.bim_model_id,
			dto.name,
			dto.description,
			dto.observations,
			dto.is_public,
			pieces
		);
	}

	//#endregion PUBLIC STATIC METHODS
}
