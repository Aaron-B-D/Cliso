import sqlite3;
from pathlib import Path;
from typing import ClassVar;

from app.adapters.outbound.persistence import DatabaseAlreadyExistsError, DatabaseNotFoundError, DatabaseOperationError;
from app.adapters.outbound.persistence.database_adapter_base import DatabaseAdapterBase;
from app.utils import FileUtils;


class SQLiteAdapter(DatabaseAdapterBase):
	"""Base de datos SQLite local, para trabajar sin instalar ningún servidor.

	La base de datos es un único fichero: existir es que el fichero exista.
	"""

	# region PRIVATE CONSTANTS

	_SCHEMA_PATH: ClassVar[Path] = Path(__file__).parent / "sqlite_schema.sql";
	"""Fichero SQL con las tablas de la base de datos (SQLite)."""

	_BASIC_DATA_PATH: ClassVar[Path] = Path(__file__).parent / "sqlite_basic_data.sql";
	"""Fichero SQL con los datos básicos que se cargan en toda instalación, real o demo."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, database_path: Path) -> None:
		"""Crea el adaptador.

		Args:
			database_path: Fichero SQLite donde se guarda la base de datos.
		"""
		self._database_path = database_path;
		"""Fichero SQLite."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def exists(self) -> bool:
		"""Indica si el fichero SQLite existe."""
		return self._database_path.exists();

	def delete(self) -> None:
		"""Borra el fichero SQLite.

		Raises:
			DatabaseNotFoundError: Si el fichero no existe.
			DatabaseOperationError: Si no se puede borrar (por ejemplo, porque está en uso).
		"""
		if not self.exists():
			raise DatabaseNotFoundError(f"No existe la base de datos SQLite: {self._database_path}");
		try:
			FileUtils.delete(self._database_path);
		except OSError as error:
			raise DatabaseOperationError(f"No se pudo borrar {self._database_path}: {error}") from error;

	def create(self) -> None:
		"""Crea el fichero SQLite (y su carpeta, si falta) con las tablas vacías.

		Raises:
			DatabaseAlreadyExistsError: Si el fichero ya existe.
			DatabaseOperationError: Si falla la creación; en ese caso no deja el fichero a medias.
		"""
		if self.exists():
			raise DatabaseAlreadyExistsError(f"Ya existe la base de datos SQLite: {self._database_path}");

		try:
			FileUtils.create_directory(self._database_path.parent);
			connection = sqlite3.connect(self._database_path);
			try:
				connection.executescript(FileUtils.read_text(self._SCHEMA_PATH));
			finally:
				connection.close();
		except (sqlite3.Error, OSError) as error:
			FileUtils.delete(self._database_path);
			raise DatabaseOperationError(f"No se pudo crear la base de datos SQLite: {error}") from error;

	def load_basic_data(self) -> None:
		"""Carga los datos básicos (`sqlite_basic_data.sql`).

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si falla la carga. La carga es atómica: si falla, no se inserta nada.
		"""
		connection = self.connect();
		try:
			# `executescript` no abre transacción por su cuenta: la abrimos nosotros para que sea todo o nada.
			connection.executescript("BEGIN;\n" + FileUtils.read_text(self._BASIC_DATA_PATH) + "\nCOMMIT;");
		except (sqlite3.Error, OSError) as error:
			raise DatabaseOperationError(f"No se pudieron cargar los datos básicos: {error}") from error;
		finally:
			connection.close();

	def connect(self) -> sqlite3.Connection:
		"""Abre una conexión nueva al fichero SQLite.

		Las filas se pueden leer por nombre de columna y las claves foráneas están activadas.

		Returns:
			La conexión abierta. Quien la pide es responsable de cerrarla.

		Raises:
			DatabaseNotFoundError: Si el fichero no existe (SQLite lo crearía vacío en silencio).
			DatabaseOperationError: Si no se puede abrir.
		"""
		if not self.exists():
			raise DatabaseNotFoundError(f"No existe la base de datos SQLite: {self._database_path}");
		try:
			connection = sqlite3.connect(self._database_path);
			connection.row_factory = sqlite3.Row;
			connection.execute("PRAGMA foreign_keys = ON");
		except sqlite3.Error as error:
			raise DatabaseOperationError(f"No se pudo abrir la base de datos SQLite: {error}") from error;
		return connection;

	# endregion PUBLIC METHODS
