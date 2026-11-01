from abc import ABC, abstractmethod;

from app.domain.models import Visualization;


class VisualizationRepositoryBase(ABC):
	"""Contrato de acceso a las visualizaciones guardadas."""

	# TODO: cuando haya edición de una sola pieza, valorar un repositorio de piezas propio. Hoy se guardan aquí, con la
	# visualización, para hacerlo todo en una sola transacción; separarlas exigiría compartir esa transacción o aceptar que
	# un fallo deje la visualización sin piezas.

	# region PUBLIC METHODS

	@abstractmethod
	def get_all(self, bim_model_id: int | None, visible_to_user_id: int | None, depth: int) -> list[Visualization]:
		"""Recupera las visualizaciones activas, todas o solo las de un modelo BIM, y solo las que puede ver un usuario.

		Args:
			bim_model_id: Identificador del modelo BIM del que se quieren las visualizaciones, o None para todas.
			visible_to_user_id: Identificador del usuario que las va a ver: solo se recuperan las públicas y las suyas. None
				para recuperarlas todas, sin importar de quién sean.
			depth: Profundidad de la recuperación: con 0, solo los datos de la visualización (`pieces` queda a None); con
				1 o más, también sus piezas.

		Returns:
			Las visualizaciones activas, ordenadas por nombre (la lista queda vacía si no hay ninguna).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_by_id(self, visualization_id: int, depth: int, include_inactive: bool = False) -> Visualization:
		"""Recupera la visualización con ese identificador.

		Args:
			visualization_id: Identificador de la visualización.
			depth: Profundidad de la recuperación: con 0, solo los datos de la visualización (`pieces` queda a None); con
				1 o más, también sus piezas.
			include_inactive: Si es True, también encuentra las visualizaciones borradas lógicamente.

		Returns:
			La visualización encontrada.

		Raises:
			VisualizationNotFoundError: Si no existe la visualización (activa, salvo que `include_inactive` sea True).
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def add(self, visualization: Visualization) -> Visualization:
		"""Guarda una visualización nueva, junto con sus piezas si las lleva.

		Args:
			visualization: Visualización a guardar (sin `id`).

		Returns:
			La visualización guardada, con el `id` asignado por la base de datos (y el de cada pieza).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def update(self, visualization: Visualization) -> None:
		"""Guarda los cambios de nombre, descripción, observaciones y visibilidad de una visualización activa.

		El propietario y el modelo BIM no cambian nunca. Si `pieces` no es None, sustituye todas las piezas guardadas por
		esas (en ese orden); si es None, no toca las piezas.

		Args:
			visualization: Visualización con los datos nuevos (con `id`).

		Raises:
			VisualizationNotFoundError: Si no hay ninguna visualización activa con ese `id`.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def deactivate(self, visualization_id: int) -> None:
		"""Borra lógicamente una visualización: la deja inactiva y conserva todos sus datos.

		Args:
			visualization_id: Identificador de la visualización.

		Raises:
			VisualizationNotFoundError: Si no hay ninguna visualización activa con ese identificador.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def delete(self, visualization_id: int) -> None:
		"""Borra de verdad una visualización, activa o no, junto con sus piezas.

		Args:
			visualization_id: Identificador de la visualización.

		Raises:
			VisualizationNotFoundError: Si no existe la visualización.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
