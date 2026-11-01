from datetime import datetime;
from typing import ClassVar;

import pymysql;

from app.adapters.outbound.persistence import DatabaseConnectionProviderBase, DatabaseError, DatabaseRowBase;
from app.application.exceptions import BIMModelNotFoundError, PersistenceError;
from app.application.ports.outbound import BIMModelRepositoryBase;
from app.domain.models import BIMModel;


class MySQLBIMModelRepository(BIMModelRepositoryBase):
	"""Modelos BIM guardados en una base de datos MySQL."""

	# region PRIVATE CONSTANTS

	_ID: ClassVar[str] = "id";
	"""Columna `id` de la tabla `bim_model`."""

	_NAME: ClassVar[str] = "name";
	"""Columna `name` de la tabla `bim_model`."""

	_DESCRIPTION: ClassVar[str] = "description";
	"""Columna `description` de la tabla `bim_model`."""

	_OBSERVATIONS: ClassVar[str] = "observations";
	"""Columna `observations` de la tabla `bim_model`."""

	_FILE_NAME: ClassVar[str] = "file_name";
	"""Columna `file_name` de la tabla `bim_model`."""

	_STORED_FILE_NAME: ClassVar[str] = "stored_file_name";
	"""Columna `stored_file_name` de la tabla `bim_model`."""

	_ACTIVE: ClassVar[str] = "active";
	"""Columna `active` de la tabla `bim_model`."""

	_CREATION_DATE: ClassVar[str] = "creation_date";
	"""Columna `creation_date` de la tabla `bim_model`."""

	_UPDATE_DATE: ClassVar[str] = "update_date";
	"""Columna `update_date` de la tabla `bim_model`."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, database: DatabaseConnectionProviderBase) -> None:
		"""Crea el repositorio.

		Args:
			database: Quien entrega las conexiones a la base de datos en la que se guardan los modelos.
		"""
		self._database = database;
		"""Quien entrega las conexiones a la base de datos."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_all(self) -> list[BIMModel]:
		"""Recupera todos los modelos BIM activos, ordenados por nombre.

		Raises:
			PersistenceError: Si no se puede abrir la base de datos o falla la consulta.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudieron recuperar los modelos BIM: {error}") from error;

		# 2. Ejecutamos la consulta y convertimos las filas en modelos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"SELECT {self._ID}, {self._NAME}, {self._DESCRIPTION}, {self._OBSERVATIONS}, {self._FILE_NAME}, "
				f"{self._STORED_FILE_NAME}, {self._ACTIVE}, {self._CREATION_DATE}, {self._UPDATE_DATE} "
				f"FROM bim_model WHERE {self._ACTIVE} = TRUE ORDER BY {self._NAME}"
			);
			rows = cursor.fetchall();
			return [self._to_bim_model(row) for row in rows];
		except pymysql.MySQLError as error:
			raise PersistenceError(f"No se pudieron recuperar los modelos BIM: {error}") from error;
		finally:
			connection.close();

	def get_by_id(self, model_id: int, include_inactive: bool = False) -> BIMModel:
		"""Recupera el modelo BIM con ese identificador.

		Raises:
			BIMModelNotFoundError: Si no existe el modelo (activo, salvo que `include_inactive` sea True).
			PersistenceError: Si no se puede abrir la base de datos o falla la consulta.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo recuperar el modelo BIM {model_id}: {error}") from error;

		# 2. Ejecutamos la consulta. La conexión se cierra siempre (finally).
		query = (
			f"SELECT {self._ID}, {self._NAME}, {self._DESCRIPTION}, {self._OBSERVATIONS}, {self._FILE_NAME}, "
				f"{self._STORED_FILE_NAME}, {self._ACTIVE}, {self._CREATION_DATE}, {self._UPDATE_DATE} "
			f"FROM bim_model WHERE {self._ID} = %s"
		);
		if not include_inactive:
			query += f" AND {self._ACTIVE} = TRUE";
		try:
			cursor = connection.cursor();
			cursor.execute(query, (model_id,));
			row: DatabaseRowBase | None = cursor.fetchone();
		except pymysql.MySQLError as error:
			raise PersistenceError(f"No se pudo recuperar el modelo BIM {model_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no hay fila, el modelo no existe; si la hay, la convertimos en un modelo.
		if row is None:
			raise BIMModelNotFoundError(f"No existe ningún modelo BIM con el identificador {model_id}");
		return self._to_bim_model(row);

	def add(self, model: BIMModel) -> BIMModel:
		"""Guarda un modelo BIM nuevo y le asigna el `id` que da la base de datos.

		Raises:
			PersistenceError: Si no se puede abrir la base de datos o falla la inserción.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo guardar el modelo BIM '{model.name}': {error}") from error;

		# 2. Insertamos la fila y confirmamos. Si falla, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"INSERT INTO bim_model ({self._NAME}, {self._DESCRIPTION}, {self._OBSERVATIONS}, {self._FILE_NAME}, "
				f"{self._STORED_FILE_NAME}, {self._ACTIVE}, {self._CREATION_DATE}) VALUES (%s, %s, %s, %s, %s, %s, %s)",
				(
					model.name,
					model.description,
					model.observations,
					model.file_name,
					model.stored_file_name,
					model.active,
					model.creation_date,
				),
			);
			new_id = cursor.lastrowid;
			connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo guardar el modelo BIM '{model.name}': {error}") from error;
		finally:
			connection.close();

		# 3. La base de datos siempre devuelve el id de una inserción correcta.
		if new_id is None:
			raise PersistenceError(f"No se obtuvo el identificador del modelo BIM '{model.name}'");
		model.id = new_id;
		return model;

	def update(self, model: BIMModel) -> None:
		"""Guarda los cambios de nombre, descripción, observaciones y nombre de fichero de un modelo BIM activo.

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese `id`.
			PersistenceError: Si no se puede abrir la base de datos o falla la modificación.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo modificar el modelo BIM {model.id}: {error}") from error;

		# 2. Modificamos la fila (anotando la fecha de modificación) y confirmamos. Si falla, deshacemos. La conexión se
		#    cierra siempre (finally).
		update_date = datetime.now();
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"UPDATE bim_model SET {self._NAME} = %s, {self._DESCRIPTION} = %s, {self._OBSERVATIONS} = %s, "
				f"{self._FILE_NAME} = %s, {self._UPDATE_DATE} = %s WHERE {self._ID} = %s AND {self._ACTIVE} = TRUE",
				(model.name, model.description, model.observations, model.file_name, update_date, model.id),
			);
			modified_rows = cursor.rowcount;
			connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo modificar el modelo BIM {model.id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha modificado ninguna fila, el modelo no existe.
		if modified_rows == 0:
			raise BIMModelNotFoundError(f"No existe ningún modelo BIM activo con el identificador {model.id}");
		model.update_date = update_date;

	def deactivate(self, model_id: int) -> None:
		"""Borra lógicamente un modelo BIM: lo deja inactivo y conserva todos sus datos.

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			PersistenceError: Si no se puede abrir la base de datos o falla la modificación.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo borrar el modelo BIM {model_id}: {error}") from error;

		# 2. Marcamos la fila como inactiva y confirmamos. Si falla, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"UPDATE bim_model SET {self._ACTIVE} = FALSE, {self._UPDATE_DATE} = %s WHERE {self._ID} = %s AND {self._ACTIVE} = TRUE",
				(datetime.now(), model_id),
			);
			modified_rows = cursor.rowcount;
			connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo borrar el modelo BIM {model_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha modificado ninguna fila, el modelo no existe.
		if modified_rows == 0:
			raise BIMModelNotFoundError(f"No existe ningún modelo BIM activo con el identificador {model_id}");

	def delete(self, model_id: int) -> None:
		"""Borra de verdad un modelo BIM, activo o no, junto con sus visualizaciones.

		Raises:
			BIMModelNotFoundError: Si no existe el modelo.
			PersistenceError: Si no se puede abrir la base de datos o falla el borrado.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo eliminar el modelo BIM {model_id}: {error}") from error;

		# 2. Borramos primero las visualizaciones (que apuntan al modelo) y luego el modelo, todo en una transacción.
		#    Si falla algo, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute("DELETE FROM visualization WHERE bim_model_id = %s", (model_id,));
			cursor.execute(f"DELETE FROM bim_model WHERE {self._ID} = %s", (model_id,));
			deleted_rows = cursor.rowcount;
			if deleted_rows == 0:
				connection.rollback();
			else:
				connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo eliminar el modelo BIM {model_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha borrado ninguna fila, el modelo no existe.
		if deleted_rows == 0:
			raise BIMModelNotFoundError(f"No existe ningún modelo BIM con el identificador {model_id}");

	# endregion PUBLIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _to_bim_model(row: DatabaseRowBase) -> BIMModel:
		"""Convierte una fila de la tabla `bim_model` en un modelo BIM de dominio.

		Args:
			row: Fila de la tabla `bim_model`, que se lee por nombre de columna.

		Returns:
			El modelo BIM de dominio.
		"""
		return BIMModel(
			id=row[MySQLBIMModelRepository._ID],
			name=row[MySQLBIMModelRepository._NAME],
			description=row[MySQLBIMModelRepository._DESCRIPTION],
			observations=row[MySQLBIMModelRepository._OBSERVATIONS],
			file_name=row[MySQLBIMModelRepository._FILE_NAME],
			stored_file_name=row[MySQLBIMModelRepository._STORED_FILE_NAME],
			active=bool(row[MySQLBIMModelRepository._ACTIVE]),
			creation_date=row[MySQLBIMModelRepository._CREATION_DATE],
			update_date=row[MySQLBIMModelRepository._UPDATE_DATE],
		);

	# endregion PRIVATE STATIC METHODS
