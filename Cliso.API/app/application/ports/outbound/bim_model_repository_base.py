from abc import ABC, abstractmethod;

from app.domain.models import BIMModel;


class BIMModelRepositoryBase(ABC):
	"""Contrato de acceso a los modelos BIM guardados. Solo guarda los datos; el fichero IFC no pasa por aquí."""

	# region PUBLIC METHODS

	@abstractmethod
	def get_all(self) -> list[BIMModel]:
		"""Recupera todos los modelos BIM activos.

		Returns:
			Los modelos activos, ordenados por nombre (la lista queda vacía si no hay ninguno).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_by_id(self, model_id: int, include_inactive: bool = False) -> BIMModel:
		"""Recupera el modelo BIM con ese identificador.

		Args:
			model_id: Identificador del modelo.
			include_inactive: Si es True, también encuentra los modelos borrados lógicamente.

		Returns:
			El modelo encontrado.

		Raises:
			BIMModelNotFoundError: Si no existe el modelo (activo, salvo que `include_inactive` sea True).
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def add(self, model: BIMModel) -> BIMModel:
		"""Guarda un modelo BIM nuevo.

		Args:
			model: Modelo a guardar (sin `id`).

		Returns:
			El modelo guardado, con el `id` asignado por la base de datos.

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def update(self, model: BIMModel) -> None:
		"""Guarda los cambios de nombre, descripción, observaciones y nombre de fichero de un modelo BIM activo. El nombre con el que se guarda el fichero en disco no cambia nunca.

		Args:
			model: Modelo con los datos nuevos (con `id`).

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese `id`.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def deactivate(self, model_id: int) -> None:
		"""Borra lógicamente un modelo BIM: lo deja inactivo y conserva todos sus datos.

		Args:
			model_id: Identificador del modelo.

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def delete(self, model_id: int) -> None:
		"""Borra de verdad un modelo BIM, activo o no, junto con sus visualizaciones.

		Args:
			model_id: Identificador del modelo.

		Raises:
			BIMModelNotFoundError: Si no existe el modelo.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
