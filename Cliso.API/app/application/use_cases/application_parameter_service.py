from app.application.ports.inbound import ApplicationParameterServiceBase;
from app.application.ports.outbound import ApplicationParameterRepositoryBase;
from app.domain.models import ApplicationParameter, ApplicationParameterType;


class ApplicationParameterService(ApplicationParameterServiceBase):
	"""Caso de uso de los parámetros de la aplicación: sirve los guardados en base de datos."""

	# region CONSTRUCTOR

	def __init__(self, repository: ApplicationParameterRepositoryBase) -> None:
		"""Crea el servicio.

		Args:
			repository: Repositorio donde están guardados los parámetros.
		"""
		self._repository = repository;
		"""Repositorio donde están guardados los parámetros."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_parameters(self) -> list[ApplicationParameter]:
		"""Devuelve todos los parámetros de la aplicación.

		Returns:
			Los parámetros, con su valor actual.

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		return self._repository.get_all();

	def get_parameter(self, parameter_type: ApplicationParameterType) -> ApplicationParameter:
		"""Devuelve un parámetro de la aplicación.

		Args:
			parameter_type: Tipo del parámetro.

		Returns:
			El parámetro pedido.

		Raises:
			ApplicationParameterNotFoundError: Si ese parámetro no existe.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		return self._repository.get_by_type(parameter_type);

	# endregion PUBLIC METHODS
