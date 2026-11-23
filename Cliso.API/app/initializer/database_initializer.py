from typing import ClassVar;

from app.adapters.outbound.persistence import DatabaseAdapterBase, DatabaseError, DatabaseOperationError;
from app.adapters.outbound.storage import LocalBIMModelFileStorage;
from app.application.exceptions import ApplicationParameterError, FileStorageError, PersistenceError, UserError;
from app.application.ports.outbound import (
	ApplicationParameterRepositoryBase,
	BIMModelRepositoryBase,
	UserRepositoryBase,
	VisualizationRepositoryBase,
);
from app.application.use_cases import UserService;
from app.domain.models import ApplicationParameterType, User, UserRole;
from app.initializer.demo_data import DemoData;
from app.initializer.demo_visualization_data import DemoVisualizationData;
from app.logger import Logger;
from app.utils import PasswordUtils, PathUtils;


class DatabaseInitializer:
	"""Prepara la base de datos al arrancar: si no existe, la crea con sus tablas y sus datos.

	En modo real, una base de datos que ya existe no se toca nunca. En modo demo se rehace en cada arranque: si existe,
	se borra y se crea de nuevo, para que cada vez empiece limpia, con sus valores por defecto. Una base de datos que se
	acaba de crear lleva siempre los datos básicos (entre ellos, los parámetros de la aplicación y el usuario
	administrador) y, en modo demo, además los datos de demostración, que se guardan con los repositorios de la
	aplicación (los ficheros IFC de los modelos, en la carpeta de modelos de los parámetros de la aplicación).
	"""

	# region PRIVATE CONSTANTS

	_ADMIN_PASSWORD: ClassVar[str] = "admin";
	"""Contraseña inicial del administrador. No pasa por las reglas de contraseña: es la de partida y conviene cambiarla."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(
		self,
		database: DatabaseAdapterBase,
		application_parameter_repository: ApplicationParameterRepositoryBase,
		bim_model_repository: BIMModelRepositoryBase,
		user_repository: UserRepositoryBase,
		visualization_repository: VisualizationRepositoryBase,
		is_demo: bool,
	) -> None:
		"""Crea el inicializador.

		Args:
			database: Adaptador de la base de datos que se prepara.
			application_parameter_repository: Repositorio del que se lee la carpeta de los ficheros de los modelos BIM demo.
			bim_model_repository: Repositorio con el que se guardan los modelos BIM demo.
			user_repository: Repositorio con el que se guardan el administrador y los usuarios demo.
			visualization_repository: Repositorio con el que se guardan las visualizaciones demo.
			is_demo: Si es True, tras los datos básicos se cargan los datos de demostración.
		"""
		self._database = database;
		"""Adaptador de la base de datos que se prepara."""

		self._application_parameter_repository = application_parameter_repository;
		"""Repositorio del que se lee la carpeta de los ficheros de los modelos BIM demo."""

		self._bim_model_repository = bim_model_repository;
		"""Repositorio con el que se guardan los modelos BIM demo."""

		self._user_repository = user_repository;
		"""Repositorio con el que se guardan el administrador y los usuarios demo."""

		self._visualization_repository = visualization_repository;
		"""Repositorio con el que se guardan las visualizaciones demo."""

		self._is_demo = is_demo;
		"""Si es True, tras los datos básicos se cargan los datos de demostración."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def initialize(self) -> None:
		"""Deja la base de datos lista para usar.

		En modo demo, si ya existe, la borra para rehacerla de cero. En modo real, si ya existe, no hace nada. Si no
		existe, la crea, carga los datos básicos y, en modo demo, los datos de demostración. Si algo falla después de
		crearla, la borra, para no dejar una base de datos a medias que el siguiente arranque daría por buena.

		Raises:
			DatabaseError: Si no se puede borrar o crear la base de datos, o cargar sus datos.
		"""
		if self._is_demo and self._database.exists():
			self._database.delete();
			Logger.info("Base de datos demo anterior borrada: se rehace de cero.");
		else:
			# En modo real una base de datos que existe no se toca; si no existe, no hay nada que borrar.
			pass;

		if self._database.exists():
			Logger.info("La base de datos ya existe: se usa tal cual.");
		else:
			self._database.create();
			Logger.debug("Base de datos creada con sus tablas.");
			try:
				self._database.load_basic_data();
				Logger.debug("Datos básicos (parámetros de la aplicación) cargados.");
				admin = self._load_default_users();
				Logger.debug(f"Usuario administrador '{admin.nick}' creado.");
				if self._is_demo:
					self._load_demo_data(admin);
			except DatabaseError:
				# El error, con su traza, lo registra quien recoge la excepción; aquí solo se anota que se deshace la creación.
				Logger.warning("Fallo al cargar los datos de la base de datos nueva: se borra para no dejarla a medias.");
				self._database.delete();
				raise;
			Logger.info(f"Base de datos creada con datos básicos{' y datos demo' if self._is_demo else ''}.");

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _load_default_users(self) -> User:
		"""Guarda con el repositorio el usuario administrador, que lleva toda base de datos nueva.

		Returns:
			El administrador guardado, con su `id`.

		Raises:
			DatabaseOperationError: Si el administrador no se puede guardar.
		"""
		try:
			return self._user_repository.add(
				User(
					nick=UserService.PROTECTED_NICK,
					name="Administrador",
					surname="Cliso",
					password=PasswordUtils.hash(self._ADMIN_PASSWORD),
					role=UserRole.ADMIN,
				)
			);
		except (PersistenceError, UserError) as error:
			raise DatabaseOperationError(f"No se pudo crear el usuario administrador: {error}") from error;

	def _load_demo_data(self, admin: User) -> None:
		"""Guarda los datos de demostración con los repositorios y copia los ficheros IFC de los modelos a su carpeta.

		La carpeta de los ficheros es la de los parámetros de la aplicación, que ya están cargados con los datos básicos.
		Las visualizaciones demo son del administrador y de los dos operadores, repartidas entre todos los modelos.

		Args:
			admin: Administrador ya guardado, propietario de las visualizaciones demo.

		Raises:
			DatabaseOperationError: Si algún dato no se puede guardar o algún fichero no se puede copiar.
		"""
		try:
			# Los identificadores de los usuarios y de los modelos, para que las visualizaciones demo los usen
			user_ids: dict[str, int] = {};
			if admin.id is None:
				raise DatabaseOperationError("El administrador no tiene identificador");
			user_ids[admin.nick] = admin.id;
			demo_users = DemoData.get_users();
			for user in demo_users:
				saved_user = self._user_repository.add(user);
				if saved_user.id is None:
					raise DatabaseOperationError(f"El usuario demo '{saved_user.nick}' no tiene identificador");
				user_ids[saved_user.nick] = saved_user.id;
			Logger.debug(f"Usuarios demo cargados: {len(demo_users)}.");

			bim_models_directory = PathUtils.resolve(
				self._application_parameter_repository.get_by_type(ApplicationParameterType.BIM_MODELS_DIRECTORY).value
			);
			file_storage = LocalBIMModelFileStorage(bim_models_directory);
			model_ids: dict[str, int] = {};
			for model in DemoData.get_bim_models():
				saved_model = self._bim_model_repository.add(model);
				if saved_model.id is None:
					raise DatabaseOperationError(f"El modelo demo '{saved_model.name}' no tiene identificador");
				model_ids[saved_model.file_name] = saved_model.id;
				file_storage.import_file(model.stored_file_name, DemoData.get_bim_model_file_path(model));
			Logger.debug(f"Modelos BIM demo cargados, con sus ficheros: {len(model_ids)}.");

			demo_visualizations = DemoVisualizationData.get_visualizations(user_ids, model_ids);
			for visualization in demo_visualizations:
				self._visualization_repository.add(visualization);
			Logger.debug(f"Visualizaciones demo cargadas: {len(demo_visualizations)}.");
		except (ApplicationParameterError, FileStorageError, PersistenceError, UserError) as error:
			raise DatabaseOperationError(f"No se pudieron cargar los datos demo: {error}") from error;

	# endregion PRIVATE METHODS
