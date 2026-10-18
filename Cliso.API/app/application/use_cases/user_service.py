import hmac;

from app.application.ports.inbound import UserServiceBase;
from app.application.ports.outbound import UserRepositoryBase;
from app.domain.models import User;


class UserService(UserServiceBase):
	"""Caso de uso de los usuarios: recuperarlos y validar su contraseña."""

	# region CONSTRUCTOR

	def __init__(self, repository: UserRepositoryBase) -> None:
		"""Crea el servicio.

		Args:
			repository: Acceso a los usuarios guardados.
		"""
		self._repository = repository;
		"""Acceso a los usuarios guardados."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_users(self) -> list[User]:
		"""Recupera todos los usuarios activos.

		Returns:
			Los usuarios activos (la lista queda vacía si no hay ninguno).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		return self._repository.get_all();

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
		return self._repository.get_by_nick(nick);

	def validate_password(self, nick: str, password_hash: str) -> bool:
		"""Comprueba si el hash recibido coincide con el guardado para ese nick.

		La comparación es de tiempo constante, para no dar pistas sobre cuántos caracteres coinciden.

		Args:
			nick: Alias del usuario.
			password_hash: Hash de la contraseña a comprobar.

		Returns:
			True si coincide con la guardada; False si no.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese nick.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		user = self._repository.get_by_nick(nick);
		return hmac.compare_digest(user.password.encode("utf-8"), password_hash.encode("utf-8"));

	# endregion PUBLIC METHODS
