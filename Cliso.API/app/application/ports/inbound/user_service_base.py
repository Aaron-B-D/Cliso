from abc import ABC, abstractmethod;

from app.domain.models import User;


class UserServiceBase(ABC):
	"""Contrato del servicio de usuarios: lo que se puede pedir a la aplicación sobre la gestión de usuarios."""

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
	def get_user(self, user_id: int) -> User:
		"""Recupera el usuario activo con ese identificador.

		Args:
			user_id: Identificador del usuario.

		Returns:
			El usuario encontrado.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese identificador.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def add_user(self, user: User, password: str) -> User:
		"""Añade un usuario. Su contraseña se guarda hasheada y su nick siempre en minúsculas (`Admin` y `admin` son el mismo).

		Args:
			user: Usuario a añadir (sin `id`). Su campo `password` se ignora: se sustituye por el hash de `password`.
			password: Contraseña en texto plano.

		Returns:
			El usuario guardado, con el `id` que le ha asignado el sistema.

		Raises:
			UserValidationError: Si el nick, el nombre o los apellidos están vacíos o son demasiado largos.
			UserPasswordValidationError: Si la contraseña no cumple los requisitos mínimos.
			UserAlreadyExistsError: Si ya hay otro usuario con ese nick.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def update_user(self, user_id: int, user: User, password: str | None) -> User:
		"""Modifica el nombre, los apellidos y el rol de un usuario, y opcionalmente su contraseña. El nick no se puede cambiar.

		Args:
			user_id: Identificador del usuario a modificar.
			user: Usuario con los datos nuevos. Se usan su nombre, apellidos y rol; su nick debe ser el que ya tiene.
			password: Contraseña nueva en texto plano, o None para dejar la que tiene.

		Returns:
			El usuario ya modificado.

		Raises:
			UserValidationError: Si el nick, el nombre o los apellidos están vacíos o son demasiado largos, o si el
				nick es distinto del que ya tiene el usuario.
			UserPasswordValidationError: Si se indica una contraseña y no cumple los requisitos mínimos.
			UserNotFoundError: Si no hay ningún usuario activo con ese identificador.
			UserProtectedError: Si se intenta cambiar el rol del usuario protegido (`admin`).
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def delete_user(self, user_id: int, force: bool) -> None:
		"""Elimina un usuario.

		Args:
			user_id: Identificador del usuario.
			force: Si es False, el borrado es lógico (el usuario queda inactivo y se conservan sus datos y sus
				visualizaciones). Si es True, se borran de verdad el usuario y sus visualizaciones.

		Raises:
			UserNotFoundError: Si no existe el usuario (con `force` False, tiene que estar activo).
			UserProtectedError: Si es el usuario protegido (`admin`), que no se puede borrar.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
