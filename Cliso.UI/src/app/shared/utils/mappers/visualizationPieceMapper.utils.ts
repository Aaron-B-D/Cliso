import { BimModelVisualizationMarkerPieceDto } from 'src/app/shared/definitions/dtos.definitions';
import { VisualizationPieceType } from 'src/app/shared/definitions/visualization.definitions';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { BimModelVisualizationMarkerPieceMapper } from 'src/app/shared/utils/mappers/bimModelVisualizationMarkerPieceMapper.utils';

/** Convierte las piezas de una visualización entre el front y el API, eligiendo el mapper de cada tipo de pieza. */
export class VisualizationPieceMapper {
	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte la pieza del front a la que entiende el API.
	 * @param piece Pieza del front, de cualquier tipo.
	 * @returns La pieza para el API.
	 */
	public static ToDto(piece: VisualizationPiece): BimModelVisualizationMarkerPieceDto {
		// Cada tipo de pieza sabe convertirse a su DTO
		return piece.ToDto();
	}

	/**
	 * Convierte la pieza que envía el API a la del front, de la clase que indica su tipo.
	 * @param dto Pieza del API.
	 * @returns La pieza del front.
	 */
	public static ToModel(dto: BimModelVisualizationMarkerPieceDto): VisualizationPiece {
		let result: VisualizationPiece | null = null;

		switch (dto.type) {
			case VisualizationPieceType.MARKER:
				result = BimModelVisualizationMarkerPieceMapper.ToModel(dto);
				break;
			default:
				throw new Error(`VisualizationPieceMapper.ToModel() => tipo de pieza no soportado: ${dto.type}`);
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
