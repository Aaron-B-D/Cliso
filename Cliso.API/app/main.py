from collections.abc import AsyncGenerator;
from contextlib import asynccontextmanager;

from fastapi import FastAPI;

from app.adapters.inbound.rest import ApplicationParameterRouter, BIMModelRouter, UserRouter;
from app.adapters.outbound.persistence import (
	DatabaseAdapterBase,
	DatabaseError,
	MySQLAdapter,
	MySQLApplicationParameterRepository,
	MySQLBIMModelRepository,
	MySQLUserRepository,
	SQLiteAdapter,
	SQLiteApplicationParameterRepository,
	SQLiteBIMModelRepository,
	SQLiteUserRepository,
);
from app.adapters.outbound.storage import LocalBIMModelFileStorage;
from app.app_startup_configurator import AppStartupConfigurator;
from app.application.exceptions import ApplicationParameterError, PersistenceError;
from app.application.ports.outbound import ApplicationParameterRepositoryBase, BIMModelRepositoryBase, UserRepositoryBase;
from app.application.use_cases import ApplicationParameterService, BIMModelService, UserService;
from app.config import DatabaseProvider, StartupParametersManager;
from app.domain.models import ApplicationParameterType;
from app.initializer import DatabaseInitializer;
from app.logger import Logger;
from app.utils import PathUtils;


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
	"""Arranque de la API (raíz de composición): elige los adaptadores según la configuración y prepara la base de datos.

	- Parámetros de arranque (`StartupParameters`, del fichero de configuración): solo lo imprescindible para arrancar.
	  Proveedor (`database_provider`): SQLite (por defecto, un fichero local) o MySQL (en un servidor).
	- Base de datos: la real, o la demo (`is_demo` True, de nombre `cliso-demo_<fecha>`) con cualquier proveedor.
	- Si la base de datos no existe, el `DatabaseInitializer` la crea con sus tablas y los datos básicos y, en modo demo,
	  los datos de demostración. Si ya existe no se toca: el arranque nunca borra una base de datos que ya existía.
	- El resto de parámetros (idioma, carpeta de los ficheros de modelos...) se leen de la tabla de parámetros de la
	  aplicación una vez preparada la base de datos.

	Cualquier fallo al preparar la base de datos o al leer sus parámetros se registra en el log y detiene el arranque.
	Escribe en el log el arranque correcto y, al final del yield, el cierre de la aplicación.
	Crea los servicios y se los entrega a cada router, que solo recibe el que necesita; los routers se incluyen en la
	aplicación aquí porque dependen de que la base de datos ya esté preparada.

	Args:
		app: Aplicación FastAPI que arranca.

	Raises:
		DatabaseError: Si no se puede preparar la base de datos.
		ApplicationParameterError: Si falta algún parámetro de la aplicación.
		PersistenceError: Si no se pueden leer los parámetros de la aplicación.
	"""
	startup = StartupParametersManager.load();
	Logger.setup(startup.log_file);

	database: DatabaseAdapterBase;
	application_parameter_repository: ApplicationParameterRepositoryBase;
	bim_model_repository: BIMModelRepositoryBase;
	user_repository: UserRepositoryBase;
	try:
		if startup.database_provider == DatabaseProvider.MYSQL:
			database = MySQLAdapter(
				startup.mysql_host, startup.mysql_port, startup.mysql_user, startup.mysql_password, startup.database_name
			);
			application_parameter_repository = MySQLApplicationParameterRepository(database);
			bim_model_repository = MySQLBIMModelRepository(database);
			user_repository = MySQLUserRepository(database);
		else:
			database = SQLiteAdapter(startup.database_file);
			application_parameter_repository = SQLiteApplicationParameterRepository(database);
			bim_model_repository = SQLiteBIMModelRepository(database);
			user_repository = SQLiteUserRepository(database);

		DatabaseInitializer(
			database, application_parameter_repository, bim_model_repository, user_repository, startup.is_demo
		).initialize();

		application_parameter_service = ApplicationParameterService(application_parameter_repository);
		language = application_parameter_service.get_parameter(ApplicationParameterType.LANGUAGE).value;
		bim_models_directory = PathUtils.resolve(
			application_parameter_service.get_parameter(ApplicationParameterType.BIM_MODELS_DIRECTORY).value
		);
	except (DatabaseError, ApplicationParameterError, PersistenceError) as error:
		Logger.error("Arranque fallido: no se pudo preparar la base de datos ni leer sus parámetros.", error);
		Logger.close();
		raise;

	app.include_router(ApplicationParameterRouter.create(application_parameter_service));
	app.include_router(BIMModelRouter.create(BIMModelService(bim_model_repository, LocalBIMModelFileStorage(bim_models_directory))));
	app.include_router(UserRouter.create(UserService(user_repository)));
	Logger.info(
		f"Arranque correcto (proveedor {startup.database_provider}, modo {'demo' if startup.is_demo else 'real'}, "
		f"idioma {language})."
	);

	yield;

	Logger.info("Aplicación cerrada.");
	Logger.close();


app = FastAPI(
	title="Cliso.RestAPI",
	description="La API de la aplicación Cliso",
	# Aquí se podrían añadir más metadatos (versión, contacto, licencia...), que se muestran en la documentación automática (Swagger UI, ReDoc).
	lifespan=lifespan,
);

AppStartupConfigurator.register_exception_handlers(app);
AppStartupConfigurator.register_cors(app);
