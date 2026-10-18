from abc import ABC, abstractmethod;

from app.domain.models import User;


class UserServiceBase(ABC):
	"""Contrato del servicio de usuarios: lo que se puede pedir a la aplicación sobre los usuarios."""

	# region PUBLIC METHODS

	@abstractmethod
	def get_users(self) -> list[User]:
		"""Recupera todos los usuarios activos.

		Returns:
			Los usuarios activos (la lista queda vacía si no hay ninguno).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_user_by_nick(self, nick: str) -> User:
		"""Recupera el usuario activo con ese nick.

		Args:
			nick: Alias del usuario.

		Returns:
			El usuario encontrado.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese nick.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def validate_password(self, nick: str, password_hash: str) -> bool:
		"""Comprueba si la contraseña (ya hasheada) corresponde al usuario con ese nick.

		Args:
			nick: Alias del usuario.
			password_hash: Hash de la contraseña a comprobar.

		Returns:
			True si coincide con la guardada; False si no.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese nick.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
