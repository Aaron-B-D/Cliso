from abc import ABC, abstractmethod;

from app.domain.models import Session, User;


class UserServiceBase(ABC):
	"""Contrato del servicio de usuarios: lo que se puede pedir a la aplicación sobre la gestión de usuarios.

	Todas las operaciones se hacen en nombre del usuario de una sesión, y exigen que su rol pueda gestionar usuarios.
	"""

	# region PUBLIC METHODS

	@abstractmethod
	def get_users(self, session: Session) -> list[User]:
		"""Recupera todos los usuarios activos.

		Args:
			session: Sesión del usuario que los pide.

		Returns:
			Los usuarios activos (la lista queda vacía si no hay ninguno).

		Raises:
			PermissionDeniedError: Si el rol del usuario no permite gestionar usuarios.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_user(self, session: Session, user_id: int) -> User:
		"""Recupera el usuario activo con ese identificador.

		Args:
			session: Sesión del usuario que lo pide.
			user_id: Identificador del usuario.

		Returns:
			El usuario encontrado.

		Raises:
			PermissionDeniedError: Si el rol del usuario no permite gestionar usuarios.
			UserNotFoundError: Si no hay ningún usuario activo con ese identificador.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def add_user(self, session: Session, user: User, password: str) -> User:
		"""Añade un usuario. Su contraseña se guarda hasheada y su nick siempre en minúsculas (`Admin` y `admin` son el mismo).

		Args:
			session: Sesión del usuario que lo crea.
			user: Usuario a añadir (sin `id`). Su campo `password` se ignora: se sustituye por el hash de `password`.
			password: Contraseña en texto plano.

		Returns:
			El usuario guardado, con el `id` que le ha asignado el sistema.

		Raises:
			PermissionDeniedError: Si el rol del usuario no permite gestionar usuarios.
			UserValidationError: Si el nick, el nombre o los apellidos están vacíos o son demasiado largos.
			UserPasswordValidationError: Si la contraseña no cumple los requisitos mínimos.
			UserAlreadyExistsError: Si ya hay otro usuario con ese nick.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def update_user(self, session: Session, user_id: int, user: User, password: str | None) -> User:
		"""Modifica el nombre, los apellidos y el rol de un usuario, y opcionalmente su contraseña. El nick no se puede cambiar.

		Args:
			session: Sesión del usuario que lo modifica.
			user_id: Identificador del usuario a modificar.
			user: Usuario con los datos nuevos. Se usan su nombre, apellidos y rol; su nick debe ser el que ya tiene.
			password: Contraseña nueva en texto plano, o None para dejar la que tiene.

		Returns:
			El usuario ya modificado.

		Raises:
			PermissionDeniedError: Si el rol del usuario no permite gestionar usuarios.
			UserValidationError: Si el nick, el nombre o los apellidos están vacíos o son demasiado largos, o si el
				nick es distinto del que ya tiene el usuario.
			UserPasswordValidationError: Si se indica una contraseña y no cumple los requisitos mínimos.
			UserNotFoundError: Si no hay ningún usuario activo con ese identificador.
			UserProtectedError: Si se intenta cambiar el rol del usuario protegido (`admin`).
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def delete_user(self, session: Session, user_id: int, force: bool) -> None:
		"""Elimina un usuario.

		Args:
			session: Sesión del usuario que lo elimina.
			user_id: Identificador del usuario.
			force: Si es False, el borrado es lógico (el usuario queda inactivo y se conservan sus datos y sus
				visualizaciones). Si es True, se borran de verdad el usuario y sus visualizaciones.

		Raises:
			PermissionDeniedError: Si el rol del usuario no permite gestionar usuarios.
			UserSelfDeletionError: Si el usuario intenta borrarse a sí mismo.
			UserNotFoundError: Si no existe el usuario (con `force` False, tiene que estar activo).
			UserProtectedError: Si es el usuario protegido (`admin`), que no se puede borrar.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
