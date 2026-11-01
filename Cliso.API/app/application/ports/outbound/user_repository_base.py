from abc import ABC, abstractmethod;

from app.domain.models import User;


class UserRepositoryBase(ABC):
	"""Contrato de acceso a los usuarios guardados."""

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
	def get_by_id(self, user_id: int, include_inactive: bool = False) -> User:
		"""Recupera el usuario con ese identificador.

		Args:
			user_id: Identificador del usuario.
			include_inactive: Si es True, también encuentra los usuarios borrados lógicamente.

		Returns:
			El usuario encontrado.

		Raises:
			UserNotFoundError: Si no existe el usuario (activo, salvo que `include_inactive` sea True).
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def add(self, user: User) -> User:
		"""Guarda un usuario nuevo.

		Args:
			user: Usuario a guardar (sin `id`, con la contraseña ya hasheada).

		Returns:
			El usuario guardado, con el `id` asignado por la base de datos.

		Raises:
			UserAlreadyExistsError: Si ya hay otro usuario con ese nick.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def update(self, user: User) -> None:
		"""Guarda los cambios de nombre, apellidos, contraseña y rol de un usuario activo. El nick no se cambia nunca.

		Args:
			user: Usuario con los datos nuevos (con `id` y la contraseña ya hasheada).

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese `id`.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def deactivate(self, user_id: int) -> None:
		"""Borra lógicamente un usuario: lo deja inactivo y conserva todos sus datos.

		Args:
			user_id: Identificador del usuario.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese identificador.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def delete(self, user_id: int) -> None:
		"""Borra de verdad un usuario, activo o no, junto con sus visualizaciones.

		Args:
			user_id: Identificador del usuario.

		Raises:
			UserNotFoundError: Si no existe el usuario.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
