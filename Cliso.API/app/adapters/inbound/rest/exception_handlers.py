from fastapi import Request;
from fastapi.responses import JSONResponse;

from app.application.exceptions import UserPasswordValidationError;
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
	async def bad_request(request: Request, error: Exception) -> JSONResponse:
		"""Responde 400 cuando los datos recibidos no son válidos.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de «datos no válidos».

		Returns:
			Respuesta 400 con el motivo.
		"""
		return JSONResponse(status_code=400, content={"detail": str(error)});

	@staticmethod
	async def password_requirements(request: Request, error: Exception) -> JSONResponse:
		"""Responde 400 cuando una contraseña no cumple los requisitos mínimos, con los códigos de los que falla.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de contraseña no válida.

		Returns:
			Respuesta 400 con el motivo y, en `requirements`, los códigos de los requisitos incumplidos.
		"""
		requirements: list[str] = [];
		if isinstance(error, UserPasswordValidationError):
			for requirement in error.requirements:
				requirements.append(requirement.value);
		else:
			# Este handler solo se registra para UserPasswordValidationError: no hay códigos que añadir.
			pass;
		return JSONResponse(status_code=400, content={"detail": str(error), "requirements": requirements});

	@staticmethod
	async def unauthorized(request: Request, error: Exception) -> JSONResponse:
		"""Responde 401 cuando no hay una sesión válida o las credenciales no son correctas.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de «no autenticado».

		Returns:
			Respuesta 401 con el motivo.
		"""
		return JSONResponse(status_code=401, content={"detail": str(error)});

	@staticmethod
	async def forbidden(request: Request, error: Exception) -> JSONResponse:
		"""Responde 403 cuando la operación pedida no está permitida sobre lo indicado.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de «operación no permitida».

		Returns:
			Respuesta 403 con el motivo.
		"""
		return JSONResponse(status_code=403, content={"detail": str(error)});

	@staticmethod
	async def conflict(request: Request, error: Exception) -> JSONResponse:
		"""Responde 409 cuando lo que se quiere crear o cambiar choca con algo que ya existe.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de «ya existe».

		Returns:
			Respuesta 409 con el motivo.
		"""
		return JSONResponse(status_code=409, content={"detail": str(error)});

	@staticmethod
	async def too_many_requests(request: Request, error: Exception) -> JSONResponse:
		"""Responde 429 cuando se han hecho demasiados intentos y el acceso queda bloqueado un tiempo.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de «demasiados intentos».

		Returns:
			Respuesta 429 con el motivo.
		"""
		return JSONResponse(status_code=429, content={"detail": str(error)});

	@staticmethod
	async def file_storage_error(request: Request, error: Exception) -> JSONResponse:
		"""Responde 500 cuando falla el acceso al almacenamiento de ficheros, y deja el motivo en el log.

		Al cliente no se le da el detalle del fallo.

		Args:
			request: Petición que provocó la excepción.
			error: Excepción de almacenamiento de ficheros.

		Returns:
			Respuesta 500 genérica.
		"""
		Logger.error(f"Error de almacenamiento de ficheros en {request.method} {request.url.path}.", error);
		return JSONResponse(status_code=500, content={"detail": "Error al acceder al almacenamiento de ficheros"});

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
