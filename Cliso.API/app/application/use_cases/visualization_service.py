from math import isfinite;
from typing import ClassVar;

from app.application.exceptions import (
	VisualizationForbiddenError,
	VisualizationNotFoundError,
	VisualizationValidationError,
);
from app.application.ports.inbound import VisualizationServiceBase;
from app.application.ports.outbound import BIMModelRepositoryBase, VisualizationRepositoryBase;
from app.domain.models import BIMModelVisualizationMarkerPiece, Session, UserRole, Visualization, VisualizationPiece;


class VisualizationService(VisualizationServiceBase):
	"""Caso de uso de las visualizaciones: gestionar las visualizaciones que los usuarios hacen sobre un modelo BIM.

	Todas las operaciones se hacen en nombre del usuario de una sesión, y según su rol:

	- Ver: el administrador (`ADMIN`) ve todas; los demás, las públicas y las suyas. Una visualización que el usuario no
	  puede ver se trata como si no existiera (404), para no revelar que existe.
	- Crear, modificar y borrar: solo `ADMIN` y `OPERATOR`, y solo las suyas (también el administrador): una visualización
	  solo la modifica su propietario. El visor (`VIEWER`) no puede crear, modificar ni borrar.
	"""

	# region PRIVATE CONSTANTS

	_NAME_MAX_LENGTH: ClassVar[int] = 200;
	"""Longitud máxima del nombre de una visualización (la de la columna `name`)."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, repository: VisualizationRepositoryBase, bim_model_repository: BIMModelRepositoryBase) -> None:
		"""Crea el servicio.

		Args:
			repository: Acceso a los datos de las visualizaciones guardadas.
			bim_model_repository: Acceso a los modelos BIM, para comprobar que existe el de una visualización nueva.
		"""
		self._repository = repository;
		"""Acceso a los datos de las visualizaciones guardadas."""

		self._bim_model_repository = bim_model_repository;
		"""Acceso a los modelos BIM."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

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
		# TODO: paginar el listado. Con `depth` 1 se cargan en memoria las piezas de todas las visualizaciones visibles, y
		# con muchos datos el volumen (no el número de consultas) acabará siendo el problema.
		# El administrador ve todas (sin filtro); los demás, las públicas y las suyas.
		visible_to_user_id: int | None = session.user_id;
		if session.role == UserRole.ADMIN:
			visible_to_user_id = None;
		else:
			# Cualquier otro rol solo ve las públicas y las suyas.
			pass;
		return self._repository.get_all(bim_model_id, visible_to_user_id, depth);

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
		stored = self._repository.get_by_id(visualization_id, depth);
		self._check_visible(session, stored);
		return stored;

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
		if session.role == UserRole.VIEWER:
			raise VisualizationForbiddenError("Tu rol no permite crear visualizaciones");

		visualization.name = self._validate_name(visualization.name);
		self._validate_pieces(visualization.pieces);
		self._bim_model_repository.get_by_id(visualization.bim_model_id);
		visualization.user_id = session.user_id;
		return self._repository.add(visualization);

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
		name = self._validate_name(visualization.name);
		self._validate_pieces(visualization.pieces);
		stored = self._repository.get_by_id(visualization_id, 0);
		self._check_visible(session, stored);
		self._check_can_modify(session, stored);
		if visualization.bim_model_id != stored.bim_model_id:
			raise VisualizationValidationError(
				f"El modelo BIM de la visualización {visualization_id} no se puede cambiar"
			);

		stored.name = name;
		stored.description = visualization.description;
		stored.observations = visualization.observations;
		stored.is_public = visualization.is_public;
		stored.pieces = visualization.pieces;
		self._repository.update(stored);
		return stored;

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
		stored = self._repository.get_by_id(visualization_id, 0, include_inactive=force);
		self._check_visible(session, stored);
		self._check_can_modify(session, stored);
		if force:
			self._repository.delete(visualization_id);
		else:
			self._repository.deactivate(visualization_id);

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _check_visible(self, session: Session, visualization: Visualization) -> None:
		"""Comprueba que el usuario de la sesión puede ver la visualización: es el administrador, es pública o es suya.

		Args:
			session: Sesión del usuario.
			visualization: Visualización guardada.

		Raises:
			VisualizationNotFoundError: Si el usuario no puede verla (se responde como si no existiera).
		"""
		is_visible = session.role == UserRole.ADMIN or visualization.is_public or visualization.user_id == session.user_id;
		if not is_visible:
			raise VisualizationNotFoundError(f"No existe ninguna visualización con el identificador {visualization.id}");

	def _check_can_modify(self, session: Session, visualization: Visualization) -> None:
		"""Comprueba que el usuario de la sesión puede modificar o borrar la visualización: es suya y su rol lo permite.

		Args:
			session: Sesión del usuario.
			visualization: Visualización guardada que ya puede ver.

		Raises:
			VisualizationForbiddenError: Si el rol del usuario no lo permite o si no es el propietario.
		"""
		if session.role == UserRole.VIEWER:
			raise VisualizationForbiddenError("Tu rol no permite modificar visualizaciones");
		if visualization.user_id != session.user_id:
			raise VisualizationForbiddenError(
				f"Solo el propietario puede modificar la visualización {visualization.id}"
			);

	def _validate_pieces(self, pieces: list[VisualizationPiece] | None) -> None:
		"""Comprueba los datos de las piezas de una visualización: las coordenadas deben ser números finitos.

		Un `NaN` o un infinito no se pueden guardar en el JSON de la pieza ni mostrar en el modelo.

		Args:
			pieces: Piezas recibidas, o None si no se envían.

		Raises:
			VisualizationValidationError: Si alguna coordenada de una pieza no es un número finito.
		"""
		# TODO: limitar el número de piezas por visualización y el tamaño del cuerpo de la petición, cuando se defina el
		# máximo razonable: hoy el cliente puede enviar una lista de piezas sin tope.
		if pieces is not None:
			for number, piece in enumerate(pieces, start=1):
				if isinstance(piece, BIMModelVisualizationMarkerPiece):
					if not (isfinite(piece.x) and isfinite(piece.y) and isfinite(piece.z)):
						raise VisualizationValidationError(
							f"Las coordenadas de la pieza {number} deben ser números finitos (sin NaN ni infinito)"
						);
		else:
			# No se envían piezas: no hay nada que comprobar.
			pass;

	def _validate_name(self, name: str) -> str:
		"""Comprueba el nombre de una visualización.

		Args:
			name: Nombre recibido.

		Returns:
			El nombre sin espacios al principio ni al final.

		Raises:
			VisualizationValidationError: Si el nombre está vacío o supera la longitud máxima.
		"""
		clean_name = name.strip();
		if clean_name == "":
			raise VisualizationValidationError("El nombre de la visualización no puede estar vacío");
		if len(clean_name) > self._NAME_MAX_LENGTH:
			raise VisualizationValidationError(
				f"El nombre de la visualización no puede superar los {self._NAME_MAX_LENGTH} caracteres"
			);
		return clean_name;

	# endregion PRIVATE METHODS
