from abc import ABC, abstractmethod;

from app.domain.models import Session, Visualization;


class VisualizationServiceBase(ABC):
	"""Contrato del servicio de visualizaciones: lo que se puede pedir a la aplicación sobre las visualizaciones.

	Todas las operaciones se hacen en nombre del usuario de una sesión, que decide qué visualizaciones ve y cuáles puede
	modificar.
	"""

	# region PUBLIC METHODS

	@abstractmethod
	def get_visualizations(self, session: Session, bim_model_id: int | None, depth: int) -> list[Visualization]:
		"""Recupera las visualizaciones activas que puede ver el usuario de la sesión, todas o solo las de un modelo BIM.

		Args:
			session: Sesión del usuario que las pide.
			bim_model_id: Identificador del modelo BIM del que se quieren las visualizaciones, o None para todas.
			depth: Profundidad: con 0, solo los datos de cada visualización (`pieces` queda a None); con 1, también sus piezas.

		Returns:
			Las visualizaciones activas visibles para el usuario (la lista queda vacía si no hay ninguna).

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def get_visualization(self, session: Session, visualization_id: int, depth: int) -> Visualization:
		"""Recupera la visualización activa con ese identificador, si el usuario de la sesión puede verla.

		Args:
			session: Sesión del usuario que la pide.
			visualization_id: Identificador de la visualización.
			depth: Profundidad: con 0, solo los datos de la visualización (`pieces` queda a None); con 1, también sus piezas.

		Returns:
			La visualización encontrada.

		Raises:
			VisualizationNotFoundError: Si no hay ninguna visualización activa con ese identificador, o si el usuario no
				puede verla.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def add_visualization(self, session: Session, visualization: Visualization) -> Visualization:
		"""Añade una visualización sobre un modelo BIM. Su propietario es el usuario de la sesión.

		Args:
			session: Sesión del usuario que la crea.
			visualization: Visualización a añadir (sin `id`), con sus piezas si las lleva. Su `user_id` se sustituye por el
				del usuario de la sesión.

		Returns:
			La visualización guardada, con el `id` que le ha asignado el sistema (y el de cada pieza).

		Raises:
			VisualizationForbiddenError: Si el rol del usuario no permite crear visualizaciones.
			VisualizationValidationError: Si el nombre está vacío o es demasiado largo, o si alguna coordenada de una pieza
				no es un número finito.
			BIMModelNotFoundError: Si no hay ningún modelo BIM activo con el identificador indicado.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def update_visualization(
		self, session: Session, visualization_id: int, visualization: Visualization
	) -> Visualization:
		"""Modifica el nombre, la descripción, las observaciones, la visibilidad y las piezas de una visualización.

		Args:
			session: Sesión del usuario que la modifica.
			visualization_id: Identificador de la visualización a modificar.
			visualization: Visualización con los datos nuevos. Solo se usan su nombre, su descripción, sus observaciones,
				su visibilidad y sus piezas; su modelo BIM debe ser el que ya tiene, y el propietario no cambia. Si `pieces`
				es None, las piezas guardadas no se tocan; si no, sustituyen a todas las guardadas.

		Returns:
			La visualización ya modificada. Sus piezas son las enviadas (con su `id`), o None si no se enviaron.

		Raises:
			VisualizationValidationError: Si el nombre está vacío o es demasiado largo, si alguna coordenada de una pieza no
				es un número finito, o si se intenta cambiar el modelo BIM.
			VisualizationNotFoundError: Si no hay ninguna visualización activa con ese identificador, o si el usuario no
				puede verla.
			VisualizationForbiddenError: Si el usuario no es el propietario o su rol no permite modificar visualizaciones.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	@abstractmethod
	def delete_visualization(self, session: Session, visualization_id: int, force: bool) -> None:
		"""Elimina una visualización.

		Args:
			session: Sesión del usuario que la elimina.
			visualization_id: Identificador de la visualización.
			force: Si es False, el borrado es lógico (la visualización queda inactiva y se conservan sus datos). Si es
				True, se borran de verdad la visualización y sus piezas.

		Raises:
			VisualizationNotFoundError: Si no existe la visualización (con `force` False, tiene que estar activa), o si el
				usuario no puede verla.
			VisualizationForbiddenError: Si el usuario no es el propietario o su rol no permite borrar visualizaciones.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""

	# endregion PUBLIC METHODS
