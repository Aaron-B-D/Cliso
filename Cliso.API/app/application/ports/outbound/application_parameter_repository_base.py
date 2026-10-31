from abc import ABC, abstractmethod;

from app.domain.models import ApplicationParameter, ApplicationParameterType;


class ApplicationParameterRepositoryBase(ABC):
	"""Contrato de acceso a los parámetros de la aplicación guardados."""

	# region PUBLIC METHODS

	@abstractmethod
	def get_all(self) -> list[ApplicationParameter]:
		"""Recupera todos los parámetros de la aplicación.

		Returns:
			Los parámetros, ordenados por tipo (la lista queda vacía si no hay ninguno).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_by_type(self, parameter_type: ApplicationParameterType) -> ApplicationParameter:
		"""Recupera el parámetro de ese tipo.

		Args:
			parameter_type: Tipo del parámetro.

		Returns:
			El parámetro encontrado.

		Raises:
			ApplicationParameterNotFoundError: Si no existe el parámetro.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
