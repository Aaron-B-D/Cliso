from enum import StrEnum;


class LogLevel(StrEnum):
	"""Nivel de un mensaje del log, de menos a más grave.

	El texto de cada nivel es el que se escribe en el fichero de configuración (`"debug"`, `"info"`...). Para saber si
	un nivel es más grave que otro se compara su `severity`.
	"""

	# region PUBLIC CONSTANTS

	DEBUG = "debug";
	"""Detalle para seguir lo que hace la aplicación (por ejemplo, cada petición). Solo interesa al depurar."""

	INFO = "info";
	"""Algo que ha ocurrido con normalidad (por ejemplo, el arranque)."""

	WARNING = "warning";
	"""Algo anómalo que no impide seguir funcionando."""

	ERROR = "error";
	"""Algo ha fallado."""

	# endregion PUBLIC CONSTANTS

	# region PUBLIC PROPERTIES

	@property
	def severity(self) -> int:
		"""Gravedad del nivel como número: cuanto más alto, más grave (`DEBUG` es 0 y `ERROR` es 3)."""
		if self == LogLevel.DEBUG:
			severity = 0;
		elif self == LogLevel.INFO:
			severity = 1;
		elif self == LogLevel.WARNING:
			severity = 2;
		else:
			severity = 3;
		return severity;

	# endregion PUBLIC PROPERTIES
