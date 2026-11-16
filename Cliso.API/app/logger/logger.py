import queue;
import sys;
import threading;
import time;
import traceback;
from datetime import datetime;
from pathlib import Path;
from typing import ClassVar;

from app.logger.log_level import LogLevel;
from app.utils import FileUtils;


class Logger:
	"""Registro de la aplicación en un fichero, con mensajes de depuración, información, aviso y error.

	Clase estática: no se instancia. Se llama a `setup()` una vez al arrancar y, a partir de ahí, se escribe con
	`debug()`, `info()`, `warning()` y `error()`. Cada línea lleva fecha, nivel y mensaje. Los mensajes de un nivel
	menos grave que el mínimo indicado en `setup()` se descartan.

	Quien escribe un mensaje no espera al disco: el mensaje se mete en una cola y un hilo escritor, en segundo plano,
	los saca y los escribe por lotes. La cola tiene un tamaño máximo: si se llena, quien escribe espera a que haya
	sitio. Un bloqueo impide que se metan mensajes mientras el logger se configura o se cierra. Al cerrar, se escriben
	todos los mensajes pendientes antes de parar el hilo. Cada lote se escribe primero en un fichero temporal (copia del
	log más las líneas nuevas) que después sustituye al log, para que un fallo a mitad de escritura no deje el log roto.
	Cuando el log supera un tamaño máximo se guarda como copia (`.1`) y se empieza uno nuevo. Las líneas se escriben
	también por la salida de errores (consola), para poder verlas, por ejemplo, en Docker.
	"""

	# region PRIVATE CONSTANTS

	_TIMESTAMP_FORMAT: ClassVar[str] = "%Y-%m-%d %H:%M:%S";
	"""Formato de la fecha y hora de cada línea (los milisegundos se añaden aparte)."""

	_TEMP_EXTENSION: ClassVar[str] = ".tmp";
	"""Extensión del fichero temporal en el que se prepara cada escritura."""

	_BACKUP_EXTENSION: ClassVar[str] = ".1";
	"""Extensión de la copia del log que se guarda al superar el tamaño máximo."""

	_MAX_FILE_SIZE_BYTES: ClassVar[int] = 5 * 1024 * 1024;
	"""Tamaño máximo del log (5 MB). Al superarlo se guarda como copia y se empieza uno nuevo, para que la copia al
	temporal de cada escritura no crezca sin límite."""

	_MAX_BATCH_LINES: ClassVar[int] = 500;
	"""Número máximo de mensajes que el hilo escritor escribe de una vez."""

	_BATCH_WAIT_SECONDS: ClassVar[float] = 0.2;
	"""Tiempo máximo (200 ms) que el hilo escritor espera a que lleguen más mensajes antes de escribir un lote. Así,
	con tráfico, se escriben muchos mensajes por cada copia del fichero, y un mensaje tarda como mucho eso en llegar
	al disco."""

	_MAX_QUEUE_SIZE: ClassVar[int] = 10000;
	"""Número máximo de mensajes pendientes en la cola. Si se llena, quien escribe espera a que el hilo escritor haga
	sitio: así la memoria no crece sin límite y no se pierde ningún mensaje."""

	_WRITER_THREAD_NAME: ClassVar[str] = "cliso-logger";
	"""Nombre del hilo escritor (sirve para reconocerlo al depurar)."""

	# endregion PRIVATE CONSTANTS

	# region PRIVATE STATIC PROPERTIES

	_lock: ClassVar[threading.Lock] = threading.Lock();
	"""Bloqueo que protege la configuración (nivel, cola e hilo escritor): mientras un hilo configura o cierra el
	logger, ningún otro puede meter mensajes, y al revés. Así ningún mensaje acaba en una cola que se está cerrando."""

	_minimum_level: ClassVar[LogLevel] = LogLevel.INFO;
	"""Nivel mínimo de los mensajes que se escriben."""

	_queue: ClassVar[queue.Queue[str | None] | None] = None;
	"""Cola de líneas pendientes de escribir (None hasta que se llama a `setup()`). Un None dentro de la cola es la
	señal para que el hilo escritor termine."""

	_writer: ClassVar[threading.Thread | None] = None;
	"""Hilo escritor que saca las líneas de la cola y las escribe (None hasta que se llama a `setup()`)."""

	# endregion PRIVATE STATIC PROPERTIES

	# region PUBLIC STATIC METHODS

	@staticmethod
	def setup(file_path: Path, minimum_level: LogLevel) -> None:
		"""Configura el logger para escribir en el fichero indicado y arranca el hilo escritor.

		Crea la carpeta del fichero si hace falta y borra el temporal que haya podido quedar de una escritura
		interrumpida. Si ya estaba configurado, primero se cierra (escribiendo lo pendiente) y se vuelve a configurar.

		Args:
			file_path: Fichero de log. Los mensajes se añaden al final; no se borra lo anterior.
			minimum_level: Nivel mínimo de los mensajes que se escriben.

		Raises:
			OSError: Si no se puede crear la carpeta o borrar el temporal anterior.
		"""
		# `with` sobre el bloqueo equivale al `lock (...) { }` de C#: se suelta al salir, aunque salte una excepción.
		with Logger._lock:
			Logger._stop_writer();

			FileUtils.create_directory(file_path.parent);
			FileUtils.delete(Logger._get_temp_path(file_path));

			entries: queue.Queue[str | None] = queue.Queue(maxsize=Logger._MAX_QUEUE_SIZE);
			writer = threading.Thread(
				target=Logger._write_loop,
				args=(file_path, entries),
				name=Logger._WRITER_THREAD_NAME,
				# Hilo "de fondo": si la aplicación termina sin llamar a close(), no la deja colgada esperándolo.
				daemon=True,
			);

			Logger._minimum_level = minimum_level;
			Logger._queue = entries;
			Logger._writer = writer;
			writer.start();

	@staticmethod
	def debug(message: str) -> None:
		"""Escribe un mensaje de depuración: detalle para seguir lo que hace la aplicación.

		Args:
			message: Texto del mensaje.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		Logger._enqueue(LogLevel.DEBUG, message, None);

	@staticmethod
	def info(message: str) -> None:
		"""Escribe un mensaje informativo: algo que ha ocurrido con normalidad.

		Args:
			message: Texto del mensaje.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		Logger._enqueue(LogLevel.INFO, message, None);

	@staticmethod
	def warning(message: str) -> None:
		"""Escribe un aviso: algo anómalo que no impide seguir funcionando.

		Args:
			message: Texto del mensaje.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		Logger._enqueue(LogLevel.WARNING, message, None);

	@staticmethod
	def error(message: str, exception: BaseException | None = None) -> None:
		"""Escribe un error: algo ha fallado.

		Args:
			message: Descripción de lo que ha fallado.
			exception: Excepción capturada. Si se indica, se añade su traza al fichero.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		Logger._enqueue(LogLevel.ERROR, message, exception);

	@staticmethod
	def close() -> None:
		"""Escribe los mensajes pendientes y para el hilo escritor. Después hay que volver a llamar a `setup()`.

		Si el logger no está configurado, no hace nada.
		"""
		with Logger._lock:
			Logger._stop_writer();

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _enqueue(level: LogLevel, message: str, exception: BaseException | None) -> None:
		"""Da formato al mensaje y lo mete en la cola, si su nivel llega al mínimo.

		El nivel se comprueba antes de dar formato, para no gastar nada en los mensajes que se descartan. El formato
		se prepara con el bloqueo cogido, así las líneas entran en la cola en el orden de su fecha. Si la cola está
		llena, espera (con el bloqueo cogido) a que el hilo escritor haga sitio; el hilo escritor no usa el bloqueo,
		así que siempre puede seguir vaciando la cola.

		Args:
			level: Nivel del mensaje.
			message: Texto del mensaje.
			exception: Excepción cuya traza se añade al mensaje, o None.

		Raises:
			RuntimeError: Si todavía no se ha llamado a `setup()`.
		"""
		with Logger._lock:
			entries = Logger._queue;
			if entries is None:
				raise RuntimeError("El logger no está configurado: llama antes a Logger.setup().");

			if level.severity >= Logger._minimum_level.severity:
				entries.put(Logger._format_line(level, message, exception));
			else:
				pass;  # Por debajo del nivel mínimo: se descarta sin llegar a darle formato.

	@staticmethod
	def _stop_writer() -> None:
		"""Para el hilo escritor después de que escriba todos los mensajes pendientes, y deja el logger sin configurar.

		Quien la llama debe tener cogido el bloqueo. Si el logger no está configurado, no hace nada.
		"""
		entries = Logger._queue;
		writer = Logger._writer;
		if entries is not None and writer is not None:
			# La señal de parada va detrás de los mensajes pendientes: el hilo los escribe todos antes de terminar.
			entries.put(None);
			# join() espera a que el hilo termine, como el Wait() de un Task en C#.
			writer.join();
			Logger._queue = None;
			Logger._writer = None;
		else:
			pass;  # No está configurado: no hay nada que parar.

	@staticmethod
	def _format_line(level: LogLevel, message: str, exception: BaseException | None) -> str:
		"""Compone el texto que se escribe en el fichero: `fecha [NIVEL] mensaje`, más la traza de la excepción.

		Args:
			level: Nivel del mensaje.
			message: Texto del mensaje.
			exception: Excepción cuya traza se añade en las líneas siguientes, o None.

		Returns:
			El texto, acabado en salto de línea. Los saltos de línea del mensaje se escriben como `\n` y `\r` (texto).
		"""
		now = datetime.now();
		timestamp = f"{now.strftime(Logger._TIMESTAMP_FORMAT)},{now.microsecond // 1000:03d}";
		# Los saltos de línea del mensaje se escriben como texto: si no, un dato que controla el cliente (un nick, una
		# ruta) podría colar líneas falsas con aspecto de mensajes del log. Solo la traza lleva saltos de línea reales.
		clean_message = message.replace("\r", "\\r").replace("\n", "\\n");
		line = f"{timestamp} [{level.value.upper()}] {clean_message}\n";
		if exception is not None:
			line = line + "".join(traceback.format_exception(exception));
		else:
			pass;  # Sin excepción: solo la línea del mensaje.
		return line;

	@staticmethod
	def _write_loop(file_path: Path, entries: queue.Queue[str | None]) -> None:
		"""Bucle del hilo escritor: espera mensajes, los junta en lotes y los escribe, hasta recibir la señal de parada.

		Cuando llega un mensaje, el hilo espera hasta `_BATCH_WAIT_SECONDS` a que lleguen más (como mucho
		`_MAX_BATCH_LINES`), para escribir varios de una sola vez en lugar de copiar el fichero por cada mensaje. La
		señal de parada cierra el lote en cuanto llega, sin esperar.

		Ningún error detiene el hilo: si nadie vaciara la cola, al llenarse dejaría esperando para siempre a todos los
		que escriben en el log. Un error no previsto se avisa por consola y se pierde solo ese lote.

		Args:
			file_path: Fichero de log.
			entries: Cola de la que se sacan los mensajes. Un None es la señal de parada.
		"""
		is_running = True;
		while is_running:
			lines: list[str] = [];
			# get() espera (sin gastar CPU) hasta que haya algo en la cola.
			entry = entries.get();
			deadline = time.monotonic() + Logger._BATCH_WAIT_SECONDS;
			is_batch_open = True;
			while is_batch_open:
				if entry is None:
					is_running = False;
					is_batch_open = False;
				else:
					lines.append(entry);
					remaining_seconds = deadline - time.monotonic();
					if len(lines) >= Logger._MAX_BATCH_LINES or remaining_seconds <= 0:
						is_batch_open = False;
					else:
						try:
							# Espera al siguiente mensaje, como mucho lo que queda de plazo para este lote.
							entry = entries.get(timeout=remaining_seconds);
						except queue.Empty:
							is_batch_open = False;

			if len(lines) > 0:
				try:
					Logger._write_batch(file_path, lines);
				except Exception as error:
					Logger._write_console(f"Error no previsto al escribir en el log '{file_path}': {error}\n");
			else:
				pass;  # Solo ha llegado la señal de parada: no hay nada que escribir.

	@staticmethod
	def _write_batch(file_path: Path, lines: list[str]) -> None:
		"""Escribe un lote de líneas en el log a través de un fichero temporal, y también por consola.

		Se copia el log al temporal, se añaden las líneas al temporal y este sustituye al log de una vez. Si algo falla,
		el log queda como estaba y el error se escribe por consola: el hilo escritor no se detiene.

		Args:
			file_path: Fichero de log.
			lines: Líneas a escribir, cada una acabada en salto de línea.
		"""
		text = "".join(lines);
		Logger._write_console(text);

		temp_path = Logger._get_temp_path(file_path);
		try:
			Logger._rotate_if_needed(file_path);
			if file_path.exists():
				FileUtils.copy(file_path, temp_path);
			else:
				pass;  # Primer lote del log: el temporal se crea al añadir las líneas.
			FileUtils.append_text(temp_path, text);
			# Sustitución de una vez: quien lea el log ve el anterior o el nuevo, nunca uno a medias.
			temp_path.replace(file_path);
		except OSError as error:
			Logger._write_console(f"No se pudo escribir en el log '{file_path}': {error}\n");
			try:
				FileUtils.delete(temp_path);
			except OSError as delete_error:
				Logger._write_console(f"No se pudo borrar el fichero temporal del log '{temp_path}': {delete_error}\n");

	@staticmethod
	def _rotate_if_needed(file_path: Path) -> None:
		"""Si el log supera el tamaño máximo, lo guarda como copia (`.1`, sustituyendo la anterior) para empezar uno nuevo.

		Args:
			file_path: Fichero de log.

		Raises:
			OSError: Si no se puede consultar el tamaño o renombrar el fichero.
		"""
		if file_path.exists() and file_path.stat().st_size > Logger._MAX_FILE_SIZE_BYTES:
			file_path.replace(file_path.with_name(file_path.name + Logger._BACKUP_EXTENSION));
		else:
			pass;  # Todavía cabe: se sigue escribiendo en el mismo.

	@staticmethod
	def _write_console(text: str) -> None:
		"""Escribe un texto por la salida de errores (consola), si la hay.

		Sin consola (por ejemplo, la API como servicio de Windows) `sys.stderr` vale None y no se escribe nada. Si la
		consola falla (una tubería rota, una salida cerrada), el fallo se ignora: el texto ya está en el fichero y un
		error aquí mataría el hilo escritor, con lo que la cola se llenaría y la API se bloquearía.

		Args:
			text: Texto a escribir, con sus saltos de línea.
		"""
		if sys.stderr is not None:
			try:
				sys.stderr.write(text);
			except (OSError, ValueError):
				pass;  # La consola no responde: no hay nada que hacer, el texto solo queda en el fichero.
		else:
			pass;  # Sin consola: el texto solo queda, si se ha podido, en el fichero.

	@staticmethod
	def _get_temp_path(file_path: Path) -> Path:
		"""Devuelve la ruta del fichero temporal del log (el mismo nombre con `.tmp` al final).

		Args:
			file_path: Fichero de log.

		Returns:
			La ruta del fichero temporal, en la misma carpeta que el log.
		"""
		return file_path.with_name(file_path.name + Logger._TEMP_EXTENSION);

	# endregion PRIVATE STATIC METHODS
