from abc import ABC, abstractmethod;

from app.domain.models import Session;


class AuthServiceBase(ABC):
	"""Contrato de la autenticación: iniciar, comprobar y cerrar sesiones."""

	# region PUBLIC METHODS

	@abstractmethod
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

	@abstractmethod
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

	@abstractmethod
	def logout(self, token: str) -> None:
		"""Cierra la sesión con ese token. Si no existe ya, no hace nada.

		Args:
			token: Token de la sesión.
		"""

	@abstractmethod
	def close_user_sessions(self, user_id: int) -> None:
		"""Cierra todas las sesiones abiertas de un usuario (en todos sus equipos). Si no tiene ninguna, no hace nada.

		Args:
			user_id: Identificador del usuario.
		"""

	# endregion PUBLIC METHODS
