from datetime import datetime;
from typing import ClassVar;

import pymysql;

from app.adapters.outbound.persistence import DatabaseConnectionProviderBase, DatabaseError, DatabaseRowBase;
from app.application.exceptions import PersistenceError, UserAlreadyExistsError, UserNotFoundError;
from app.application.ports.outbound import UserRepositoryBase;
from app.domain.models import User, UserRole;


class MySQLUserRepository(UserRepositoryBase):
	"""Usuarios guardados en una base de datos MySQL."""

	# region PRIVATE CONSTANTS

	_ID: ClassVar[str] = "id";
	"""Columna `id` de la tabla `user`."""

	_NICK: ClassVar[str] = "nick";
	"""Columna `nick` de la tabla `user`."""

	_NAME: ClassVar[str] = "name";
	"""Columna `name` de la tabla `user`."""

	_SURNAME: ClassVar[str] = "surname";
	"""Columna `surname` de la tabla `user`."""

	_PASSWORD: ClassVar[str] = "password";
	"""Columna `password` de la tabla `user`."""

	_ROLE: ClassVar[str] = "role";
	"""Columna `role` de la tabla `user`."""

	_ACTIVE: ClassVar[str] = "active";
	"""Columna `active` de la tabla `user`."""

	_CREATION_DATE: ClassVar[str] = "creation_date";
	"""Columna `creation_date` de la tabla `user`."""

	_UPDATE_DATE: ClassVar[str] = "update_date";
	"""Columna `update_date` de la tabla `user`."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, database: DatabaseConnectionProviderBase) -> None:
		"""Crea el repositorio.

		Args:
			database: Quien entrega las conexiones a la base de datos en la que se guardan los usuarios.
		"""
		self._database = database;
		"""Quien entrega las conexiones a la base de datos."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_all(self) -> list[User]:
		"""Recupera todos los usuarios activos, ordenados por nick.

		Raises:
			PersistenceError: Si no se puede abrir la base de datos o falla la consulta.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudieron recuperar los usuarios: {error}") from error;

		# 2. Ejecutamos la consulta y convertimos las filas en usuarios. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"SELECT {self._ID}, {self._NICK}, {self._NAME}, {self._SURNAME}, {self._PASSWORD}, {self._ROLE}, "
				f"{self._ACTIVE}, {self._CREATION_DATE}, {self._UPDATE_DATE} "
				f"FROM user WHERE {self._ACTIVE} = TRUE ORDER BY {self._NICK}"
			);
			rows = cursor.fetchall();
			return [self._to_user(row) for row in rows];
		except (pymysql.MySQLError, ValueError) as error:
			raise PersistenceError(f"No se pudieron recuperar los usuarios: {error}") from error;
		finally:
			connection.close();

	def get_by_id(self, user_id: int, include_inactive: bool = False) -> User:
		"""Recupera el usuario con ese identificador.

		Raises:
			UserNotFoundError: Si no existe el usuario (activo, salvo que `include_inactive` sea True).
			PersistenceError: Si no se puede abrir la base de datos o falla la consulta.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo recuperar el usuario {user_id}: {error}") from error;

		# 2. Ejecutamos la consulta. La conexión se cierra siempre (finally).
		query = (
			f"SELECT {self._ID}, {self._NICK}, {self._NAME}, {self._SURNAME}, {self._PASSWORD}, {self._ROLE}, "
			f"{self._ACTIVE}, {self._CREATION_DATE}, {self._UPDATE_DATE} "
			f"FROM user WHERE {self._ID} = %s"
		);
		if not include_inactive:
			query += f" AND {self._ACTIVE} = TRUE";
		try:
			cursor = connection.cursor();
			cursor.execute(query, (user_id,));
			row: DatabaseRowBase | None = cursor.fetchone();
		except pymysql.MySQLError as error:
			raise PersistenceError(f"No se pudo recuperar el usuario {user_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no hay fila, el usuario no existe; si la hay, la convertimos en un usuario.
		if row is None:
			raise UserNotFoundError(f"No existe ningún usuario con el identificador {user_id}");
		try:
			return self._to_user(row);
		except ValueError as error:
			raise PersistenceError(f"Datos no válidos del usuario {user_id}: {error}") from error;

	def get_by_nick(self, nick: str) -> User:
		"""Recupera el usuario activo con ese nick.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese nick.
			PersistenceError: Si no se puede abrir la base de datos o falla la consulta.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo recuperar el usuario '{nick}': {error}") from error;

		# 2. Ejecutamos la consulta. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"SELECT {self._ID}, {self._NICK}, {self._NAME}, {self._SURNAME}, {self._PASSWORD}, {self._ROLE}, "
				f"{self._ACTIVE}, {self._CREATION_DATE}, {self._UPDATE_DATE} "
				f"FROM user WHERE {self._NICK} = %s AND {self._ACTIVE} = TRUE",
				(nick,),
			);
			row: DatabaseRowBase | None = cursor.fetchone();
		except pymysql.MySQLError as error:
			raise PersistenceError(f"No se pudo recuperar el usuario '{nick}': {error}") from error;
		finally:
			connection.close();

		# 3. Si no hay fila, el usuario no existe; si la hay, la convertimos en un usuario.
		if row is None:
			raise UserNotFoundError(f"No existe ningún usuario activo con el nick '{nick}'");
		try:
			return self._to_user(row);
		except ValueError as error:
			raise PersistenceError(f"Datos no válidos del usuario '{nick}': {error}") from error;

	def add(self, user: User) -> User:
		"""Guarda un usuario nuevo y le asigna el `id` que da la base de datos.

		Raises:
			UserAlreadyExistsError: Si ya hay otro usuario con ese nick.
			PersistenceError: Si no se puede abrir la base de datos o falla la inserción.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo guardar el usuario '{user.nick}': {error}") from error;

		# 2. Insertamos la fila y confirmamos. Si falla, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"INSERT INTO user ({self._NICK}, {self._NAME}, {self._SURNAME}, {self._PASSWORD}, {self._ROLE}, "
				f"{self._ACTIVE}, {self._CREATION_DATE}) VALUES (%s, %s, %s, %s, %s, %s, %s)",
				(user.nick, user.name, user.surname, user.password, user.role.value, user.active, user.creation_date),
			);
			new_id = cursor.lastrowid;
			connection.commit();
		except pymysql.IntegrityError as error:
			connection.rollback();
			raise UserAlreadyExistsError(f"Ya existe un usuario con el nick '{user.nick}'") from error;
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo guardar el usuario '{user.nick}': {error}") from error;
		finally:
			connection.close();

		# 3. La base de datos siempre devuelve el id de una inserción correcta.
		if new_id is None:
			raise PersistenceError(f"No se obtuvo el identificador del usuario '{user.nick}'");
		user.id = new_id;
		return user;

	def update(self, user: User) -> None:
		"""Guarda los cambios de nombre, apellidos, contraseña y rol de un usuario activo. El nick no se cambia nunca.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese `id`.
			PersistenceError: Si no se puede abrir la base de datos o falla la modificación.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo modificar el usuario {user.id}: {error}") from error;

		# 2. Modificamos la fila (anotando la fecha de modificación) y confirmamos. Si falla, deshacemos. La conexión se
		#    cierra siempre (finally).
		update_date = datetime.now();
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"UPDATE user SET {self._NAME} = %s, {self._SURNAME} = %s, {self._PASSWORD} = %s, {self._ROLE} = %s, "
				f"{self._UPDATE_DATE} = %s WHERE {self._ID} = %s AND {self._ACTIVE} = TRUE",
				(user.name, user.surname, user.password, user.role.value, update_date, user.id),
			);
			modified_rows = cursor.rowcount;
			connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo modificar el usuario {user.id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha modificado ninguna fila, el usuario no existe.
		if modified_rows == 0:
			raise UserNotFoundError(f"No existe ningún usuario activo con el identificador {user.id}");
		user.update_date = update_date;

	def deactivate(self, user_id: int) -> None:
		"""Borra lógicamente un usuario: lo deja inactivo y conserva todos sus datos.

		Raises:
			UserNotFoundError: Si no hay ningún usuario activo con ese identificador.
			PersistenceError: Si no se puede abrir la base de datos o falla la modificación.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo borrar el usuario {user_id}: {error}") from error;

		# 2. Marcamos la fila como inactiva y confirmamos. Si falla, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"UPDATE user SET {self._ACTIVE} = FALSE, {self._UPDATE_DATE} = %s WHERE {self._ID} = %s AND {self._ACTIVE} = TRUE",
				(datetime.now(), user_id),
			);
			modified_rows = cursor.rowcount;
			connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo borrar el usuario {user_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha modificado ninguna fila, el usuario no existe.
		if modified_rows == 0:
			raise UserNotFoundError(f"No existe ningún usuario activo con el identificador {user_id}");

	def delete(self, user_id: int) -> None:
		"""Borra de verdad un usuario, activo o no, junto con sus visualizaciones.

		Raises:
			UserNotFoundError: Si no existe el usuario.
			PersistenceError: Si no se puede abrir la base de datos o falla el borrado.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo eliminar el usuario {user_id}: {error}") from error;

		# 2. Borramos primero las visualizaciones (que apuntan al usuario) y luego el usuario, todo en una transacción.
		#    Si falla algo, deshacemos. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute("DELETE FROM visualization WHERE user_id = %s", (user_id,));
			cursor.execute(f"DELETE FROM user WHERE {self._ID} = %s", (user_id,));
			deleted_rows = cursor.rowcount;
			if deleted_rows == 0:
				connection.rollback();
			else:
				connection.commit();
		except pymysql.MySQLError as error:
			connection.rollback();
			raise PersistenceError(f"No se pudo eliminar el usuario {user_id}: {error}") from error;
		finally:
			connection.close();

		# 3. Si no se ha borrado ninguna fila, el usuario no existe.
		if deleted_rows == 0:
			raise UserNotFoundError(f"No existe ningún usuario con el identificador {user_id}");

	# endregion PUBLIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _to_user(row: DatabaseRowBase) -> User:
		"""Convierte una fila de la tabla `user` en un usuario de dominio.

		Args:
			row: Fila de la tabla `user`, que se lee por nombre de columna.

		Returns:
			El usuario de dominio.

		Raises:
			ValueError: Si el rol no tiene un valor válido.
		"""
		return User(
			id=row[MySQLUserRepository._ID],
			nick=row[MySQLUserRepository._NICK],
			name=row[MySQLUserRepository._NAME],
			surname=row[MySQLUserRepository._SURNAME],
			password=row[MySQLUserRepository._PASSWORD],
			role=UserRole(row[MySQLUserRepository._ROLE]),
			active=bool(row[MySQLUserRepository._ACTIVE]),
			creation_date=row[MySQLUserRepository._CREATION_DATE],
			update_date=row[MySQLUserRepository._UPDATE_DATE],
		);

	# endregion PRIVATE STATIC METHODS
