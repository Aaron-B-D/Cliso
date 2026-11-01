from dataclasses import dataclass, field;
from pathlib import Path;
from typing import ClassVar;

from app.config.database_provider import DatabaseProvider;
from app.config.session_cookie_same_site import SessionCookieSameSite;
from app.utils import PathUtils;


@dataclass
class StartupParameters:
	"""Parámetros de arranque de la aplicación, leídos una vez al arrancar del fichero de configuración.

	Son solo los imprescindibles para arrancar: elegir y abrir la base de datos y escribir el log. El resto de
	parámetros de la aplicación viven en la tabla `application_parameter` de la base de datos.
	"""

	# region PRIVATE CONSTANTS

	_SQLITE_DATABASE_NAME: ClassVar[str] = "cliso";
	"""Nombre de la base de datos real en SQLite (el fichero será `cliso.db`)."""

	_DEMO_DATABASE_NAME: ClassVar[str] = "cliso-demo";
	"""Nombre de la base de datos demo. Es fijo: la API la borra y la rehace en cada arranque."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC PROPERTIES

	is_demo: bool = True;
	"""Si es True se usa una base de datos demo (`cliso-demo`), que se borra y se rehace con datos de demostración en cada arranque; si no, la base de datos real."""

	database_provider: DatabaseProvider = DatabaseProvider.SQLITE;
	"""Motor de base de datos: SQLite (por defecto) o MySQL."""

	sqlite_directory: str = "data";
	"""Carpeta donde se guardan los ficheros SQLite (relativa a Cliso.API si no es absoluta). Se crea si no existe."""

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

	allowed_origins: list[str] = field(default_factory=list[str]);
	"""Orígenes completos (`http://host:puerto`) de las webs autorizadas a llamar a la API desde el navegador. En modo demo se aceptan todos."""

	session_cookie_same_site: SessionCookieSameSite = SessionCookieSameSite.LAX;
	"""Política `SameSite` de la cookie de la sesión. Con la web y la API en sitios distintos (dominios distintos) debe ser `none`, que además exige https y que `allowed_origins` incluya el origen de la web."""

	@property
	def log_file(self) -> Path:
		"""Ruta absoluta del fichero de log."""
		return PathUtils.resolve(self.log_file_path);

	@property
	def database_name(self) -> str:
		"""Nombre de la base de datos que se usa, según el modo y el proveedor.

		En modo demo es `cliso-demo` con cualquier proveedor. Si no, `mysql_database` en MySQL y `cliso` en SQLite.
		"""
		if self.is_demo:
			name = self._DEMO_DATABASE_NAME;
		elif self.database_provider == DatabaseProvider.MYSQL:
			name = self.mysql_database;
		else:
			name = self._SQLITE_DATABASE_NAME;
		return name;

	@property
	def database_file(self) -> Path:
		"""Ruta absoluta del fichero SQLite (`<sqlite_directory>/<database_name>.db`)."""
		return PathUtils.resolve(self.sqlite_directory) / f"{self.database_name}.db";

	# endregion PUBLIC PROPERTIES
