from abc import abstractmethod;

from app.adapters.outbound.persistence import DatabaseConnectionProviderBase;


class DatabaseAdapterBase(DatabaseConnectionProviderBase):
	"""Contrato de los adaptadores de base de datos: el ciclo de vida de la base de datos, además de entregar conexiones.

	Cada operación hace una sola cosa y lanza una excepción propia si no puede hacerla, en lugar de continuar a medias.
	Quien arranca la API decide en qué orden llamarlas.
	"""

	# region PUBLIC METHODS

	@abstractmethod
	def exists(self) -> bool:
		"""Indica si la base de datos existe.

		Raises:
			DatabaseOperationError: Si no se puede consultar al motor.
		"""

	@abstractmethod
	def delete(self) -> None:
		"""Borra la base de datos con todo su contenido.

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si el motor no permite borrarla.
		"""

	@abstractmethod
	def create(self) -> None:
		"""Crea la base de datos vacía, con sus tablas.

		Raises:
			DatabaseAlreadyExistsError: Si la base de datos ya existe.
			DatabaseOperationError: Si el motor no permite crearla.
		"""

	@abstractmethod
	def load_basic_data(self) -> None:
		"""Carga los datos básicos que necesita toda instalación, real o demo, en una base de datos ya creada.

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si falla la carga. La carga es atómica: si falla, no se inserta nada.
		"""

	# endregion PUBLIC METHODS
