from app.adapters.inbound.rest import BIMModelVisualizationMarkerPieceDto, VisualizationDto;
from app.adapters.inbound.rest.mappers.visualization_piece_mapper import VisualizationPieceMapper;
from app.domain.models import Visualization, VisualizationPiece;


class VisualizationMapper:
	"""Convierte, campo a campo, entre el objeto de dominio `Visualization` y su DTO `VisualizationDto`.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(visualization: Visualization) -> VisualizationDto:
		"""Convierte una visualización de dominio en su DTO, para responder por la API.

		Args:
			visualization: Visualización de dominio.

		Returns:
			El DTO de la visualización.
		"""
		pieces: list[BIMModelVisualizationMarkerPieceDto] | None = None;
		if visualization.pieces is not None:
			pieces = [VisualizationPieceMapper.to_dto(piece) for piece in visualization.pieces];
		return VisualizationDto(
			id=visualization.id,
			user_id=visualization.user_id,
			bim_model_id=visualization.bim_model_id,
			name=visualization.name,
			description=visualization.description,
			observations=visualization.observations,
			is_public=visualization.is_public,
			pieces=pieces,
		);

	@staticmethod
	def to_domain(dto: VisualizationDto, user_id: int) -> Visualization:
		"""Convierte un DTO recibido por la API en una visualización de dominio, lista para guardar.

		Ignora `id` y `user_id` del DTO: el propietario no lo decide el cliente.

		Args:
			dto: DTO recibido.
			user_id: Identificador del usuario que la crea, tomado de su sesión.

		Returns:
			La visualización de dominio, activa y sin `id` hasta que se guarde.
		"""
		pieces: list[VisualizationPiece] | None = None;
		if dto.pieces is not None:
			pieces = [VisualizationPieceMapper.to_domain(piece) for piece in dto.pieces];
		return Visualization(
			user_id=user_id,
			bim_model_id=dto.bim_model_id,
			name=dto.name,
			description=dto.description,
			observations=dto.observations,
			is_public=dto.is_public,
			pieces=pieces,
		);

	# endregion PUBLIC STATIC METHODS
