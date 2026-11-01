from typing import Annotated, Literal;

from fastapi import APIRouter, Cookie, Depends, Request, Response;

from app.adapters.inbound.rest import LoginDto, SessionDto, SessionDependency, SessionMapper;
from app.application.ports.inbound import AuthServiceBase;
from app.config import SessionCookieSameSite;
from app.domain.models import Session;


class AuthRouter:
	"""Endpoints de la autenticación: iniciar sesión, cerrarla y consultar la actual.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create(service: AuthServiceBase, same_site: SessionCookieSameSite) -> APIRouter:
		"""Crea el router de la autenticación.

		Args:
			service: Servicio de autenticación que usan sus endpoints.
			same_site: Política `SameSite` de la cookie de la sesión, según dónde esté alojada la web respecto a la API.

		Returns:
			El router, listo para incluirlo en la aplicación.
		"""
		router = APIRouter(prefix="/auth", tags=["Autenticación"]);
		cookie_same_site = AuthRouter._to_cookie_same_site(same_site);

		@router.post("/login")
		def login(dto: LoginDto, request: Request, response: Response) -> SessionDto:
			"""Inicia sesión. Responde 401 si el nick o la contraseña no son correctos y 429 si ya ha fallado demasiadas veces.

			Un usuario puede tener varias sesiones a la vez (por ejemplo, desde distintos equipos). Cada una queda ligada
			a la IP desde la que se inició: el token no sirve desde otra.

			El token de la sesión se entrega en una cookie `HttpOnly` (el JavaScript del navegador no puede leerla), que
			dura hasta que se cierra el navegador; la caducidad por inactividad la controla la API.

			Args:
				dto: Nick y contraseña.
				request: Petición recibida, de la que se toma la IP del cliente.
				response: Respuesta en la que se pone la cookie.

			Returns:
				La sesión iniciada, sin el token.
			"""
			session = service.login(dto.nick, dto.password, SessionDependency.get_client_ip(request));
			response.set_cookie(
				key=SessionDependency.COOKIE_NAME,
				value=session.token,
				httponly=True,
				secure=AuthRouter._is_cookie_secure(request, same_site),
				samesite=cookie_same_site,
				path="/",
			);
			return SessionMapper.to_dto(session);

		@router.post("/logout", status_code=204)
		def logout(request: Request, token: Annotated[str | None, Cookie(alias=SessionDependency.COOKIE_NAME)] = None) -> Response:
			"""Cierra la sesión y borra la cookie. Si no había sesión, responde igualmente 204.

			Args:
				request: Petición recibida, de la que se decide si la cookie va marcada como `Secure`.
				token: Token de la sesión, de la cookie (None si la petición no la trae).

			Returns:
				Respuesta vacía.
			"""
			if token is not None:
				service.logout(token);
			else:
				# No había sesión que cerrar.
				pass;
			response = Response(status_code=204);
			# Para borrarla, la cookie lleva los mismos atributos con los que se creó.
			response.delete_cookie(
				key=SessionDependency.COOKIE_NAME,
				path="/",
				secure=AuthRouter._is_cookie_secure(request, same_site),
				httponly=True,
				samesite=cookie_same_site,
			);
			return response;

		@router.get("/me")
		def get_current_session(session: Annotated[Session, Depends(SessionDependency(service).require_session)]) -> SessionDto:
			"""Devuelve la sesión actual. Responde 401 si no hay una sesión válida.

			Args:
				session: Sesión de la petición, entregada por la dependencia.

			Returns:
				La sesión actual, sin el token.
			"""
			return SessionMapper.to_dto(session);

		return router;

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _is_cookie_secure(request: Request, same_site: SessionCookieSameSite) -> bool:
		"""Decide si la cookie de la sesión viaja solo por https.

		Va marcada como `Secure` cuando la API se sirve por https (en local, con http, no podría usarse) y siempre con
		`SameSite=None`, porque el navegador rechaza ese tipo de cookie sin https.

		Args:
			request: Petición recibida.
			same_site: Política `SameSite` configurada.

		Returns:
			True si la cookie debe llevar `Secure`.
		"""
		return request.url.scheme == "https" or same_site == SessionCookieSameSite.NONE;

	@staticmethod
	def _to_cookie_same_site(same_site: SessionCookieSameSite) -> Literal["lax", "strict", "none"]:
		"""Convierte la política configurada en el valor que admite la cookie.

		Args:
			same_site: Política `SameSite` configurada.

		Returns:
			El valor de `SameSite` para la cookie.
		"""
		if same_site == SessionCookieSameSite.NONE:
			result: Literal["lax", "strict", "none"] = "none";
		elif same_site == SessionCookieSameSite.STRICT:
			result = "strict";
		else:
			result = "lax";
		return result;

	# endregion PRIVATE STATIC METHODS
