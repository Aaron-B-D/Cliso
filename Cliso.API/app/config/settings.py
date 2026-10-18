from dataclasses import dataclass, field;
from datetime import date;
from pathlib import Path;
from typing import ClassVar;

from app.config.database_provider import DatabaseProvider;


@dataclass
class Settings:
	"""Configuración de la aplicación, leída una vez al arrancar."""

	# region PUBLIC CONSTANTS

	API_ROOT: ClassVar[Path] = Path(__file__).resolve().parents[2];
	"""Carpeta raíz de Cliso.API. Las rutas relativas de los settings se resuelven desde aquí."""

	# endregion PUBLIC CONSTANTS

	# region PRIVATE CONSTANTS

	_SQLITE_DATABASE_NAME: ClassVar[str] = "cliso";
	"""Nombre de la base de datos real en SQLite (el fichero será `cliso.db`)."""

	_DEMO_DATABASE_PREFIX: ClassVar[str] = "cliso-demo_";
	"""Prefijo del nombre de la base de datos demo, al que se le añade la fecha (`cliso-demo_20261010`)."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC PROPERTIES

	language: str = "es-ES";
	"""Idioma de arranque, como código internacional (por ejemplo, es-ES)."""

	is_demo: bool = True;
	"""Si es True se usa una base de datos demo (`cliso-demo_<fecha>`), creada con los datos demo si no existía; si no, la base de datos real."""

	database_provider: DatabaseProvider = DatabaseProvider.SQLITE;
	"""Motor de base de datos: SQLite (por defecto) o MySQL."""

	sqlite_directory: str = "data";
	"""Carpeta donde se guardan los ficheros SQLite (relativa a Cliso.API si no es absoluta). Se crea si no existe."""

	demo_data_path: str = "demo_data.json";
	"""Ruta del JSON con los datos demo (relativa a Cliso.API si no es absoluta)."""

	log_file_path: str = "logs/cliso.log";
	"""Fichero de log (relativo a Cliso.API si no es absoluto). Se crea su carpeta si no existe."""

	mysql_host: str = "localhost";
	"""Servidor MySQL."""

	mysql_port: int = 3306;
	"""Puerto del servidor MySQL."""

	mysql_user: str = "";
	"""Usuario de MySQL."""

	mysql_password: str = field(default="", repr=False);
	"""Contraseña de MySQL. No aparece en la representación de texto (`repr`) para que no acabe en un log."""

	mysql_database: str = "cliso";
	"""Nombre de la base de datos real de MySQL."""

	@property
	def log_file(self) -> Path:
		"""Ruta absoluta del fichero de log."""
		return self._resolve(self.log_file_path);

	@property
	def demo_data_file(self) -> Path:
		"""Ruta absoluta del fichero de datos demo."""
		return self._resolve(self.demo_data_path);

	@property
	def database_name(self) -> str:
		"""Nombre de la base de datos que se usa, según el modo y el proveedor.

		En modo demo es `cliso-demo_<fecha de hoy>` con cualquier proveedor. Si no, `mysql_database` en MySQL y `cliso`
		en SQLite. Como depende de la fecha, conviene consultarlo una sola vez.
		"""
		if self.is_demo:
			return f"{self._DEMO_DATABASE_PREFIX}{date.today():%Y%m%d}";
		if self.database_provider == DatabaseProvider.MYSQL:
			return self.mysql_database;
		return self._SQLITE_DATABASE_NAME;

	@property
	def database_file(self) -> Path:
		"""Ruta absoluta del fichero SQLite (`<sqlite_directory>/<database_name>.db`). Conviene consultarla una sola vez."""
		return self._resolve(self.sqlite_directory) / f"{self.database_name}.db";

	# endregion PUBLIC PROPERTIES

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _resolve(value: str) -> Path:
		"""Convierte una ruta de los settings en absoluta.

		Args:
			value: Ruta absoluta, o relativa a la carpeta Cliso.API.
		"""
		path = Path(value);
		return path if path.is_absolute() else Settings.API_ROOT / path;

	# endregion PRIVATE STATIC METHODS
