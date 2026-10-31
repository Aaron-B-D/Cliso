from collections.abc import AsyncIterator;
from pathlib import Path;
from typing import ClassVar;

from app.application.exceptions import BIMModelContentNotFoundError, FileStorageError;
from app.application.ports.outbound import BIMModelFileStorageBase;
from app.logger import Logger;
from app.utils import FileUtils;


class LocalBIMModelFileStorage(BIMModelFileStorageBase):
	"""Ficheros IFC de los modelos BIM guardados en una carpeta del disco local.

	Cada fichero se llama `<id del modelo>.ifc`, así que el nombre que el cliente da al fichero nunca decide dónde se
	escribe en disco.
	"""

	# region PRIVATE CONSTANTS

	_EXTENSION: ClassVar[str] = ".ifc";
	"""Extensión de los ficheros guardados."""

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

	async def save(self, model_id: int, content: AsyncIterator[bytes]) -> None:
		"""Guarda el fichero de un modelo, recibido por trozos, sin cargarlo entero en memoria.

		Se escribe primero en un fichero temporal y solo cuando está completo sustituye al anterior, de modo que una
		subida interrumpida no estropea el fichero que ya había.

		Raises:
			FileStorageError: Si no se puede escribir el fichero.
		"""
		final_path = self._get_file_path(model_id);
		temp_path = final_path.with_name(final_path.name + self._TEMP_EXTENSION);

		try:
			FileUtils.create_directory(self._directory);
			with temp_path.open("wb", buffering=self._WRITE_BUFFER_SIZE) as file:
				async for chunk in content:
					file.write(chunk);
			temp_path.replace(final_path);
		except OSError as error:
			raise FileStorageError(f"No se pudo guardar el fichero del modelo BIM {model_id}: {error}") from error;
		finally:
			# Si la subida ha ido bien el temporal ya no existe; si se ha interrumpido, lo borramos.
			try:
				FileUtils.delete(temp_path);
			except OSError as error:
				Logger.warning(f"No se pudo borrar el fichero temporal {temp_path}: {error}");

	def get_path(self, model_id: int) -> Path:
		"""Devuelve la ruta del fichero de un modelo.

		Raises:
			BIMModelContentNotFoundError: Si el modelo no tiene fichero guardado.
		"""
		path = self._get_file_path(model_id);
		if not path.is_file():
			raise BIMModelContentNotFoundError(f"El modelo BIM {model_id} no tiene fichero guardado");
		return path;

	def get_size(self, model_id: int) -> int:
		"""Devuelve el tamaño del fichero de un modelo, o 0 si no tiene fichero guardado.

		Raises:
			FileStorageError: Si no se puede consultar el fichero.
		"""
		path = self._get_file_path(model_id);
		size = 0;
		try:
			if path.is_file():
				size = path.stat().st_size;
		except OSError as error:
			raise FileStorageError(f"No se pudo consultar el tamaño del fichero del modelo BIM {model_id}: {error}") from error;
		return size;

	def delete(self, model_id: int) -> None:
		"""Borra el fichero de un modelo. Si no tenía, no hace nada.

		Raises:
			FileStorageError: Si no se puede borrar el fichero.
		"""
		try:
			FileUtils.delete(self._get_file_path(model_id));
		except OSError as error:
			raise FileStorageError(f"No se pudo borrar el fichero del modelo BIM {model_id}: {error}") from error;

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _get_file_path(self, model_id: int) -> Path:
		"""Calcula la ruta donde se guarda el fichero de un modelo.

		Args:
			model_id: Identificador del modelo.

		Returns:
			La ruta del fichero (exista o no).
		"""
		return self._directory / f"{model_id}{self._EXTENSION}";

	# endregion PRIVATE METHODS
