from app.adapters.inbound.rest import VisualizationDto;
from app.domain.models import Visualization;


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
		return VisualizationDto(
			id=visualization.id,
			owner_id=visualization.owner_id,
			model_id=visualization.model_id,
			name=visualization.name,
			description=visualization.description,
			observations=visualization.observations,
			is_public=visualization.is_public,
		);

	@staticmethod
	def to_domain(dto: VisualizationDto, owner_id: int) -> Visualization:
		"""Convierte un DTO recibido por la API en una visualización de dominio, lista para guardar.

		Ignora `id` y `owner_id` del DTO: el propietario no lo decide el cliente.

		Args:
			dto: DTO recibido.
			owner_id: Identificador del usuario que la crea, tomado de su sesión.

		Returns:
			La visualización de dominio, activa y sin `id` hasta que se guarde.
		"""
		return Visualization(
			owner_id=owner_id,
			model_id=dto.model_id,
			name=dto.name,
			description=dto.description,
			observations=dto.observations,
			is_public=dto.is_public,
		);

	# endregion PUBLIC STATIC METHODS
