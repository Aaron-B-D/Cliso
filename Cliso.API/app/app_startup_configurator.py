from fastapi import FastAPI;
from fastapi.middleware.cors import CORSMiddleware;

from app.adapters.inbound.rest import ExceptionHandlers;
from app.application.exceptions import (
	ApplicationParameterNotFoundError,
	AuthInvalidCredentialsError,
	AuthSessionNotValidError,
	AuthTooManyAttemptsError,
	BIMModelContentNotFoundError,
	BIMModelNotFoundError,
	BIMModelValidationError,
	FileStorageError,
	PersistenceError,
	UserAlreadyExistsError,
	UserNotFoundError,
	UserPasswordValidationError,
	UserProtectedError,
	UserValidationError,
	VisualizationForbiddenError,
	VisualizationNotFoundError,
	VisualizationValidationError,
);
from app.config import StartupParametersManager;


class AppStartupConfigurator:
	"""Configuración de la aplicación web que solo se puede hacer al crearla, antes de que arranque: CORS y respuestas a los errores.

	Clase estática: no se instancia. Se usa justo después de crear la aplicación y antes de su arranque (`lifespan`),
	porque FastAPI no deja registrar middlewares ni manejadores de errores cuando ya está en marcha. No tiene relación
	con los parámetros de la aplicación editables en caliente.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def register_cors(app: FastAPI) -> None:
		"""Registra qué webs pueden llamar a la API desde el navegador (CORS).

		En modo demo se aceptan todos los orígenes. Si no, solo los de `allowed_origins`; con la lista vacía no se autoriza
		ninguno (la web servida por el mismo origen, como detrás de un proxy, no lo necesita). Hay que hacerlo antes de que
		la aplicación arranque, por eso se leen aquí los parámetros de arranque y no en el `lifespan`.

		Se permiten las credenciales: sin ellas, el navegador no envía ni guarda la cookie de la sesión en las llamadas
		de otro origen. Con `*`, Starlette responde con el origen concreto de quien llama, que es lo que el navegador exige.

		Args:
			app: Aplicación FastAPI en la que se registra.
		"""
		startup = StartupParametersManager.load();
		origins = ["*"] if startup.is_demo else startup.allowed_origins;
		app.add_middleware(
			CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
		);

	@staticmethod
	def register_exception_handlers(app: FastAPI) -> None:
		"""Registra qué respuesta HTTP da la API a cada excepción que se escapa de un endpoint.

		Los handlers se agrupan en bloques por código de respuesta. Si una excepción no está registrada, la recoge el
		handler de `Exception` (500 genérico, con el motivo en el log). Una excepción registrada también cubre a sus subclases.

		Args:
			app: Aplicación FastAPI en la que se registran.
		"""
		# 404: no existe lo que se ha pedido.
		app.add_exception_handler(ApplicationParameterNotFoundError, ExceptionHandlers.not_found);
		app.add_exception_handler(BIMModelContentNotFoundError, ExceptionHandlers.not_found);
		app.add_exception_handler(BIMModelNotFoundError, ExceptionHandlers.not_found);
		app.add_exception_handler(UserNotFoundError, ExceptionHandlers.not_found);
		app.add_exception_handler(VisualizationNotFoundError, ExceptionHandlers.not_found);

		# 400: los datos recibidos no son válidos.
		app.add_exception_handler(BIMModelValidationError, ExceptionHandlers.bad_request);
		app.add_exception_handler(UserValidationError, ExceptionHandlers.bad_request);
		app.add_exception_handler(UserPasswordValidationError, ExceptionHandlers.password_requirements);
		app.add_exception_handler(VisualizationValidationError, ExceptionHandlers.bad_request);

		# 401: no hay una sesión válida o las credenciales no son correctas.
		app.add_exception_handler(AuthInvalidCredentialsError, ExceptionHandlers.unauthorized);
		app.add_exception_handler(AuthSessionNotValidError, ExceptionHandlers.unauthorized);

		# 403: la operación no está permitida sobre lo indicado.
		app.add_exception_handler(UserProtectedError, ExceptionHandlers.forbidden);
		app.add_exception_handler(VisualizationForbiddenError, ExceptionHandlers.forbidden);

		# 409: choca con algo que ya existe.
		app.add_exception_handler(UserAlreadyExistsError, ExceptionHandlers.conflict);

		# 429: demasiados intentos seguidos.
		app.add_exception_handler(AuthTooManyAttemptsError, ExceptionHandlers.too_many_requests);

		# 500: falla el almacenamiento (se registra en el log y al cliente no se le da el detalle).
		app.add_exception_handler(FileStorageError, ExceptionHandlers.file_storage_error);
		app.add_exception_handler(PersistenceError, ExceptionHandlers.persistence_error);

		# 500: cualquier otra excepción no prevista (se registra en el log y al cliente no se le da el detalle).
		app.add_exception_handler(Exception, ExceptionHandlers.unexpected_error);

	# endregion PUBLIC STATIC METHODS
