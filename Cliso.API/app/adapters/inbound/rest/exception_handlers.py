from fastapi import Request;
from fastapi.responses import JSONResponse;

from app.logger import Logger;


class ExceptionHandlers:
	"""Traduce a respuestas HTTP las excepciones que se escapan de los endpoints.

	Clase estática: no se instancia. Cada método es el handler de un tipo de excepción; quien monta la aplicación los
	registra con `app.add_exception_handler`.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	async def not_found(request: Request, error: Exception) -> JSONResponse:
		"""Responde 404 cuando no existe lo que se ha pedido.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de «no encontrado».

		Returns:
			Respuesta 404 con el motivo.
		"""
		return JSONResponse(status_code=404, content={"detail": str(error)});

	@staticmethod
	async def persistence_error(request: Request, error: Exception) -> JSONResponse:
		"""Responde 500 cuando falla el acceso al almacenamiento, y deja el motivo en el log.

		Al cliente no se le da el detalle del fallo.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de almacenamiento.

		Returns:
			Respuesta 500 genérica.
		"""
		Logger.error(f"Error de persistencia en {request.method} {request.url.path}.", error);
		return JSONResponse(status_code=500, content={"detail": "Error al acceder al almacenamiento"});

	@staticmethod
	async def unexpected_error(request: Request, error: Exception) -> JSONResponse:
		"""Responde 500 ante cualquier excepción no prevista, y deja el motivo en el log.

		Al cliente no se le da el detalle del fallo.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción no prevista.

		Returns:
			Respuesta 500 genérica.
		"""
		Logger.error(f"Error no previsto en {request.method} {request.url.path}.", error);
		return JSONResponse(status_code=500, content={"detail": "Error interno del servidor"});

	# endregion PUBLIC STATIC METHODS
