from collections.abc import AsyncGenerator;
from contextlib import asynccontextmanager;

from fastapi import FastAPI;

from app.adapters.inbound.rest import (
	ApplicationParameterRouter,
	AuthRouter,
	BIMModelRouter,
	UserRouter,
	VisualizationRouter,
);
from app.adapters.outbound.persistence import (
	DatabaseAdapterBase,
	DatabaseError,
	MySQLAdapter,
	MySQLApplicationParameterRepository,
	MySQLBIMModelRepository,
	MySQLUserRepository,
	MySQLVisualizationRepository,
	SQLiteAdapter,
	SQLiteApplicationParameterRepository,
	SQLiteBIMModelRepository,
	SQLiteUserRepository,
	SQLiteVisualizationRepository,
);
from app.adapters.outbound.storage import LocalBIMModelFileStorage;
from app.app_startup_configurator import AppStartupConfigurator;
from app.application.exceptions import ApplicationParameterError, PersistenceError;
from app.application.ports.outbound import (
	ApplicationParameterRepositoryBase,
	BIMModelRepositoryBase,
	UserRepositoryBase,
	VisualizationRepositoryBase,
);
from app.application.use_cases import (
	ApplicationParameterService,
	AuthService,
	BIMModelService,
	UserService,
	VisualizationService,
);
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
	- Base de datos: la real, o la demo (`is_demo` True, de nombre `cliso-demo`) con cualquier proveedor.
	- Si la base de datos no existe, el `DatabaseInitializer` la crea con sus tablas y los datos básicos y, en modo demo,
	  los datos de demostración. En modo real, si ya existe no se toca. En modo demo se borra y se rehace en cada
	  arranque, para que empiece siempre limpia.
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
	visualization_repository: VisualizationRepositoryBase;
	try:
		if startup.database_provider == DatabaseProvider.MYSQL:
			database = MySQLAdapter(
				startup.mysql_host, startup.mysql_port, startup.mysql_user, startup.mysql_password, startup.database_name
			);
			application_parameter_repository = MySQLApplicationParameterRepository(database);
			bim_model_repository = MySQLBIMModelRepository(database);
			user_repository = MySQLUserRepository(database);
			visualization_repository = MySQLVisualizationRepository(database);
		else:
			database = SQLiteAdapter(startup.database_file);
			application_parameter_repository = SQLiteApplicationParameterRepository(database);
			bim_model_repository = SQLiteBIMModelRepository(database);
			user_repository = SQLiteUserRepository(database);
			visualization_repository = SQLiteVisualizationRepository(database);

		DatabaseInitializer(
			database,
			application_parameter_repository,
			bim_model_repository,
			user_repository,
			visualization_repository,
			startup.is_demo,
		).initialize();

		application_parameter_service = ApplicationParameterService(application_parameter_repository);
		language = application_parameter_service.get_parameter(ApplicationParameterType.LANGUAGE).value;
		bim_models_directory = PathUtils.resolve(
			application_parameter_service.get_parameter(ApplicationParameterType.BIM_MODELS_DIRECTORY).value
		);
		session_timeout_text = application_parameter_service.get_parameter(
			ApplicationParameterType.SESSION_TIMEOUT_MILLISECONDS
		).value;
		try:
			session_timeout_milliseconds = int(session_timeout_text);
		except ValueError as error:
			raise ApplicationParameterError(
				f"El parámetro {ApplicationParameterType.SESSION_TIMEOUT_MILLISECONDS} no es un número entero: '{session_timeout_text}'"
			) from error;
		if session_timeout_milliseconds <= 0:
			raise ApplicationParameterError(
				f"El parámetro {ApplicationParameterType.SESSION_TIMEOUT_MILLISECONDS} debe ser mayor que cero: '{session_timeout_text}'"
			);
	except (DatabaseError, ApplicationParameterError, PersistenceError) as error:
		Logger.error("Arranque fallido: no se pudo preparar la base de datos ni leer sus parámetros.", error);
		Logger.close();
		raise;

	auth_service = AuthService(user_repository, session_timeout_milliseconds);
	app.include_router(AuthRouter.create(auth_service, startup.session_cookie_same_site));
	app.include_router(ApplicationParameterRouter.create(application_parameter_service, auth_service));
	app.include_router(
		BIMModelRouter.create(
			BIMModelService(bim_model_repository, LocalBIMModelFileStorage(bim_models_directory)), auth_service
		)
	);
	app.include_router(UserRouter.create(UserService(user_repository, auth_service), auth_service));
	app.include_router(
		VisualizationRouter.create(VisualizationService(visualization_repository, bim_model_repository), auth_service)
	);
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
