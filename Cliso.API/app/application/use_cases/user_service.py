from typing import ClassVar;

from app.application.exceptions import UserPasswordValidationError, UserProtectedError, UserValidationError;
from app.application.ports.inbound import AuthServiceBase, UserServiceBase;
from app.application.ports.outbound import UserRepositoryBase;
from app.domain.models import User;
from app.utils import PasswordUtils;


class UserService(UserServiceBase):
	"""Caso de uso de los usuarios: gestionarlos (alta, consulta, modificación y baja) y guardar su contraseña hasheada."""

	# region PUBLIC CONSTANTS

	PROTECTED_NICK: ClassVar[str] = "admin";
	"""Nick del único usuario protegido (en minúsculas, como se guardan todos): no se puede borrar ni cambiar su rol, para no perder el único punto de entrada válido."""

	# endregion PUBLIC CONSTANTS

	# region PRIVATE CONSTANTS

	_NICK_MAX_LENGTH: ClassVar[int] = 50;
	"""Longitud máxima del nick de un usuario (la de la columna `nick`)."""

	_NAME_MAX_LENGTH: ClassVar[int] = 100;
	"""Longitud máxima del nombre de un usuario (la de la columna `name`)."""

	_SURNAME_MAX_LENGTH: ClassVar[int] = 150;
	"""Longitud máxima de los apellidos de un usuario (la de la columna `surname`)."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, repository: UserRepositoryBase, auth_service: AuthServiceBase) -> None:
		"""Crea el servicio.

		Args:
			repository: Acceso a los usuarios guardados.
			auth_service: Servicio de autenticación, para cerrar las sesiones de un usuario cuando se borra o cambia de rol.
		"""
		self._repository = repository;
		"""Acceso a los usuarios guardados."""

		self._auth_service = auth_service;
		"""Servicio de autenticación, para cerrar las sesiones de un usuario cuando se borra o cambia de rol."""

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
		return self._repository.get_by_id(user_id);

	def add_user(self, user: User, password: str) -> User:
		"""Añade un usuario. Su contraseña se guarda hasheada.

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
		user.nick = self._validate_nick(user.nick);
		user.name = self._validate_text("nombre", user.name, self._NAME_MAX_LENGTH);
		user.surname = self._validate_text("apellidos", user.surname, self._SURNAME_MAX_LENGTH);
		self._validate_password(password);
		user.password = PasswordUtils.hash(password);
		return self._repository.add(user);

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
			UserProtectedError: Si se intenta cambiar el rol del usuario protegido.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		# 1. Comprobamos todos los datos recibidos antes de tocar nada.
		nick = self._validate_nick(user.nick);
		name = self._validate_text("nombre", user.name, self._NAME_MAX_LENGTH);
		surname = self._validate_text("apellidos", user.surname, self._SURNAME_MAX_LENGTH);
		if password is not None:
			self._validate_password(password);
		else:
			# Sin contraseña nueva se conserva la que ya tiene.
			pass;

		# 2. Aplicamos los cambios sobre el usuario guardado.
		stored = self._repository.get_by_id(user_id);
		# El nick nunca se cambia: una vez guardado, es intocable para cualquier usuario.
		if nick != stored.nick:
			raise UserValidationError("El nick de un usuario no se puede cambiar una vez guardado");
		# El usuario protegido puede cambiar su contraseña y sus datos, pero no su rol: dejaría de ser el único punto
		# de entrada válido.
		if stored.nick == self.PROTECTED_NICK and user.role != stored.role:
			raise UserProtectedError(f"El usuario '{stored.nick}' está protegido: no se puede cambiar su rol");
		is_role_changed = user.role != stored.role;
		stored.name = name;
		stored.surname = surname;
		stored.role = user.role;
		if password is not None:
			stored.password = PasswordUtils.hash(password);
		else:
			# Sin contraseña nueva se conserva la que ya tiene.
			pass;
		self._repository.update(stored);

		# 3. Si ha cambiado de rol, sus sesiones abiertas llevan el rol antiguo: se cierran para que vuelva a entrar.
		if is_role_changed and stored.id is not None:
			self._auth_service.close_user_sessions(stored.id);
		else:
			# El rol no cambia: sus sesiones siguen valiendo.
			pass;
		return stored;

	def delete_user(self, user_id: int, force: bool) -> None:
		"""Elimina un usuario.

		Args:
			user_id: Identificador del usuario.
			force: Si es False, el borrado es lógico (el usuario queda inactivo y se conservan sus datos y sus
				visualizaciones). Si es True, se borran de verdad el usuario y sus visualizaciones.

		Raises:
			UserNotFoundError: Si no existe el usuario (con `force` False, tiene que estar activo).
			UserProtectedError: Si es el usuario protegido.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		# TODO: cuando exista el login, impedir también que un usuario se borre a sí mismo (el usuario conectado).
		self._check_not_protected(self._repository.get_by_id(user_id, include_inactive=True));
		if force:
			self._repository.delete(user_id);
		else:
			self._repository.deactivate(user_id);
		# Un usuario borrado no puede seguir con sesiones abiertas.
		self._auth_service.close_user_sessions(user_id);

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _check_not_protected(self, user: User) -> None:
		"""Comprueba que el usuario que se quiere borrar no es el protegido.

		Args:
			user: Usuario guardado que se quiere borrar.

		Raises:
			UserProtectedError: Si es el usuario protegido.
		"""
		if user.nick == self.PROTECTED_NICK:
			raise UserProtectedError(f"El usuario '{user.nick}' está protegido: no se puede borrar");

	def _validate_nick(self, nick: str) -> str:
		"""Comprueba el nick de un usuario y lo normaliza: el nick siempre se guarda en minúsculas.

		Args:
			nick: Nick recibido.

		Returns:
			El nick sin espacios al principio ni al final y en minúsculas.

		Raises:
			UserValidationError: Si el nick está vacío o supera la longitud máxima.
		"""
		return self._validate_text("nick", nick, self._NICK_MAX_LENGTH).lower();

	def _validate_text(self, field_name: str, value: str, max_length: int) -> str:
		"""Comprueba un dato de texto de un usuario (nick, nombre o apellidos).

		Args:
			field_name: Nombre del dato, para el mensaje de error.
			value: Valor recibido.
			max_length: Longitud máxima permitida.

		Returns:
			El valor sin espacios al principio ni al final.

		Raises:
			UserValidationError: Si el valor está vacío o supera la longitud máxima.
		"""
		clean_value = value.strip();
		if clean_value == "":
			raise UserValidationError(f"El campo '{field_name}' del usuario no puede estar vacío");
		if len(clean_value) > max_length:
			raise UserValidationError(f"El campo '{field_name}' del usuario no puede superar los {max_length} caracteres");
		return clean_value;

	def _validate_password(self, password: str) -> None:
		"""Comprueba que una contraseña cumple los requisitos mínimos.

		Args:
			password: Contraseña en texto plano.

		Raises:
			UserPasswordValidationError: Si no cumple algún requisito.
		"""
		requirements = PasswordUtils.check_requirements(password);
		if len(requirements) > 0:
			raise UserPasswordValidationError(requirements);

	# endregion PRIVATE METHODS
