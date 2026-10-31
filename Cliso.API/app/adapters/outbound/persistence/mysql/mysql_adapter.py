from pathlib import Path;
from typing import ClassVar;

import pymysql;
import pymysql.cursors;
from pymysql.constants import CLIENT;

from app.adapters.outbound.persistence import (
	DatabaseAlreadyExistsError,
	DatabaseConnectionBase,
	DatabaseNotFoundError,
	DatabaseOperationError,
);
from app.adapters.outbound.persistence.database_adapter_base import DatabaseAdapterBase;
from app.utils import FileUtils;


class MySQLAdapter(DatabaseAdapterBase):
	"""Base de datos MySQL, en un servidor.

	Existir es que el servidor tenga una base de datos (schema) con el nombre indicado.
	"""

	# region PRIVATE CONSTANTS

	_SCHEMA_PATH: ClassVar[Path] = Path(__file__).parent / "mysql_schema.sql";
	"""Fichero SQL con las tablas de la base de datos (MySQL)."""

	_BASIC_DATA_PATH: ClassVar[Path] = Path(__file__).parent / "mysql_basic_data.sql";
	"""Fichero SQL con los datos básicos que se cargan en toda instalación, real o demo."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, host: str, port: int, user: str, password: str, database: str) -> None:
		"""Crea el adaptador con los datos de conexión (no se conecta hasta que se llama a una operación).

		Args:
			host: Servidor MySQL.
			port: Puerto del servidor.
			user: Usuario de MySQL.
			password: Contraseña del usuario.
			database: Nombre de la base de datos.
		"""
		self._host = host;
		"""Servidor MySQL."""

		self._port = port;
		"""Puerto del servidor."""

		self._user = user;
		"""Usuario de MySQL."""

		self._password = password;
		"""Contraseña del usuario."""

		self._database = database;
		"""Nombre de la base de datos."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def exists(self) -> bool:
		"""Indica si el servidor tiene una base de datos con el nombre configurado.

		Raises:
			DatabaseOperationError: Si no se puede conectar al servidor.
		"""
		connection = self._connect_server();
		try:
			cursor = connection.cursor();
			cursor.execute("SELECT 1 FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = %s", (self._database,));
			return cursor.fetchone() is not None;
		except pymysql.MySQLError as error:
			raise DatabaseOperationError(f"No se pudo consultar si existe '{self._database}': {error}") from error;
		finally:
			connection.close();

	def delete(self) -> None:
		"""Borra la base de datos con todo su contenido. Es irreversible.

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si el servidor no permite borrarla.
		"""
		if not self.exists():
			raise DatabaseNotFoundError(f"No existe la base de datos '{self._database}'");

		connection = self._connect_server();
		try:
			cursor = connection.cursor();
			cursor.execute(f"DROP DATABASE `{self._database}`");
		except pymysql.MySQLError as error:
			raise DatabaseOperationError(f"No se pudo borrar '{self._database}': {error}") from error;
		finally:
			connection.close();

	def create(self) -> None:
		"""Crea la base de datos y sus tablas, vacías.

		Raises:
			DatabaseAlreadyExistsError: Si la base de datos ya existe.
			DatabaseOperationError: Si falla la creación; en ese caso borra lo que haya creado.
		"""
		if self.exists():
			raise DatabaseAlreadyExistsError(f"Ya existe la base de datos '{self._database}'");

		server = self._connect_server();
		try:
			cursor = server.cursor();
			cursor.execute(f"CREATE DATABASE `{self._database}` CHARACTER SET utf8mb4");
			try:
				self._run_script(self.connect(), self._SCHEMA_PATH);
			except DatabaseOperationError:
				cursor.execute(f"DROP DATABASE `{self._database}`");
				raise;
		except pymysql.MySQLError as error:
			raise DatabaseOperationError(f"No se pudo crear '{self._database}': {error}") from error;
		finally:
			server.close();

	def load_basic_data(self) -> None:
		"""Carga los datos básicos (`mysql_basic_data.sql`).

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si falla la carga. La carga es atómica: si falla, no se inserta nada.
		"""
		self._run_script(self.connect(), self._BASIC_DATA_PATH);

	def connect(self) -> DatabaseConnectionBase:
		"""Abre una conexión nueva a la base de datos configurada.

		Returns:
			La conexión abierta. Quien la pide es responsable de cerrarla.

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si no se puede conectar.
		"""
		try:
			return self._open(self._database);
		except pymysql.MySQLError as error:
			if error.args and error.args[0] == 1049:  # ER_BAD_DB_ERROR: base de datos desconocida
				raise DatabaseNotFoundError(f"No existe la base de datos '{self._database}'") from error;
			raise DatabaseOperationError(f"No se pudo conectar a '{self._database}': {error}") from error;

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _open(self, database: str | None) -> DatabaseConnectionBase:
		"""Abre una conexión con pymysql, a una base de datos concreta o solo al servidor.

		Args:
			database: Base de datos a la que conectar, o None para conectar solo al servidor.

		Returns:
			La conexión abierta.

		Raises:
			pymysql.MySQLError: Si no se puede conectar.
		"""
		return pymysql.connect(
			host=self._host,
			port=self._port,
			user=self._user,
			password=self._password,
			database=database,
			charset="utf8mb4",
			client_flag=CLIENT.FOUND_ROWS,  # `rowcount` cuenta las filas que cumplen el WHERE aunque el UPDATE no cambie nada (como SQLite).
			cursorclass=pymysql.cursors.DictCursor,  # Las filas se leen por nombre de columna (como `sqlite3.Row`).
		);

	def _connect_server(self) -> DatabaseConnectionBase:
		"""Abre una conexión solo al servidor, sin elegir base de datos. Se usa para consultar, crear y borrar bases de datos.

		Returns:
			La conexión abierta. Quien la pide es responsable de cerrarla.

		Raises:
			DatabaseOperationError: Si no se puede conectar al servidor.
		"""
		try:
			return self._open(None);
		except pymysql.MySQLError as error:
			raise DatabaseOperationError(f"No se pudo conectar al servidor MySQL {self._host}:{self._port}: {error}") from error;

	# endregion PRIVATE METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _run_script(connection: DatabaseConnectionBase, path: Path) -> None:
		"""Ejecuta las sentencias de un fichero SQL en una sola transacción y cierra la conexión.

		Args:
			connection: Conexión abierta en la que se ejecuta el script. Se cierra siempre al terminar.
			path: Fichero SQL a ejecutar.

		Raises:
			DatabaseOperationError: Si el fichero no se puede leer o falla alguna sentencia.
		"""
		try:
			statements = MySQLAdapter._split_statements(FileUtils.read_text(path));

			cursor = connection.cursor();
			for statement in statements:
				cursor.execute(statement);
			connection.commit();
		except (pymysql.MySQLError, OSError) as error:
			raise DatabaseOperationError(f"Falló la ejecución de {path.name}: {error}") from error;
		finally:
			connection.close();

	@staticmethod
	def _split_statements(script: str) -> list[str]:
		"""Separa un script SQL en sentencias, cortando por los `;` que están fuera de textos y comentarios.

		Respeta los textos entre comillas simples, dobles o invertidas (con `\\` o la comilla repetida como escape) y
		descarta los comentarios `-- ...`, `# ...` y `/* ... */`.

		Args:
			script: Contenido del script SQL.

		Returns:
			Las sentencias, sin el `;` final y sin espacios sobrantes. Se ignoran las vacías.
		"""
		statements: list[str] = [];
		current: list[str] = [];
		quote: str | None = None;
		index = 0;
		while index < len(script):
			char = script[index];
			pair = script[index:index + 2];
			if quote is not None:
				current.append(char);
				if char == "\\" and quote != "`" and index + 1 < len(script):
					current.append(script[index + 1]);
					index += 1;
				elif char == quote:
					if pair == quote * 2:
						current.append(script[index + 1]);
						index += 1;
					else:
						quote = None;
			elif char in "'\"`":
				quote = char;
				current.append(char);
			elif pair == "--" or char == "#":
				end = script.find("\n", index);
				index = len(script) if end == -1 else end;
				continue;
			elif pair == "/*":
				end = script.find("*/", index + 2);
				index = len(script) if end == -1 else end + 2;
				current.append(" ");
				continue;
			elif char == ";":
				statements.append("".join(current).strip());
				current = [];
			else:
				current.append(char);
			index += 1;
		statements.append("".join(current).strip());
		return [statement for statement in statements if statement];

	# endregion PRIVATE STATIC METHODS
