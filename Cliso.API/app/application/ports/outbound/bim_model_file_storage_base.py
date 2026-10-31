from abc import ABC, abstractmethod;
from collections.abc import AsyncIterator;
from pathlib import Path;


class BIMModelFileStorageBase(ABC):
	"""Contrato de almacenamiento de los ficheros IFC de los modelos BIM. Cada modelo tiene como mucho un fichero."""

	# region PUBLIC METHODS

	@abstractmethod
	async def save(self, model_id: int, content: AsyncIterator[bytes]) -> None:
		"""Guarda el fichero de un modelo, recibido por trozos, sin cargarlo entero en memoria. Si ya había uno, lo
		sustituye solo cuando el nuevo se ha guardado completo.

		Args:
			model_id: Identificador del modelo al que pertenece el fichero.
			content: Contenido del fichero, por trozos.

		Raises:
			FileStorageError: Si no se puede escribir el fichero (el anterior, si lo había, se conserva).
		"""

	@abstractmethod
	def get_path(self, model_id: int) -> Path:
		"""Devuelve la ruta del fichero de un modelo.

		Args:
			model_id: Identificador del modelo.

		Returns:
			La ruta del fichero guardado.

		Raises:
			BIMModelContentNotFoundError: Si el modelo no tiene fichero guardado.
		"""

	@abstractmethod
	def get_size(self, model_id: int) -> int:
		"""Devuelve el tamaño del fichero de un modelo.

		Args:
			model_id: Identificador del modelo.

		Returns:
			El tamaño en bytes, o 0 si el modelo no tiene fichero guardado.

		Raises:
			FileStorageError: Si no se puede consultar el fichero.
		"""

	@abstractmethod
	def delete(self, model_id: int) -> None:
		"""Borra el fichero de un modelo. Si no tenía, no hace nada.

		Args:
			model_id: Identificador del modelo.

		Raises:
			FileStorageError: Si no se puede borrar el fichero.
		"""

	# endregion PUBLIC METHODS
