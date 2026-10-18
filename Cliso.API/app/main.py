from collections.abc import AsyncGenerator;
from contextlib import asynccontextmanager;

from fastapi import FastAPI;

from app.adapters.inbound.rest import ExceptionHandlers, SystemRouter, UserRouter;
from app.adapters.outbound.persistence import (
	DatabaseAdapterBase,
	DatabaseError,
	MySQLAdapter,
	MySQLUserRepository,
	SQLiteAdapter,
	SQLiteUserRepository,
);
from app.application.exceptions import PersistenceError, SettingNotFoundError, UserNotFoundError;
from app.application.ports.outbound import UserRepositoryBase;
from app.application.use_cases import SettingsService, UserService;
from app.config import DatabaseProvider, SettingsManager, SettingsMapper;
from app.logger import Logger;


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
	"""Arranque de la API (raíz de composición): lee los settings, elige los adaptadores y prepara la base de datos.

	- Proveedor (`database_provider`): SQLite (por defecto, un fichero local) o MySQL (en un servidor).
	- Base de datos: la real, o la demo (`is_demo` True, de nombre `cliso-demo_<fecha>`) con cualquier proveedor.
	- Si la base de datos no existe se crea y se cargan los datos iniciales: los demo en modo demo y los básicos si no.
	  Si ya existe no se toca: el arranque nunca borra una base de datos.

	Cualquier fallo de la base de datos (DatabaseError) se registra en el log y detiene el arranque.
	Escribe en el log el arranque correcto y, al final del yield, el cierre de la aplicación.
	Crea los servicios y se los entrega a cada router, que solo recibe el que necesita; los routers se incluyen en la
	aplicación aquí porque dependen de que la base de datos ya esté preparada.

	Args:
		app: Aplicación FastAPI que arranca.

	Raises:
		DatabaseError: Si no se puede preparar la base de datos.
	"""
	settings = SettingsManager.load();
	Logger.setup(settings.log_file);

	database: DatabaseAdapterBase;
	user_repository: UserRepositoryBase;
	try:
		if settings.database_provider == DatabaseProvider.MYSQL:
			database = MySQLAdapter(
				settings.mysql_host, settings.mysql_port, settings.mysql_user, settings.mysql_password, settings.database_name
			);
			user_repository = MySQLUserRepository(database);
		else:
			database = SQLiteAdapter(settings.database_file);
			user_repository = SQLiteUserRepository(database);

		if not database.exists():
			database.create();
			if settings.is_demo:
				database.load_demo_data(settings.demo_data_file);
			else:
				database.load_basic_data();
	except DatabaseError as error:
		Logger.error("Arranque fallido: no se pudo preparar la base de datos.", error);
		Logger.close();
		raise;

	app.include_router(SystemRouter.create(SettingsService(SettingsMapper.to_application_settings(settings))));
	app.include_router(UserRouter.create(UserService(user_repository)));
	Logger.info(
		f"Arranque correcto (proveedor {settings.database_provider}, modo {'demo' if settings.is_demo else 'real'}, "
		f"idioma {settings.language})."
	);

	yield;

	Logger.info("Aplicación cerrada.");
	Logger.close();


def register_exception_handlers(app: FastAPI) -> None:
	"""Registra qué respuesta HTTP da la API a cada excepción que se escapa de un endpoint.

	Los handlers se agrupan en bloques por código de respuesta. Si una excepción no está registrada, la recoge el
	handler de `Exception` (500 genérico, con el motivo en el log). Una excepción registrada también cubre a sus subclases.

	Args:
		app: Aplicación FastAPI en la que se registran.
	"""
	# 404: no existe lo que se ha pedido.
	app.add_exception_handler(SettingNotFoundError, ExceptionHandlers.not_found);
	app.add_exception_handler(UserNotFoundError, ExceptionHandlers.not_found);

	# 500: falla el almacenamiento (se registra en el log y al cliente no se le da el detalle).
	app.add_exception_handler(PersistenceError, ExceptionHandlers.persistence_error);

	# 500: cualquier otra excepción no prevista (se registra en el log y al cliente no se le da el detalle).
	app.add_exception_handler(Exception, ExceptionHandlers.unexpected_error);


app = FastAPI(
	title="Cliso.RestAPI",
	description="La API de la aplicación Cliso",
	# Aquí se podrían añadir más metadatos (versión, contacto, licencia...), que se muestran en la documentación automática (Swagger UI, ReDoc).
	lifespan=lifespan,
);

register_exception_handlers(app);