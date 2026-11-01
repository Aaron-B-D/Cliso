from app.adapters.inbound.rest import BIMModelDto;
from app.domain.models import BIMModel;
from app.domain.wrappers import BIMModelWrapper;


class BIMModelMapper:
	"""Convierte, campo a campo, entre el modelo BIM de dominio y su DTO `BIMModelDto`.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(wrapper: BIMModelWrapper) -> BIMModelDto:
		"""Convierte un modelo BIM de dominio con datos extra (el tamaño de su fichero) en su DTO, para responder por la API.

		Args:
			wrapper: Modelo BIM de dominio con sus datos extra.

		Returns:
			El DTO del modelo.
		"""
		return BIMModelDto(
			id=wrapper.id,
			name=wrapper.name,
			description=wrapper.description,
			observations=wrapper.observations,
			file_name=wrapper.file_name,
			creation_date=wrapper.creation_date,
			file_size=wrapper.file_size,
		);

	@staticmethod
	def to_domain(dto: BIMModelDto, file_name: str) -> BIMModel:
		"""Convierte un DTO recibido por la API en un modelo BIM de dominio, listo para guardar.

		Ignora `id`, `file_name` y `creation_date` del DTO: los asigna el sistema.

		Args:
			dto: DTO recibido.
			file_name: Nombre del fichero guardado. Lo decide la subida del fichero, no el cliente.

		Returns:
			El modelo de dominio, activo y sin `id` hasta que se guarde.
		"""
		return BIMModel(
			name=dto.name,
			description=dto.description,
			observations=dto.observations,
			file_name=file_name,
		);

	# endregion PUBLIC STATIC METHODS
