from enum import StrEnum;


class DatabaseProvider(StrEnum):
	"""Motor de base de datos con el que guarda la información la aplicación."""

	# region PUBLIC CONSTANTS

	SQLITE = "sqlite";
	"""SQLite: un fichero local, sin servidor. Es el proveedor por defecto."""

	MYSQL = "mysql";
	"""MySQL: en un servidor."""

	# endregion PUBLIC CONSTANTS
