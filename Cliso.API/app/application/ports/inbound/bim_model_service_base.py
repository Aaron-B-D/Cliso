from abc import ABC, abstractmethod;
from collections.abc import AsyncIterator;
from pathlib import Path;

from app.domain.models import BIMModel;
from app.domain.wrappers import BIMModelWrapper;


class BIMModelServiceBase(ABC):
	"""Contrato del servicio de modelos BIM: lo que se puede pedir a la aplicación sobre los modelos y sus ficheros."""

	# region PUBLIC METHODS

	@abstractmethod
	def get_bim_models(self) -> list[BIMModelWrapper]:
		"""Recupera todos los modelos BIM activos, con el tamaño de su fichero.

		Returns:
			Los modelos activos (la lista queda vacía si no hay ninguno).

		Raises:
			FileStorageError: Si no se puede consultar el tamaño de algún fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_bim_model(self, model_id: int) -> BIMModelWrapper:
		"""Recupera el modelo BIM activo con ese identificador, con el tamaño de su fichero.

		Args:
			model_id: Identificador del modelo.

		Returns:
			El modelo encontrado.

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			FileStorageError: Si no se puede consultar el tamaño del fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def add_bim_model(self, model: BIMModel) -> BIMModelWrapper:
		"""Añade un modelo BIM con sus datos básicos. El fichero se sube después, con `set_content`.

		Args:
			model: Modelo a añadir (sin `id`).

		Returns:
			El modelo guardado, con el `id` que le ha asignado el sistema y sin fichero (tamaño 0).

		Raises:
			BIMModelValidationError: Si el nombre está vacío o es demasiado largo.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def update_bim_model(self, model_id: int, model: BIMModel) -> BIMModelWrapper:
		"""Modifica los datos básicos (nombre, descripción y observaciones) de un modelo BIM. No toca su fichero.

		Args:
			model_id: Identificador del modelo a modificar.
			model: Modelo con los datos nuevos. Solo se usan su nombre, su descripción y sus observaciones.

		Returns:
			El modelo ya modificado, con el tamaño de su fichero.

		Raises:
			BIMModelValidationError: Si el nombre está vacío o es demasiado largo.
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			FileStorageError: Si no se puede consultar el tamaño del fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	async def set_content(self, model_id: int, file_name: str, content: AsyncIterator[bytes]) -> BIMModelWrapper:
		"""Guarda el fichero IFC de un modelo BIM, recibido por trozos. Si el modelo ya tenía fichero, lo sustituye.

		Args:
			model_id: Identificador del modelo.
			file_name: Nombre original del fichero (debe acabar en `.ifc`).
			content: Contenido del fichero, por trozos.

		Returns:
			El modelo, con el nombre y el tamaño del fichero ya actualizados.

		Raises:
			BIMModelValidationError: Si el nombre del fichero no es válido.
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			FileStorageError: Si no se puede guardar el fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_content_path(self, model_id: int) -> Path:
		"""Devuelve la ruta del fichero IFC de un modelo BIM, para enviarlo por trozos.

		Args:
			model_id: Identificador del modelo.

		Returns:
			La ruta del fichero guardado.

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			BIMModelContentNotFoundError: Si el modelo todavía no tiene fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def delete_bim_model(self, model_id: int, force: bool) -> None:
		"""Elimina un modelo BIM.

		Args:
			model_id: Identificador del modelo.
			force: Si es False, el borrado es lógico (el modelo queda inactivo y se conservan sus datos, sus
				visualizaciones y su fichero). Si es True, se borran de verdad el modelo, sus visualizaciones y su fichero.

		Raises:
			BIMModelNotFoundError: Si no existe el modelo (con `force` False, tiene que estar activo).
			FileStorageError: Si con `force` no se puede borrar el fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
