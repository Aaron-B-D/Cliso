from abc import ABC, abstractmethod;

from app.domain.models import User;


class UserRepositoryBase(ABC):
	"""Contrato de acceso a los usuarios guardados. Solo trabaja con usuarios activos."""

	# region PUBLIC METHODS

	@abstractmethod
	def get_all(self) -> list[User]:
		"""Recupera todos los usuarios activos.

		Returns:
			Los usuarios activos, ordenados por nick (la lista queda vacía si no hay ninguno).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_by_nick(self, nick: str) -> User:
		"""Recupera el usuario activo con ese nick.

		Args:
			nick: Alias del usuario.

		Returns:
			El usuario encontrado.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese nick.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
