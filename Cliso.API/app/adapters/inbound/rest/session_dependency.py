from typing import Annotated, ClassVar;

from fastapi import Cookie, Request;

from app.application.exceptions import AuthSessionNotValidError;
from app.application.ports.inbound import AuthServiceBase;
from app.domain.models import Session;


class SessionDependency:
	"""Exige una sesión válida en un endpoint: la comprueba con el token de la cookie y la IP del cliente.

	Se aplica con `Depends(SessionDependency(auth_service).require_session)` y, si no hay sesión válida, la petición
	acaba con `AuthSessionNotValidError` sin llegar al endpoint.

	Por defecto cada petición con sesión válida cuenta como actividad y reinicia el plazo de caducidad. Para las
	peticiones que no deben mantener la sesión viva (por ejemplo, las que se repiten solas, sin que el usuario haga
	nada) se crea con `renew=False`.
	"""

	# region PUBLIC CONSTANTS

	COOKIE_NAME: ClassVar[str] = "cliso_session";
	"""Nombre de la cookie que lleva el token de la sesión."""

	# endregion PUBLIC CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, auth_service: AuthServiceBase, renew: bool = True) -> None:
		"""Crea la dependencia.

		Args:
			auth_service: Servicio de autenticación con el que se comprueba el token.
			renew: True (lo normal) si cada petición debe reiniciar el plazo de caducidad de la sesión.
		"""
		self._auth_service = auth_service;
		"""Servicio de autenticación con el que se comprueba el token."""

		self._renew = renew;
		"""Indica si cada petición reinicia el plazo de caducidad de la sesión."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def require_session(
		self, request: Request, token: Annotated[str | None, Cookie(alias=COOKIE_NAME)] = None
	) -> Session:
		"""Entrega la sesión de la petición. Responde 401 si no hay sesión válida desde la IP del cliente.

		Args:
			request: Petición recibida, de la que se toma la IP del cliente.
			token: Token de la sesión, de la cookie (None si la petición no la trae).

		Returns:
			La sesión a la que corresponde el token.

		Raises:
			AuthSessionNotValidError: Si no hay sesión válida: no hay cookie, el token es desconocido, la sesión ha
				caducado o la petición llega desde otra IP.
		"""
		if token is None:
			raise AuthSessionNotValidError("No hay una sesión iniciada");
		return self._auth_service.get_session(token, SessionDependency.get_client_ip(request), self._renew);

	# endregion PUBLIC METHODS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def get_client_ip(request: Request) -> str:
		"""Devuelve la dirección IP desde la que llega la petición, tal como la ve la API (`request.client.host`).

		Aquí no se leen cabeceras como `X-Forwarded-For`, pero el servidor (uvicorn) puede sustituir esa IP por la que
		declare un proxy en el que confíe (`--forwarded-allow-ips`; por defecto, solo `127.0.0.1`). Por eso hay que limitar
		qué equipos pueden llegar directamente a la API: desde uno de confianza se podría falsear la IP.

		Args:
			request: Petición recibida.

		Returns:
			La IP del cliente, o «unknown» si la conexión no la indica.
		"""
		ip_address = "unknown";
		if request.client is not None:
			ip_address = request.client.host;
		else:
			# La conexión no informa del cliente: todas esas peticiones comparten la misma «dirección».
			pass;
		return ip_address;

	# endregion PUBLIC STATIC METHODS
