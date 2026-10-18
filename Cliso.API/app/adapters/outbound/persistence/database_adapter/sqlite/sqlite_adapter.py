import json;
import sqlite3;
from pathlib import Path;
from typing import Any, ClassVar;

from app.adapters.outbound.persistence import DatabaseAlreadyExistsError, DatabaseNotFoundError, DatabaseOperationError;
from app.adapters.outbound.persistence.database_adapter.database_adapter_base import DatabaseAdapterBase;


class SQLiteAdapter(DatabaseAdapterBase):
	"""Base de datos SQLite local, para trabajar sin instalar ningún servidor.

	La base de datos es un único fichero: existir es que el fichero exista.
	"""

	# region PRIVATE CONSTANTS

	_SCHEMA_PATH: ClassVar[Path] = Path(__file__).parent / "sqlite_schema.sql";
	"""Fichero SQL con las tablas de la base de datos (SQLite)."""

	_BASIC_DATA_PATH: ClassVar[Path] = Path(__file__).parent / "sqlite_basic_data.sql";
	"""Fichero SQL con los datos básicos que se cargan en una instalación real."""

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
			self._database_path.unlink();
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
			self._database_path.parent.mkdir(parents=True, exist_ok=True);
			connection = sqlite3.connect(self._database_path);
			try:
				connection.executescript(self._SCHEMA_PATH.read_text(encoding="utf-8"));
			finally:
				connection.close();
		except (sqlite3.Error, OSError) as error:
			self._database_path.unlink(missing_ok=True);
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
			connection.executescript("BEGIN;\n" + self._BASIC_DATA_PATH.read_text(encoding="utf-8") + "\nCOMMIT;");
		except (sqlite3.Error, OSError) as error:
			raise DatabaseOperationError(f"No se pudieron cargar los datos básicos: {error}") from error;
		finally:
			connection.close();

	def load_demo_data(self, data_path: Path) -> None:
		"""Carga en la base de datos todos los usuarios, modelos y visualizaciones del JSON demo.

		Args:
			data_path: JSON con los usuarios, modelos y visualizaciones demo.

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si el JSON no se puede leer o los datos no se pueden insertar.
				La carga es atómica: si falla, no se inserta nada.
		"""
		connection = self.connect();
		try:
			with data_path.open(encoding="utf-8") as file:
				# Cargamos el JSON completo, aunque solo nos interesen las claves "users", "models" y "visualizations".
				raw: dict[str, Any] = json.load(file);

			self._insert_users(connection, raw.get("users", []));
			self._insert_models(connection, raw.get("models", []));
			# Los usuarios y modelos deben existir antes de las visualizaciones que los referencian.
			self._insert_visualizations(connection, raw.get("visualizations", []));
			connection.commit();
		except (sqlite3.Error, OSError, ValueError, KeyError) as error:
			connection.rollback();
			raise DatabaseOperationError(f"No se pudieron cargar los datos demo: {error!r}") from error;
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

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _insert_users(connection: sqlite3.Connection, items: list[dict[str, Any]]) -> None:
		"""Inserta los usuarios demo en la tabla `user`.

		Args:
			connection: Conexión abierta, en cuya transacción se inserta (no confirma los cambios).
			items: Usuarios, como lista de objetos del JSON.

		Raises:
			KeyError: Si a algún usuario le falta un campo.
			sqlite3.Error: Si falla la inserción.
		"""
		for item in items:
			connection.execute(
				"INSERT INTO user (id, nick, name, surname, password, active, creation_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
				(item["id"], item["nick"], item["name"], item["surname"], item["password"], item["active"], item["creation_date"]),
			);

	@staticmethod
	def _insert_models(connection: sqlite3.Connection, items: list[dict[str, Any]]) -> None:
		"""Inserta los modelos BIM demo en la tabla `bim_model`.

		Args:
			connection: Conexión abierta, en cuya transacción se inserta (no confirma los cambios).
			items: Modelos, como lista de objetos del JSON.

		Raises:
			KeyError: Si a algún modelo le falta un campo.
			sqlite3.Error: Si falla la inserción.
		"""
		for item in items:
			connection.execute(
				"INSERT INTO bim_model (id, name, description, file_name, active, creation_date) VALUES (?, ?, ?, ?, ?, ?)",
				(item["id"], item["name"], item["description"], item["file_name"], item["active"], item["creation_date"]),
			);

	@staticmethod
	def _insert_visualizations(connection: sqlite3.Connection, items: list[dict[str, Any]]) -> None:
		"""Inserta las visualizaciones demo en la tabla `visualization`.

		Args:
			connection: Conexión abierta, en cuya transacción se inserta (no confirma los cambios).
			items: Visualizaciones, como lista de objetos del JSON.

		Raises:
			KeyError: Si a alguna visualización le falta un campo.
			sqlite3.Error: Si falla la inserción.
		"""
		for item in items:
			connection.execute(
				"INSERT INTO visualization (id, owner_id, model_id, name, description, observations, is_public, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				(item["id"], item["owner_id"], item["model_id"], item["name"], item["description"], item["observations"], item["is_public"], item["active"]),
			);

	# endregion PRIVATE STATIC METHODS
