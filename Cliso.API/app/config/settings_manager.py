import json;
import os;
from pathlib import Path;
from typing import Any, ClassVar, TypeVar, cast;

from app.config.database_provider import DatabaseProvider;
from app.config.exceptions import SettingsFileError, SettingsValueError;
from app.config.settings import Settings;

_T = TypeVar("_T");


class SettingsManager:
	"""Gestor estático de los settings: los lee del fichero JSON al arrancar.

	No se instancia. Se llama a `load()` una vez al arrancar y quien la llama se encarga de repartir los settings.
	"""

	# region PRIVATE CONSTANTS

	_ENV_VAR: ClassVar[str] = "CLISO_SETTINGS";
	"""Variable de entorno con la ruta de un fichero de settings alternativo."""

	_DEFAULT_PATH: ClassVar[Path] = Settings.API_ROOT / "settings.json";
	"""Ruta del fichero de settings por defecto."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def load(path: Path | None = None) -> Settings:
		"""Lee los settings del fichero.

		Si el fichero no existe se usan los valores por defecto. Las claves desconocidas se ignoran y las que
		faltan toman su valor por defecto.

		Args:
			path: Fichero de settings a leer. Si es None se usa la variable de entorno CLISO_SETTINGS o,
				en su defecto, Cliso.API/settings.json.

		Returns:
			Los settings cargados.

		Raises:
			SettingsFileError: Si el fichero no se puede leer, no es un JSON válido o no contiene un objeto.
			SettingsValueError: Si algún setting tiene un valor de un tipo distinto al esperado.
		"""
		path = path or Path(os.environ.get(SettingsManager._ENV_VAR, SettingsManager._DEFAULT_PATH));
		settings = Settings();

		if path.exists():
			try:
				with path.open(encoding="utf-8") as file:
					loaded: object = json.load(file);
			except (OSError, ValueError) as error:
				raise SettingsFileError(f"No se pudo leer el fichero de settings {path}: {error}") from error;
			if not isinstance(loaded, dict):
				raise SettingsFileError(f"El fichero de settings {path} debe contener un objeto JSON.");
			raw = cast(dict[str, Any], loaded);

			settings.language = SettingsManager._read(raw, "language", str, settings.language);
			settings.is_demo = SettingsManager._read(raw, "is_demo", bool, settings.is_demo);
			settings.database_provider = SettingsManager._read_provider(raw, settings.database_provider);
			settings.sqlite_directory = SettingsManager._read(raw, "sqlite_directory", str, settings.sqlite_directory);
			settings.demo_data_path = SettingsManager._read(raw, "demo_data_path", str, settings.demo_data_path);
			settings.log_file_path = SettingsManager._read(raw, "log_file_path", str, settings.log_file_path);
			settings.mysql_host = SettingsManager._read(raw, "mysql_host", str, settings.mysql_host);
			settings.mysql_port = SettingsManager._read(raw, "mysql_port", int, settings.mysql_port);
			settings.mysql_user = SettingsManager._read(raw, "mysql_user", str, settings.mysql_user);
			settings.mysql_password = SettingsManager._read(raw, "mysql_password", str, settings.mysql_password);
			settings.mysql_database = SettingsManager._read(raw, "mysql_database", str, settings.mysql_database);

		return settings;

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _read_provider(raw: dict[str, Any], default: DatabaseProvider) -> DatabaseProvider:
		"""Lee el setting `database_provider` del JSON comprobando que es uno de los proveedores conocidos.

		Args:
			raw: Contenido del fichero de settings.
			default: Proveedor que se usa si la clave no está en el fichero.

		Returns:
			El proveedor del fichero, o `default` si la clave no está.

		Raises:
			SettingsValueError: Si el valor no es un texto o no es un proveedor conocido (`sqlite`, `mysql`).
		"""
		value = SettingsManager._read(raw, "database_provider", str, default.value);
		try:
			return DatabaseProvider(value);
		except ValueError as error:
			valid = ", ".join(provider.value for provider in DatabaseProvider);
			raise SettingsValueError(f"El setting 'database_provider' debe ser uno de ({valid}), pero vale {value!r}.") from error;

	@staticmethod
	def _read(raw: dict[str, Any], key: str, expected: type[_T], default: _T) -> _T:
		"""Lee un setting del JSON comprobando que es del tipo esperado.

		Args:
			raw: Contenido del fichero de settings.
			key: Nombre del setting.
			expected: Tipo esperado del valor. Un booleano no se acepta como entero.
			default: Valor que se usa si la clave no está en el fichero.

		Returns:
			El valor del fichero, o `default` si la clave no está.

		Raises:
			SettingsValueError: Si el valor no es del tipo esperado.
		"""
		if key not in raw:
			return default;
		value = raw[key];
		if not isinstance(value, expected) or (expected is int and isinstance(value, bool)):
			raise SettingsValueError(
				f"El setting '{key}' debe ser de tipo {expected.__name__}, pero vale {value!r}."
			);
		return value;

	# endregion PRIVATE STATIC METHODS
