from collections.abc import AsyncIterator;
from pathlib import Path;
from typing import ClassVar;

from app.application.exceptions import BIMModelContentNotFoundError, FileStorageError;
from app.application.ports.outbound import BIMModelFileStorageBase;
from app.logger import Logger;
from app.utils import FileUtils;


class LocalBIMModelFileStorage(BIMModelFileStorageBase):
	"""Ficheros IFC de los modelos BIM guardados en una carpeta del disco local.

	Cada fichero se guarda con el nombre aleatorio que le da el sistema, así que el nombre que el cliente da al fichero
	nunca decide dónde se escribe en disco.
	"""

	# region PRIVATE CONSTANTS

	_TEMP_EXTENSION: ClassVar[str] = ".tmp";
	"""Extensión que se añade mientras el fichero se está escribiendo."""

	_WRITE_BUFFER_SIZE: ClassVar[int] = 4 * 1024 * 1024;
	"""Tamaño, en bytes, del búfer de escritura (4 MiB). Los trozos que llegan por la red son pequeños y los ficheros pueden llegar a los gigas: con un búfer grande se escribe en el disco en bloques grandes."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, directory: Path) -> None:
		"""Crea el almacenamiento.

		Args:
			directory: Carpeta donde se guardan los ficheros. Se crea al guardar el primero si no existe.
		"""
		self._directory = directory;
		"""Carpeta donde se guardan los ficheros."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	async def save(self, stored_file_name: str, content: AsyncIterator[bytes]) -> None:
		"""Guarda un fichero, recibido por trozos, sin cargarlo entero en memoria.

		Se escribe primero en un fichero temporal y solo cuando está completo sustituye al anterior, de modo que una
		subida interrumpida no estropea el fichero que ya había.

		Raises:
			FileStorageError: Si no se puede escribir el fichero.
		"""
		final_path = self._get_file_path(stored_file_name);
		temp_path = final_path.with_name(final_path.name + self._TEMP_EXTENSION);

		try:
			FileUtils.create_directory(self._directory);
			with temp_path.open("wb", buffering=self._WRITE_BUFFER_SIZE) as file:
				async for chunk in content:
					file.write(chunk);
			temp_path.replace(final_path);
		except OSError as error:
			raise FileStorageError(f"No se pudo guardar el fichero '{stored_file_name}': {error}") from error;
		finally:
			# Si la subida ha ido bien el temporal ya no existe; si se ha interrumpido, lo borramos.
			try:
				FileUtils.delete(temp_path);
			except OSError as error:
				Logger.warning(f"No se pudo borrar el fichero temporal {temp_path}: {error}");

	def get_path(self, stored_file_name: str) -> Path:
		"""Devuelve la ruta de un fichero guardado.

		Raises:
			BIMModelContentNotFoundError: Si no hay ningún fichero guardado con ese nombre.
		"""
		path = self._get_file_path(stored_file_name);
		if not path.is_file():
			raise BIMModelContentNotFoundError(f"No hay ningún fichero guardado con el nombre '{stored_file_name}'");
		return path;

	def get_size(self, stored_file_name: str) -> int:
		"""Devuelve el tamaño de un fichero guardado, o 0 si no hay ninguno con ese nombre.

		Raises:
			FileStorageError: Si no se puede consultar el fichero.
		"""
		path = self._get_file_path(stored_file_name);
		size = 0;
		try:
			if path.is_file():
				size = path.stat().st_size;
		except OSError as error:
			raise FileStorageError(f"No se pudo consultar el tamaño del fichero '{stored_file_name}': {error}") from error;
		return size;

	def delete(self, stored_file_name: str) -> None:
		"""Borra un fichero guardado. Si no existía, no hace nada.

		Raises:
			FileStorageError: Si no se puede borrar el fichero.
		"""
		try:
			FileUtils.delete(self._get_file_path(stored_file_name));
		except OSError as error:
			raise FileStorageError(f"No se pudo borrar el fichero '{stored_file_name}': {error}") from error;

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _get_file_path(self, stored_file_name: str) -> Path:
		"""Calcula la ruta donde se guarda un fichero.

		Args:
			stored_file_name: Nombre con el que se guarda el fichero.

		Returns:
			La ruta del fichero (exista o no).
		"""
		return self._directory / stored_file_name;

	# endregion PRIVATE METHODS
