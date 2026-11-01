from datetime import datetime;
from typing import ClassVar;

import pymysql;

from app.adapters.outbound.persistence import (
	DatabaseConnectionProviderBase,
	DatabaseCursorBase,
	DatabaseError,
	DatabaseRowBase,
	VisualizationPieceContentMapper,
);
from app.application.exceptions import PersistenceError, VisualizationNotFoundError;
from app.application.ports.outbound import VisualizationRepositoryBase;
from app.domain.models import Visualization, VisualizationPiece;


class MySQLVisualizationRepository(VisualizationRepositoryBase):
	"""Visualizaciones guardadas en una base de datos MySQL."""

	# region PRIVATE CONSTANTS

	_ID: ClassVar[str] = "id";
	"""Columna `id` de la tabla `visualization`."""

	_USER_ID: ClassVar[str] = "user_id";
	"""Columna `user_id` de la tabla `visualization`."""

	_BIM_MODEL_ID: ClassVar[str] = "bim_model_id";
	"""Columna `bim_model_id` de la tabla `visualization`."""

	_NAME: ClassVar[str] = "name";
	"""Columna `name` de la tabla `visualization`."""

	_DESCRIPTION: ClassVar[str] = "description";
	"""Columna `description` de la tabla `visualization`."""

	_OBSERVATIONS: ClassVar[str] = "observations";
	"""Columna `observations` de la tabla `visualization`."""

	_IS_PUBLIC: ClassVar[str] = "is_public";
	"""Columna `is_public` de la tabla `visualization`."""

	_ACTIVE: ClassVar[str] = "active";
	"""Columna `active` de la tabla `visualization`."""

	_CREATION_DATE: ClassVar[str] = "creation_date";
	"""Columna `creation_date` de la tabla `visualization`."""

	_UPDATE_DATE: ClassVar[str] = "update_date";
	"""Columna `update_date` de la tabla `visualization`."""

	_PIECE_ID: ClassVar[str] = "id";
	"""Columna `id` de la tabla `visualization_piece`."""

	_PIECE_VISUALIZATION_ID: ClassVar[str] = "visualization_id";
	"""Columna `visualization_id` de la tabla `visualization_piece`."""

	_PIECE_CONTENT: ClassVar[str] = "content";
	"""Columna `content` de la tabla `visualization_piece`, con la pieza en JSON."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, database: DatabaseConnectionProviderBase) -> None:
		"""Crea el repositorio.

		Args:
			database: Quien entrega las conexiones a la base de datos en la que se guardan las visualizaciones.
		"""
		self._database = database;
		"""Quien entrega las conexiones a la base de datos."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_all(self, bim_model_id: int | None, visible_to_user_id: int | None, depth: int) -> list[Visualization]:
		"""Recupera las visualizaciones activas, todas o solo las de un modelo BIM, ordenadas por nombre.

		Con `visible_to_user_id`, solo las públicas y las de ese usuario. Con `depth` 1 o más, cada una lleva también sus
		piezas.

		Raises:
			PersistenceError: Si no se puede abrir la base de datos o falla la consulta.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudieron recuperar las visualizaciones: {error}") from error;

		# 2. Ejecutamos la consulta (filtrando por modelo solo si se ha indicado) y convertimos las filas en
		#    visualizaciones. La conexión se cierra siempre (finally).
		query = (
			f"SELECT {self._ID}, {self._USER_ID}, {self._BIM_MODEL_ID}, {self._NAME}, {self._DESCRIPTION}, "
			f"{self._OBSERVATIONS}, {self._IS_PUBLIC}, {self._ACTIVE}, {self._CREATION_DATE}, {self._UPDATE_DATE} "
			f"FROM visualization WHERE {self._ACTIVE} = TRUE"
		);
		parameters: tuple[int, ...] = ();
		if bim_model_id is not None:
			query += f" AND {self._BIM_MODEL_ID} = %s";
			parameters = parameters + (bim_model_id,);
		if visible_to_user_id is not None:
			query += f" AND ({self._IS_PUBLIC} = TRUE OR {self._USER_ID} = %s)";
			parameters = parameters + (visible_to_user_id,);
		query += f" ORDER BY {self._NAME}";
		try:
			cursor = connection.cursor();
			cursor.execute(query, parameters);
			rows = cursor.fetchall();
			visualizations = [self._to_visualization(row) for row in rows];
			if depth >= 1:
				pieces_by_visualization = self._get_all_pieces(cursor, bim_model_id, visible_to_user_id);
				for visualization in visualizations:
					if visualization.id is not None:
						visualization.pieces = pieces_by_visualization.get(visualization.id, []);
			return visualizations;
		except (pymysql.MySQLError, ValueError) as error:
			raise PersistenceError(f"No se pudieron recuperar las visualizaciones: {error}") from error;
		finally:
			connection.close();

	def get_by_id(self, visualization_id: int, depth: int, include_inactive: bool = False) -> Visualization:
		"""Recupera la visualización con ese identificador. Con `depth` 1 o más, lleva también sus piezas.

		Raises:
			VisualizationNotFoundError: Si no existe la visualización (activa, salvo que `include_inactive` sea True).
			PersistenceError: Si no se puede abrir la base de datos o falla la consulta.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo recuperar la visualización {visualization_id}: {error}") from error;

		# 2. Ejecutamos la consulta. La conexión se cierra siempre (finally).
		query = (
			f"SELECT {self._ID}, {self._USER_ID}, {self._BIM_MODEL_ID}, {self._NAME}, {self._DESCRIPTION}, "
			f"{self._OBSERVATIONS}, {self._IS_PUBLIC}, {self._ACTIVE}, {self._CREATION_DATE}, {self._UPDATE_DATE} "
			f"FROM visualization WHERE {self._ID} = %s"
		);
		if not include_inactive:
			query += f" AND {self._ACTIVE} = TRUE";
		visualization: Visualization | None = None;
		try:
			cursor = connection.cursor();
			cursor.execute(query, (visualization_id,));
			row: DatabaseRowBase | None = cursor.fetchone();
			if row is not None:
				visualization = self._to_visualization(row);
				if depth >= 1:
					visualization.pieces = self._get_pieces(cursor, visualization_id);
		except (pymysql.MySQLError, ValueError) as error:
			raise PersistenceError(f"No se pudo recuperar la visualización {visualization_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no hay visualización, no existe.
		if visualization is None:
			raise VisualizationNotFoundError(f"No existe ninguna visualización con el identificador {visualization_id}");
		return visualization;

	def add(self, visualization: Visualization) -> Visualization:
		"""Guarda una visualización nueva y le asigna el `id` que da la base de datos, igual que a cada una de sus piezas.

		La visualización y sus piezas se guardan en una sola transacción.

		Raises:
			PersistenceError: Si no se puede abrir la base de datos o falla la inserción.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo guardar la visualización '{visualization.name}': {error}") from error;

		# 2. Insertamos la fila y confirmamos. Si falla, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"INSERT INTO visualization ({self._USER_ID}, {self._BIM_MODEL_ID}, {self._NAME}, {self._DESCRIPTION}, "
				f"{self._OBSERVATIONS}, {self._IS_PUBLIC}, {self._ACTIVE}, {self._CREATION_DATE}) "
				f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
				(
					visualization.user_id,
					visualization.bim_model_id,
					visualization.name,
					visualization.description,
					visualization.observations,
					visualization.is_public,
					visualization.active,
					visualization.creation_date,
				),
			);
			new_id = cursor.lastrowid;
			if new_id is None:
				# La base de datos siempre devuelve el id de una inserción correcta.
				raise PersistenceError(f"No se obtuvo el identificador de la visualización '{visualization.name}'");
			if visualization.pieces is not None:
				self._insert_pieces(cursor, new_id, visualization.pieces);
			connection.commit();
		except (pymysql.MySQLError, ValueError) as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo guardar la visualización '{visualization.name}': {error}") from error;
		finally:
			connection.close();

		# 3. Anotamos el id en la visualización.
		visualization.id = new_id;
		return visualization;

	def update(self, visualization: Visualization) -> None:
		"""Guarda los cambios de nombre, descripción, observaciones y visibilidad de una visualización activa.

		Si `pieces` no es None, sustituye todas sus piezas por esas, en la misma transacción.

		Raises:
			VisualizationNotFoundError: Si no hay ninguna visualización activa con ese `id`.
			PersistenceError: Si no se puede abrir la base de datos o falla la modificación.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo modificar la visualización {visualization.id}: {error}") from error;

		# 2. Modificamos la fila (anotando la fecha de modificación) y confirmamos. Si falla, deshacemos. La conexión se
		#    cierra siempre (finally).
		update_date = datetime.now();
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"UPDATE visualization SET {self._NAME} = %s, {self._DESCRIPTION} = %s, {self._OBSERVATIONS} = %s, "
				f"{self._IS_PUBLIC} = %s, {self._UPDATE_DATE} = %s WHERE {self._ID} = %s AND {self._ACTIVE} = TRUE",
				(
					visualization.name,
					visualization.description,
					visualization.observations,
					visualization.is_public,
					update_date,
					visualization.id,
				),
			);
			modified_rows = cursor.rowcount;
			if modified_rows > 0 and visualization.id is not None and visualization.pieces is not None:
				cursor.execute("DELETE FROM visualization_piece WHERE visualization_id = %s", (visualization.id,));
				self._insert_pieces(cursor, visualization.id, visualization.pieces);
			connection.commit();
		except (pymysql.MySQLError, ValueError) as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo modificar la visualización {visualization.id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha modificado ninguna fila, la visualización no existe.
		if modified_rows == 0:
			raise VisualizationNotFoundError(
				f"No existe ninguna visualización activa con el identificador {visualization.id}"
			);
		visualization.update_date = update_date;

	def deactivate(self, visualization_id: int) -> None:
		"""Borra lógicamente una visualización: la deja inactiva y conserva todos sus datos.

		Raises:
			VisualizationNotFoundError: Si no hay ninguna visualización activa con ese identificador.
			PersistenceError: Si no se puede abrir la base de datos o falla la modificación.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo borrar la visualización {visualization_id}: {error}") from error;

		# 2. Marcamos la fila como inactiva y confirmamos. Si falla, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"UPDATE visualization SET {self._ACTIVE} = FALSE, {self._UPDATE_DATE} = %s WHERE {self._ID} = %s AND {self._ACTIVE} = TRUE",
				(datetime.now(), visualization_id),
			);
			modified_rows = cursor.rowcount;
			connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo borrar la visualización {visualization_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha modificado ninguna fila, la visualización no existe.
		if modified_rows == 0:
			raise VisualizationNotFoundError(
				f"No existe ninguna visualización activa con el identificador {visualization_id}"
			);

	def delete(self, visualization_id: int) -> None:
		"""Borra de verdad una visualización, activa o no, junto con sus piezas (que se borran en cascada).

		Raises:
			VisualizationNotFoundError: Si no existe la visualización.
			PersistenceError: Si no se puede abrir la base de datos o falla el borrado.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo eliminar la visualización {visualization_id}: {error}") from error;

		# 2. Borramos la fila (sus piezas caen en cascada) y confirmamos. Si falla, deshacemos. La conexión se cierra
		#    siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(f"DELETE FROM visualization WHERE {self._ID} = %s", (visualization_id,));
			deleted_rows = cursor.rowcount;
			connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo eliminar la visualización {visualization_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha borrado ninguna fila, la visualización no existe.
		if deleted_rows == 0:
			raise VisualizationNotFoundError(f"No existe ninguna visualización con el identificador {visualization_id}");

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _get_pieces(self, cursor: DatabaseCursorBase, visualization_id: int) -> list[VisualizationPiece]:
		"""Lee las piezas de una visualización, por orden de añadido (el de su `id`).

		Args:
			cursor: Cursor de una conexión abierta, con la que se ejecuta la consulta.
			visualization_id: Identificador de la visualización.

		Returns:
			Las piezas de la visualización (la lista queda vacía si no tiene ninguna).

		Raises:
			pymysql.MySQLError: Si falla la consulta.
			ValueError: Si el contenido de alguna pieza no es válido.
		"""
		cursor.execute(
			f"SELECT {self._PIECE_ID}, {self._PIECE_CONTENT} FROM visualization_piece "
			f"WHERE {self._PIECE_VISUALIZATION_ID} = %s ORDER BY {self._PIECE_ID}",
			(visualization_id,),
		);
		rows = cursor.fetchall();
		return [VisualizationPieceContentMapper.to_piece(row[self._PIECE_ID], row[self._PIECE_CONTENT]) for row in rows];

	def _get_all_pieces(
		self, cursor: DatabaseCursorBase, bim_model_id: int | None, visible_to_user_id: int | None
	) -> dict[int, list[VisualizationPiece]]:
		"""Lee, con una sola consulta, las piezas de todas las visualizaciones activas (o solo las de un modelo BIM).

		Es el mismo filtro que el de `get_all`, así que las piezas leídas son exactamente las de las visualizaciones
		recuperadas, y el número de consultas no crece con el de visualizaciones.

		Args:
			cursor: Cursor de una conexión abierta, con la que se ejecuta la consulta.
			bim_model_id: Identificador del modelo BIM del que se leen las piezas, o None para todos.
			visible_to_user_id: Identificador del usuario que las va a ver (solo las visualizaciones públicas y las suyas), o
				None para las de todas.

		Returns:
			Las piezas de cada visualización, por orden de añadido (el de su `id`), indexadas por el identificador de
			la visualización. No aparecen las visualizaciones sin piezas.

		Raises:
			pymysql.MySQLError: Si falla la consulta.
			ValueError: Si el contenido de alguna pieza no es válido.
		"""
		query = (
			f"SELECT p.{self._PIECE_ID}, p.{self._PIECE_VISUALIZATION_ID}, p.{self._PIECE_CONTENT} "
			f"FROM visualization_piece p INNER JOIN visualization v ON v.{self._ID} = p.{self._PIECE_VISUALIZATION_ID} "
			f"WHERE v.{self._ACTIVE} = TRUE"
		);
		parameters: tuple[int, ...] = ();
		if bim_model_id is not None:
			query += f" AND v.{self._BIM_MODEL_ID} = %s";
			parameters = parameters + (bim_model_id,);
		if visible_to_user_id is not None:
			query += f" AND (v.{self._IS_PUBLIC} = TRUE OR v.{self._USER_ID} = %s)";
			parameters = parameters + (visible_to_user_id,);
		query += f" ORDER BY p.{self._PIECE_VISUALIZATION_ID}, p.{self._PIECE_ID}";

		cursor.execute(query, parameters);
		pieces_by_visualization: dict[int, list[VisualizationPiece]] = {};
		for row in cursor.fetchall():
			visualization_id: int = row[self._PIECE_VISUALIZATION_ID];
			piece = VisualizationPieceContentMapper.to_piece(row[self._PIECE_ID], row[self._PIECE_CONTENT]);
			if visualization_id not in pieces_by_visualization:
				pieces_by_visualization[visualization_id] = [];
			pieces_by_visualization[visualization_id].append(piece);
		return pieces_by_visualization;

	def _insert_pieces(self, cursor: DatabaseCursorBase, visualization_id: int, pieces: list[VisualizationPiece]) -> None:
		"""Inserta las piezas de una visualización, en orden, y anota en cada una el `id` que le da la base de datos.

		No confirma la transacción: lo hace quien la abrió.

		Args:
			cursor: Cursor de una conexión abierta, con la que se ejecutan las inserciones.
			visualization_id: Identificador de la visualización a la que pertenecen.
			pieces: Piezas a insertar.

		Raises:
			pymysql.MySQLError: Si falla alguna inserción.
			ValueError: Si el tipo de alguna pieza no está soportado.
			PersistenceError: Si la base de datos no devuelve el identificador de una pieza insertada.
		"""
		for piece in pieces:
			cursor.execute(
				f"INSERT INTO visualization_piece ({self._PIECE_VISUALIZATION_ID}, {self._PIECE_CONTENT}) VALUES (%s, %s)",
				(visualization_id, VisualizationPieceContentMapper.to_content(piece)),
			);
			piece_id = cursor.lastrowid;
			if piece_id is None:
				raise PersistenceError(f"No se obtuvo el identificador de una pieza de la visualización {visualization_id}");
			piece.id = piece_id;

	# endregion PRIVATE METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _to_visualization(row: DatabaseRowBase) -> Visualization:
		"""Convierte una fila de la tabla `visualization` en una visualización de dominio.

		Args:
			row: Fila de la tabla `visualization`, que se lee por nombre de columna.

		Returns:
			La visualización de dominio.
		"""
		return Visualization(
			id=row[MySQLVisualizationRepository._ID],
			user_id=row[MySQLVisualizationRepository._USER_ID],
			bim_model_id=row[MySQLVisualizationRepository._BIM_MODEL_ID],
			name=row[MySQLVisualizationRepository._NAME],
			description=row[MySQLVisualizationRepository._DESCRIPTION],
			observations=row[MySQLVisualizationRepository._OBSERVATIONS],
			is_public=bool(row[MySQLVisualizationRepository._IS_PUBLIC]),
			active=bool(row[MySQLVisualizationRepository._ACTIVE]),
			creation_date=row[MySQLVisualizationRepository._CREATION_DATE],
			update_date=row[MySQLVisualizationRepository._UPDATE_DATE],
		);

	# endregion PRIVATE STATIC METHODS
