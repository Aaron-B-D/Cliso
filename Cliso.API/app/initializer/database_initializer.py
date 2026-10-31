from app.adapters.outbound.persistence import DatabaseAdapterBase, DatabaseError, DatabaseOperationError;
from app.application.exceptions import PersistenceError;
from app.application.ports.outbound import BIMModelRepositoryBase;
from app.initializer.demo_data import DemoData;
from app.logger import Logger;


class DatabaseInitializer:
	"""Prepara la base de datos al arrancar: si no existe, la crea con sus tablas y sus datos.

	Una base de datos que ya existe no se toca nunca. Una que se acaba de crear lleva siempre los datos básicos (entre
	ellos, los parámetros de la aplicación) y, en modo demo, además los datos de demostración, que se guardan con los
	repositorios de la aplicación.
	"""

	# region CONSTRUCTOR

	def __init__(
		self, database: DatabaseAdapterBase, bim_model_repository: BIMModelRepositoryBase, is_demo: bool
	) -> None:
		"""Crea el inicializador.

		Args:
			database: Adaptador de la base de datos que se prepara.
			bim_model_repository: Repositorio con el que se guardan los modelos BIM demo.
			is_demo: Si es True, tras los datos básicos se cargan los datos de demostración.
		"""
		self._database = database;
		"""Adaptador de la base de datos que se prepara."""

		self._bim_model_repository = bim_model_repository;
		"""Repositorio con el que se guardan los modelos BIM demo."""

		self._is_demo = is_demo;
		"""Si es True, tras los datos básicos se cargan los datos de demostración."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def initialize(self) -> None:
		"""Deja la base de datos lista para usar.

		Si la base de datos ya existe, no hace nada. Si no, la crea, carga los datos básicos y, en modo demo, los datos
		de demostración. Si algo falla después de crearla, la borra, para no dejar una base de datos a medias que el
		siguiente arranque daría por buena.

		Raises:
			DatabaseError: Si no se puede crear la base de datos o cargar sus datos.
		"""
		if self._database.exists():
			Logger.info("La base de datos ya existe: se usa tal cual.");
		else:
			self._database.create();
			try:
				self._database.load_basic_data();
				if self._is_demo:
					self._load_demo_data();
			except DatabaseError:
				self._database.delete();
				raise;
			Logger.info(f"Base de datos creada con datos básicos{' y datos demo' if self._is_demo else ''}.");

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _load_demo_data(self) -> None:
		"""Guarda los datos de demostración con los repositorios.

		Raises:
			DatabaseOperationError: Si algún dato no se puede guardar.
		"""
		try:
			for model in DemoData.get_bim_models():
				self._bim_model_repository.add(model);
		except PersistenceError as error:
			raise DatabaseOperationError(f"No se pudieron cargar los datos demo: {error}") from error;

	# endregion PRIVATE METHODS
