from app.adapters.inbound.rest import BIMModelVisualizationMarkerPieceDto;
from app.domain.models import BIMModelVisualizationMarkerPiece, VisualizationPiece;


class VisualizationPieceMapper:
	"""Convierte, campo a campo, entre las piezas de dominio y sus DTOs.

	Clase estática: no se instancia. De momento solo hay un tipo de pieza, el marcador.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(piece: VisualizationPiece) -> BIMModelVisualizationMarkerPieceDto:
		"""Convierte una pieza de dominio en su DTO, para responder por la API.

		Args:
			piece: Pieza de dominio.

		Returns:
			El DTO de la pieza.

		Raises:
			ValueError: Si el tipo de la pieza no está soportado.
		"""
		if not isinstance(piece, BIMModelVisualizationMarkerPiece):
			raise ValueError(f"Tipo de pieza no soportado: '{piece.type}'");

		return BIMModelVisualizationMarkerPieceDto(
			id=piece.id,
			x=piece.x,
			y=piece.y,
			z=piece.z,
			color=piece.color,
			anchor_id=piece.anchor_id,
			description=piece.description,
			dim_when_idle=piece.dim_when_idle,
			highlight_on_select=piece.highlight_on_select,
			icon=piece.icon,
			link=piece.link,
			link_target=piece.link_target,
			opacity=piece.opacity,
			size=piece.size,
			text_color=piece.text_color,
			title=piece.title,
			title_position=piece.title_position,
			visible_through_model=piece.visible_through_model,
		);

	@staticmethod
	def to_domain(dto: BIMModelVisualizationMarkerPieceDto) -> VisualizationPiece:
		"""Convierte un DTO recibido por la API en una pieza de dominio, lista para guardar.

		Ignora `id` del DTO: lo asigna el sistema al guardar.

		Args:
			dto: DTO recibido.

		Returns:
			La pieza de dominio, sin `id` hasta que se guarde.
		"""
		return BIMModelVisualizationMarkerPiece(
			x=dto.x,
			y=dto.y,
			z=dto.z,
			color=dto.color,
			anchor_id=dto.anchor_id,
			description=dto.description,
			dim_when_idle=dto.dim_when_idle,
			highlight_on_select=dto.highlight_on_select,
			icon=dto.icon,
			link=dto.link,
			link_target=dto.link_target,
			opacity=dto.opacity,
			size=dto.size,
			text_color=dto.text_color,
			title=dto.title,
			title_position=dto.title_position,
			visible_through_model=dto.visible_through_model,
		);

	# endregion PUBLIC STATIC METHODS
