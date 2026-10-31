from abc import ABC, abstractmethod;

from app.domain.models import ApplicationParameter, ApplicationParameterType;


class ApplicationParameterServiceBase(ABC):
	"""Contrato del servicio de parámetros de la aplicación: lo que se puede pedir a la aplicación sobre ellos."""

	# region PUBLIC METHODS

	@abstractmethod
	def get_parameters(self) -> list[ApplicationParameter]:
		"""Devuelve todos los parámetros de la aplicación.

		Returns:
			Los parámetros, con su valor actual.

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
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

	# endregion PUBLIC METHODS
