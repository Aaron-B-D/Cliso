import logging;
from pathlib import Path;
from typing import ClassVar;

from app.utils import FileUtils;


class Logger:
	"""Registro de la aplicación en un fichero, con mensajes de información, aviso y error.

	Clase estática: no se instancia. Se llama a `setup()` una vez al arrancar y, a partir de ahí, se escribe con
	`info()`, `warning()` y `error()`. Cada línea lleva fecha, nivel y mensaje.
	"""

	# region PRIVATE CONSTANTS

	_NAME: ClassVar[str] = "cliso";
	"""Nombre del logger interno de Python."""

	_FORMAT: ClassVar[str] = "%(asctime)s [%(levelname)s] %(message)s";
	"""Formato de cada línea del fichero."""

	# endregion PRIVATE CONSTANTS

	# region PRIVATE STATIC PROPERTIES

	_logger: ClassVar[logging.Logger | None] = None;
	"""Logger configurado (None hasta que se llama a `setup()`)."""

	# endregion PRIVATE STATIC PROPERTIES

	# region PUBLIC STATIC METHODS

	@staticmethod
	def setup(file_path: Path) -> None:
		"""Configura el logger para escribir en el fichero indicado, creando su carpeta si hace falta.

		Si ya estaba configurado se reconfigura, sin duplicar los mensajes.

		Args:
			file_path: Fichero de log. Los mensajes se añaden al final; no se borra lo anterior.

		Raises:
			OSError: Si no se puede crear la carpeta o abrir el fichero.
		"""
		FileUtils.create_directory(file_path.parent);

		logger = logging.getLogger(Logger._NAME);
		Logger._close_handlers(logger);

		handler = logging.FileHandler(file_path, encoding="utf-8");
		handler.setFormatter(logging.Formatter(Logger._FORMAT));

		logger.setLevel(logging.INFO);
		logger.addHandler(handler);
		# Que los mensajes se propaguen también al logger raíz, para poder verlos por consola (por ejemplo, en Docker o en tests).
		logger.propagate = True;

		Logger._logger = logger;

	@staticmethod
	def info(message: str) -> None:
		"""Escribe un mensaje informativo: algo que ha ocurrido con normalidad.

		Args:
			message: Texto del mensaje.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		Logger._get().info(message);

	@staticmethod
	def warning(message: str) -> None:
		"""Escribe un aviso: algo anómalo que no impide seguir funcionando.

		Args:
			message: Texto del mensaje.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		Logger._get().warning(message);

	@staticmethod
	def error(message: str, exception: BaseException | None = None) -> None:
		"""Escribe un error: algo ha fallado.

		Args:
			message: Descripción de lo que ha fallado.
			exception: Excepción capturada. Si se indica, se añade su traza al fichero.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		Logger._get().error(message, exc_info=exception);

	@staticmethod
	def close() -> None:
		"""Cierra el fichero de log. Después hay que volver a llamar a `setup()` para escribir."""
		if Logger._logger is not None:
			Logger._close_handlers(Logger._logger);
			Logger._logger = None;

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _get() -> logging.Logger:
		"""Devuelve el logger configurado.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		if Logger._logger is None:
			raise RuntimeError("El logger no está configurado: llama antes a Logger.setup().");
		return Logger._logger;

	@staticmethod
	def _close_handlers(logger: logging.Logger) -> None:
		"""Quita y cierra los manejadores del logger, liberando el fichero.

		Args:
			logger: Logger al que se le quitan los manejadores.
		"""
		for handler in list(logger.handlers):
			logger.removeHandler(handler);
			handler.close();

	# endregion PRIVATE STATIC METHODS
