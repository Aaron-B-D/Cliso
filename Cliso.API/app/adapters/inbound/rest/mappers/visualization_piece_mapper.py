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
		);

	# endregion PUBLIC STATIC METHODS
