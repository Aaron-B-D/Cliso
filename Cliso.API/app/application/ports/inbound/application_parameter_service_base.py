from abc import ABC, abstractmethod;

from app.domain.models import ApplicationParameter, ApplicationParameterType, Session;


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

	@abstractmethod
	def update_parameter(
		self, session: Session, parameter_type: ApplicationParameterType, value: str
	) -> ApplicationParameter:
		"""Modifica el valor actual de un parámetro de la aplicación.

		Args:
			session: Sesión del usuario que lo modifica.
			parameter_type: Tipo del parámetro.
			value: Valor nuevo, como texto.

		Returns:
			El parámetro modificado.

		Raises:
			PermissionDeniedError: Si el rol del usuario no permite modificar los parámetros.
			ApplicationParameterNotFoundError: Si ese parámetro no existe.
			ApplicationParameterValidationError: Si el valor no es válido para el tipo del parámetro.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
