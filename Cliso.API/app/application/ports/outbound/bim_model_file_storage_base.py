from abc import ABC, abstractmethod;
from collections.abc import AsyncIterator;
from pathlib import Path;


class BIMModelFileStorageBase(ABC):
	"""Contrato de almacenamiento de los ficheros IFC de los modelos BIM. Cada fichero se identifica por el nombre con el que se guarda."""

	# region PUBLIC METHODS

	@abstractmethod
	async def save(self, stored_file_name: str, content: AsyncIterator[bytes]) -> None:
		"""Guarda un fichero, recibido por trozos, sin cargarlo entero en memoria. Si ya había uno con ese nombre, lo
		sustituye solo cuando el nuevo se ha guardado completo.

		Args:
			stored_file_name: Nombre con el que se guarda el fichero.
			content: Contenido del fichero, por trozos.

		Raises:
			FileStorageError: Si no se puede escribir el fichero (el anterior, si lo había, se conserva).
		"""

	@abstractmethod
	def get_path(self, stored_file_name: str) -> Path:
		"""Devuelve la ruta de un fichero guardado.

		Args:
			stored_file_name: Nombre con el que se guardó el fichero.

		Returns:
			La ruta del fichero guardado.

		Raises:
			BIMModelContentNotFoundError: Si no hay ningún fichero guardado con ese nombre.
		"""

	@abstractmethod
	def get_size(self, stored_file_name: str) -> int:
		"""Devuelve el tamaño de un fichero guardado.

		Args:
			stored_file_name: Nombre con el que se guardó el fichero.

		Returns:
			El tamaño en bytes, o 0 si no hay ningún fichero guardado con ese nombre.

		Raises:
			FileStorageError: Si no se puede consultar el fichero.
		"""

	@abstractmethod
	def delete(self, stored_file_name: str) -> None:
		"""Borra un fichero guardado. Si no existía, no hace nada.

		Args:
			stored_file_name: Nombre con el que se guardó el fichero.

		Raises:
			FileStorageError: Si no se puede borrar el fichero.
		"""

	# endregion PUBLIC METHODS
