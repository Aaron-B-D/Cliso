import time;

from fastapi import Request, Response;
from starlette.middleware.base import RequestResponseEndpoint;

from app.logger import Logger;


class RequestLogger:
	"""Anota en el log, como depuración, cada petición que recibe la API: método, ruta, código de respuesta y duración.

	Clase estática: no se instancia. `log_request` es la función de un middleware: quien monta la aplicación la
	registra para que envuelva a todas las peticiones. Por privacidad no se anotan ni el cuerpo, ni las cabeceras, ni
	las cookies, ni los parámetros de la URL (podrían llevar contraseñas o tokens). Con el log en un nivel mayor que
	depuración, las líneas se descartan sin llegar a escribirse.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	async def log_request(request: Request, call_next: RequestResponseEndpoint) -> Response:
		"""Deja pasar la petición al resto de la aplicación y, cuando hay respuesta, la anota en el log.

		Si la petición acaba en una excepción no controlada, se anota y se deja seguir la excepción, para que la
		trate quien corresponda (el error, con su traza, se registra allí).

		Args:
			request: Petición recibida.
			call_next: Siguiente paso de la aplicación, que atiende la petición y devuelve la respuesta.

		Returns:
			La respuesta de la aplicación, sin cambios.

		Raises:
			Exception: La que lance la aplicación al atender la petición, sin cambios.
		"""
		start = time.perf_counter();
		try:
			response = await call_next(request);
		except Exception:
			elapsed_milliseconds = (time.perf_counter() - start) * 1000;
			Logger.debug(
				f"{request.method} {request.url.path} -> excepción no controlada ({elapsed_milliseconds:.0f} ms)"
			);
			raise;
		elapsed_milliseconds = (time.perf_counter() - start) * 1000;
		Logger.debug(f"{request.method} {request.url.path} -> {response.status_code} ({elapsed_milliseconds:.0f} ms)");
		return response;

	# endregion PUBLIC STATIC METHODS
