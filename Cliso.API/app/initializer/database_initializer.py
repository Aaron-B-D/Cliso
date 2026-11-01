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
from app.domain.models import ApplicationParameterType, BIMModel, User, UserRole;
from app.initializer.demo_data import DemoData;
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
			try:
				self._database.load_basic_data();
				admin = self._load_default_users();
				if self._is_demo:
					self._load_demo_data(admin);
			except DatabaseError:
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
		Las visualizaciones demo son del administrador y se hacen sobre el primer modelo.

		Args:
			admin: Administrador ya guardado, propietario de las visualizaciones demo.

		Raises:
			DatabaseOperationError: Si algún dato no se puede guardar o algún fichero no se puede copiar.
		"""
		try:
			for user in DemoData.get_users():
				self._user_repository.add(user);

			bim_models_directory = PathUtils.resolve(
				self._application_parameter_repository.get_by_type(ApplicationParameterType.BIM_MODELS_DIRECTORY).value
			);
			file_storage = LocalBIMModelFileStorage(bim_models_directory);
			saved_models: list[BIMModel] = [];
			for model in DemoData.get_bim_models():
				saved_models.append(self._bim_model_repository.add(model));
				file_storage.import_file(model.stored_file_name, DemoData.get_bim_model_file_path(model));

			first_model_id = saved_models[0].id;
			if admin.id is None or first_model_id is None:
				raise DatabaseOperationError("El administrador o el primer modelo demo no tienen identificador");
			for visualization in DemoData.get_visualizations(admin.id, first_model_id):
				self._visualization_repository.add(visualization);
		except (ApplicationParameterError, FileStorageError, PersistenceError, UserError) as error:
			raise DatabaseOperationError(f"No se pudieron cargar los datos demo: {error}") from error;

	# endregion PRIVATE METHODS
