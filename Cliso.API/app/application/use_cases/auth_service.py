import secrets;
import threading;
from datetime import datetime;
from typing import ClassVar;

from app.application.exceptions import (
	AuthInvalidCredentialsError,
	AuthSessionNotValidError,
	AuthTooManyAttemptsError,
	PersistenceError,
	UserNotFoundError,
);
from app.application.ports.inbound import AuthServiceBase;
from app.application.ports.outbound import UserRepositoryBase;
from app.domain.models import Session, User;
from app.utils import PasswordUtils;


class AuthService(AuthServiceBase):
	"""Caso de uso de la autenticación: abre sesiones con nick y contraseña y las guarda en memoria.

	Las sesiones no se guardan en base de datos: se pierden al parar la API. Cada sesión caduca tras un tiempo sin usarse.
	Los intentos fallidos de login también se llevan en memoria, para bloquear un tiempo a quien falla demasiadas veces.
	"""

	# region PRIVATE CONSTANTS

	_MAX_FAILED_ATTEMPTS: ClassVar[int] = 5;
	"""Intentos fallidos de login (de un mismo nick desde una misma IP) dentro del plazo, a partir de los cuales se bloquea."""

	_FAILED_ATTEMPTS_WINDOW_MILLISECONDS: ClassVar[int] = 15 * 60 * 1000;
	"""Plazo (15 minutos) durante el que cuenta un intento fallido: el bloqueo termina cuando los fallos salen de él."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, user_repository: UserRepositoryBase, timeout_milliseconds: int) -> None:
		"""Crea el servicio.

		Args:
			user_repository: Acceso a los usuarios guardados.
			timeout_milliseconds: Milisegundos sin usar una sesión tras los cuales caduca.
		"""
		self._user_repository = user_repository;
		"""Acceso a los usuarios guardados."""

		self._timeout_milliseconds = timeout_milliseconds;
		"""Milisegundos sin usar una sesión tras los cuales caduca."""

		self._sessions: dict[str, Session] = {};
		"""Sesiones abiertas, por token."""

		self._failed_attempts: dict[str, list[datetime]] = {};
		"""Fechas de los intentos fallidos de login recientes, por «IP|nick»."""

		self._sessions_lock = threading.Lock();
		"""Cerrojo que protege las sesiones y los intentos fallidos: FastAPI atiende varias peticiones a la vez en hilos distintos."""

		self._fake_hash = PasswordUtils.hash(secrets.token_urlsafe(16));
		"""Hash de una contraseña inventada. Se comprueba cuando el nick no existe, para que el login tarde lo mismo
		que cuando existe y no revele qué nicks hay."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def login(self, nick: str, password: str, ip_address: str) -> Session:
		"""Inicia una sesión si el nick y la contraseña son correctos. Un usuario puede tener varias sesiones a la vez.

		Args:
			nick: Nick del usuario (no distingue mayúsculas de minúsculas).
			password: Contraseña en texto plano.
			ip_address: Dirección IP desde la que se inicia la sesión: la sesión solo valdrá desde ella.

		Returns:
			La sesión nueva, con el token que el cliente debe presentar en cada petición.

		Raises:
			AuthInvalidCredentialsError: Si el nick o la contraseña no son correctos.
			AuthTooManyAttemptsError: Si ese nick, desde esa IP, ha fallado demasiadas veces seguidas y está bloqueado
				temporalmente.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		# 0. Si ya ha fallado demasiadas veces, ni se mira la contraseña (tampoco se gasta CPU en hashearla).
		clean_nick = nick.strip().lower();
		attempts_key = f"{ip_address}|{clean_nick}";
		self._check_not_blocked(attempts_key);

		# 1. Buscamos al usuario. Si no existe, se comprueba igualmente la contraseña contra un hash inventado.
		user: User | None;
		try:
			user = self._user_repository.get_by_nick(clean_nick);
			stored_hash = user.password;
		except UserNotFoundError:
			user = None;
			stored_hash = self._fake_hash;
		is_password_valid = PasswordUtils.verify(password, stored_hash);

		# 2. Si el usuario no existe o la contraseña no coincide, el mensaje es el mismo en ambos casos.
		if user is None or not is_password_valid:
			self._register_failure(attempts_key);
			raise AuthInvalidCredentialsError("El nick o la contraseña no son correctos");
		if user.id is None:
			raise PersistenceError(f"El usuario '{user.nick}' guardado no tiene identificador");
		self._clear_failures(attempts_key);

		# 3. Abrimos la sesión con un token aleatorio imposible de adivinar.
		session = Session(
			token=secrets.token_urlsafe(32), user_id=user.id, nick=user.nick, role=user.role, ip_address=ip_address
		);
		self._sessions_lock.acquire();
		try:
			self._remove_expired_data();
			self._sessions[session.token] = session;
		finally:
			self._sessions_lock.release();
		return session;

	def get_session(self, token: str, ip_address: str, renew: bool = True) -> Session:
		"""Comprueba que el token corresponde a una sesión válida desde esa IP y, por defecto, anota que se ha usado ahora.

		Args:
			token: Token de la sesión.
			ip_address: Dirección IP desde la que llega la petición: tiene que ser la que inició la sesión.
			renew: Si es True (lo normal), la petición cuenta como actividad y reinicia el plazo de caducidad. Si es
				False, solo se comprueba la sesión y su plazo sigue corriendo.

		Returns:
			La sesión a la que corresponde el token.

		Raises:
			AuthSessionNotValidError: Si el token es desconocido, la sesión ha caducado por inactividad o la petición
				llega desde otra dirección IP.
		"""
		self._sessions_lock.acquire();
		try:
			session = self._sessions.get(token);
			if session is None:
				raise AuthSessionNotValidError("No hay una sesión iniciada");
			# Un token robado no sirve desde otro sitio. La sesión no se cierra: sigue válida para su dueño.
			if session.ip_address != ip_address:
				raise AuthSessionNotValidError("La sesión no es válida desde esta dirección");
			now = datetime.now();
			if self._is_expired(session, now):
				del self._sessions[token];
				raise AuthSessionNotValidError("La sesión ha caducado por inactividad");
			if renew:
				session.last_access_date = now;
			else:
				# La petición no cuenta como actividad: el plazo de caducidad sigue corriendo desde el último uso.
				pass;
			return session;
		finally:
			self._sessions_lock.release();

	def logout(self, token: str) -> None:
		"""Cierra la sesión con ese token. Si no existe ya, no hace nada.

		Args:
			token: Token de la sesión.
		"""
		self._sessions_lock.acquire();
		try:
			self._sessions.pop(token, None);
		finally:
			self._sessions_lock.release();

	def close_user_sessions(self, user_id: int) -> None:
		"""Cierra todas las sesiones abiertas de un usuario (en todos sus equipos). Si no tiene ninguna, no hace nada.

		Args:
			user_id: Identificador del usuario.
		"""
		self._sessions_lock.acquire();
		try:
			user_tokens: list[str] = [];
			for token, session in self._sessions.items():
				if session.user_id == user_id:
					user_tokens.append(token);
				else:
					# Es de otro usuario: se conserva.
					pass;
			for token in user_tokens:
				del self._sessions[token];
		finally:
			self._sessions_lock.release();

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _check_not_blocked(self, attempts_key: str) -> None:
		"""Comprueba que ese nick, desde esa IP, no ha agotado sus intentos fallidos de login.

		Args:
			attempts_key: Clave «IP|nick» de los intentos.

		Raises:
			AuthTooManyAttemptsError: Si ya ha fallado el máximo de veces dentro del plazo.
		"""
		self._sessions_lock.acquire();
		try:
			recent_failures = self._get_recent_failures(attempts_key, datetime.now());
			if len(recent_failures) >= self._MAX_FAILED_ATTEMPTS:
				raise AuthTooManyAttemptsError("Demasiados intentos fallidos. Inténtalo de nuevo más tarde");
		finally:
			self._sessions_lock.release();

	def _register_failure(self, attempts_key: str) -> None:
		"""Anota un intento fallido de login.

		Args:
			attempts_key: Clave «IP|nick» de los intentos.
		"""
		self._sessions_lock.acquire();
		try:
			now = datetime.now();
			recent_failures = self._get_recent_failures(attempts_key, now);
			recent_failures.append(now);
			self._failed_attempts[attempts_key] = recent_failures;
		finally:
			self._sessions_lock.release();

	def _clear_failures(self, attempts_key: str) -> None:
		"""Olvida los intentos fallidos de login, porque el último ha sido correcto.

		Args:
			attempts_key: Clave «IP|nick» de los intentos.
		"""
		self._sessions_lock.acquire();
		try:
			self._failed_attempts.pop(attempts_key, None);
		finally:
			self._sessions_lock.release();

	def _get_recent_failures(self, attempts_key: str, now: datetime) -> list[datetime]:
		"""Devuelve los intentos fallidos que siguen dentro del plazo y olvida los más antiguos.

		Quien lo llama debe tener cogido el cerrojo.

		Args:
			attempts_key: Clave «IP|nick» de los intentos.
			now: Momento actual.

		Returns:
			Las fechas de los intentos fallidos recientes (vacía si no hay ninguno).
		"""
		recent_failures: list[datetime] = [];
		for failure_date in self._failed_attempts.get(attempts_key, []):
			elapsed_milliseconds = (now - failure_date).total_seconds() * 1000;
			if elapsed_milliseconds <= self._FAILED_ATTEMPTS_WINDOW_MILLISECONDS:
				recent_failures.append(failure_date);
			else:
				# Ya salió del plazo: deja de contar.
				pass;
		if len(recent_failures) > 0:
			self._failed_attempts[attempts_key] = recent_failures;
		else:
			self._failed_attempts.pop(attempts_key, None);
		return recent_failures;

	def _remove_expired_data(self) -> None:
		"""Borra las sesiones caducadas y los intentos fallidos antiguos, para que no se acumulen en memoria.

		Quien lo llama debe tener cogido el cerrojo.
		"""
		now = datetime.now();
		expired_tokens: list[str] = [];
		for token, session in self._sessions.items():
			if self._is_expired(session, now):
				expired_tokens.append(token);
			else:
				# Sigue en uso: se conserva.
				pass;
		for token in expired_tokens:
			del self._sessions[token];
		for attempts_key in list(self._failed_attempts.keys()):
			self._get_recent_failures(attempts_key, now);

	def _is_expired(self, session: Session, now: datetime) -> bool:
		"""Indica si una sesión lleva sin usarse más tiempo del permitido.

		Args:
			session: Sesión a comprobar.
			now: Momento actual.

		Returns:
			True si ha pasado más del tiempo de inactividad desde su último uso.
		"""
		inactive_milliseconds = (now - session.last_access_date).total_seconds() * 1000;
		return inactive_milliseconds > self._timeout_milliseconds;

	# endregion PRIVATE METHODS
