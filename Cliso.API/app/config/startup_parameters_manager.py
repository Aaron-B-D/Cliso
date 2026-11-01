import json;
import os;
from pathlib import Path;
from typing import Any, ClassVar, cast;

from app.config.database_provider import DatabaseProvider;
from app.config.exceptions import StartupParametersFileError, StartupParametersValueError;
from app.config.session_cookie_same_site import SessionCookieSameSite;
from app.config.startup_parameters import StartupParameters;
from app.utils import PathUtils;


class StartupParametersManager:
	"""Gestor estático de los parámetros de arranque: los lee del fichero de configuración (JSON) al arrancar.

	No se instancia. Se llama a `load()` una vez al arrancar y quien la llama se encarga de repartir los parámetros.
	"""

	# region PRIVATE CONSTANTS

	_ENV_VAR: ClassVar[str] = "CLISO_SETTINGS";
	"""Variable de entorno con la ruta de un fichero de configuración alternativo."""

	_DEFAULT_PATH: ClassVar[Path] = PathUtils.API_ROOT / "settings.json";
	"""Ruta del fichero de configuración por defecto."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def load(path: Path | None = None) -> StartupParameters:
		"""Lee los parámetros de arranque del fichero de configuración.

		Si el fichero no existe se usan los valores por defecto. Las claves desconocidas se ignoran y las que
		faltan toman su valor por defecto.

		Args:
			path: Fichero de configuración a leer. Si es None se usa la variable de entorno CLISO_SETTINGS o,
				en su defecto, Cliso.API/settings.json.

		Returns:
			Los parámetros de arranque cargados.

		Raises:
			StartupParametersFileError: Si el fichero no se puede leer, no es un JSON válido o no contiene un objeto.
			StartupParametersValueError: Si algún parámetro tiene un valor de un tipo distinto al esperado, o una
				combinación no permitida (`session_cookie_same_site` a `none` con `is_demo`).
		"""
		path = path or Path(os.environ.get(StartupParametersManager._ENV_VAR, StartupParametersManager._DEFAULT_PATH));
		parameters = StartupParameters();

		if path.exists():
			try:
				with path.open(encoding="utf-8") as file:
					loaded: object = json.load(file);
			except (OSError, ValueError) as error:
				raise StartupParametersFileError(f"No se pudo leer el fichero de configuración {path}: {error}") from error;
			if not isinstance(loaded, dict):
				raise StartupParametersFileError(f"El fichero de configuración {path} debe contener un objeto JSON.");
			raw = cast(dict[str, Any], loaded);

			parameters.is_demo = StartupParametersManager._read(raw, "is_demo", bool, parameters.is_demo);
			parameters.database_provider = StartupParametersManager._read_provider(raw, parameters.database_provider);
			parameters.sqlite_directory = StartupParametersManager._read(raw, "sqlite_directory", str, parameters.sqlite_directory);
			parameters.log_file_path = StartupParametersManager._read(raw, "log_file_path", str, parameters.log_file_path);
			parameters.mysql_host = StartupParametersManager._read(raw, "mysql_host", str, parameters.mysql_host);
			parameters.mysql_port = StartupParametersManager._read(raw, "mysql_port", int, parameters.mysql_port);
			parameters.mysql_user = StartupParametersManager._read(raw, "mysql_user", str, parameters.mysql_user);
			parameters.mysql_password = StartupParametersManager._read(raw, "mysql_password", str, parameters.mysql_password);
			parameters.mysql_database = StartupParametersManager._read(raw, "mysql_database", str, parameters.mysql_database);
			parameters.allowed_origins = StartupParametersManager._read_origins(raw, parameters.allowed_origins);
			parameters.session_cookie_same_site = StartupParametersManager._read_same_site(
				raw, parameters.session_cookie_same_site
			);
			# En modo demo la API acepta llamadas de cualquier web: con la cookie enviada entre sitios, cualquiera podría usarla.
			if parameters.session_cookie_same_site == SessionCookieSameSite.NONE and parameters.is_demo:
				raise StartupParametersValueError(
					"El parámetro 'session_cookie_same_site' no puede ser 'none' con 'is_demo' a true: en modo demo la API "
					"acepta llamadas de cualquier web y la cookie de la sesión podría usarse desde otro sitio."
				);

		return parameters;

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _read_origins(raw: dict[str, Any], default: list[str]) -> list[str]:
		"""Lee el parámetro `allowed_origins` del JSON comprobando que es una lista de textos.

		Args:
			raw: Contenido del fichero de configuración.
			default: Orígenes que se usan si la clave no está en el fichero.

		Returns:
			Los orígenes del fichero, o `default` si la clave no está.

		Raises:
			StartupParametersValueError: Si el valor no es una lista de textos.
		"""
		result = default;
		if "allowed_origins" in raw:
			value: object = raw["allowed_origins"];
			is_valid = isinstance(value, list) and all(isinstance(item, str) for item in cast(list[object], value));
			if not is_valid:
				raise StartupParametersValueError(f"El parámetro 'allowed_origins' debe ser una lista de textos, pero vale '{value}'.");
			result = [str(item) for item in cast(list[object], value)];
		return result;

	@staticmethod
	def _read_provider(raw: dict[str, Any], default: DatabaseProvider) -> DatabaseProvider:
		"""Lee el parámetro `database_provider` del JSON comprobando que es uno de los proveedores conocidos.

		Args:
			raw: Contenido del fichero de configuración.
			default: Proveedor que se usa si la clave no está en el fichero.

		Returns:
			El proveedor del fichero, o `default` si la clave no está.

		Raises:
			StartupParametersValueError: Si el valor no es un texto o no es un proveedor conocido (`sqlite`, `mysql`).
		"""
		value = StartupParametersManager._read(raw, "database_provider", str, default.value);
		try:
			return DatabaseProvider(value);
		except ValueError as error:
			valid = ", ".join(provider.value for provider in DatabaseProvider);
			raise StartupParametersValueError(
				f"El parámetro 'database_provider' debe ser uno de ({valid}), pero vale '{value}'."
			) from error;

	@staticmethod
	def _read_same_site(raw: dict[str, Any], default: SessionCookieSameSite) -> SessionCookieSameSite:
		"""Lee el parámetro `session_cookie_same_site` del JSON comprobando que es una de las políticas conocidas.

		Args:
			raw: Contenido del fichero de configuración.
			default: Política que se usa si la clave no está en el fichero.

		Returns:
			La política del fichero, o `default` si la clave no está.

		Raises:
			StartupParametersValueError: Si el valor no es un texto o no es una política conocida (`lax`, `strict`, `none`).
		"""
		value = StartupParametersManager._read(raw, "session_cookie_same_site", str, default.value);
		try:
			return SessionCookieSameSite(value);
		except ValueError as error:
			valid = ", ".join(same_site.value for same_site in SessionCookieSameSite);
			raise StartupParametersValueError(
				f"El parámetro 'session_cookie_same_site' debe ser uno de ({valid}), pero vale '{value}'."
			) from error;

	@staticmethod
	def _read[T](raw: dict[str, Any], key: str, expected: type[T], default: T) -> T:
		"""Lee un parámetro del JSON comprobando que es del tipo esperado.

		Args:
			raw: Contenido del fichero de configuración.
			key: Nombre del parámetro.
			expected: Tipo esperado del valor. Un booleano no se acepta como entero.
			default: Valor que se usa si la clave no está en el fichero.

		Returns:
			El valor del fichero, o `default` si la clave no está.

		Raises:
			StartupParametersValueError: Si el valor no es del tipo esperado.
		"""
		result = default;
		if key in raw:
			value = raw[key];
			if not isinstance(value, expected) or (expected is int and isinstance(value, bool)):
				raise StartupParametersValueError(
					f"El parámetro '{key}' debe ser de tipo {expected.__name__}, pero vale '{value}'."
				);
			result = value;
		return result;

	# endregion PRIVATE STATIC METHODS
