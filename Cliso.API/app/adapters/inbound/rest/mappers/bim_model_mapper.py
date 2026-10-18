from app.adapters.inbound.rest import BIMModelDto;
from app.domain.models import BIMModel;


class BIMModelMapper:
	"""Convierte, campo a campo, entre el objeto de dominio `BIMModel` y su DTO `BIMModelDto`.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(model: BIMModel) -> BIMModelDto:
		"""Convierte un modelo BIM de dominio en su DTO, para responder por la API.

		Args:
			model: Modelo BIM de dominio.

		Returns:
			El DTO del modelo.
		"""
		return BIMModelDto(
			id=model.id,
			name=model.name,
			description=model.description,
			file_name=model.file_name,
			creation_date=model.creation_date,
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
			file_name=file_name,
		);

	# endregion PUBLIC STATIC METHODS
