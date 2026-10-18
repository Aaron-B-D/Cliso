from typing import ClassVar;

import pymysql;

from app.adapters.outbound.persistence import DatabaseConnectionProviderBase, DatabaseError, DatabaseRowBase;
from app.application.exceptions import PersistenceError, UserNotFoundError;
from app.application.ports.outbound import UserRepositoryBase;
from app.domain.models import User;


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

	_ACTIVE: ClassVar[str] = "active";
	"""Columna `active` de la tabla `user`."""

	_CREATION_DATE: ClassVar[str] = "creation_date";
	"""Columna `creation_date` de la tabla `user`."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, database: DatabaseConnectionProviderBase) -> None:
		"""Crea el repositorio.

		Args:
			database: Quien entrega las conexiones a la base de datos de la que se leen los usuarios.
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
				f"SELECT {self._ID}, {self._NICK}, {self._NAME}, {self._SURNAME}, {self._PASSWORD}, {self._ACTIVE}, {self._CREATION_DATE} "
				f"FROM user WHERE {self._ACTIVE} = TRUE ORDER BY {self._NICK}"
			);
			rows = cursor.fetchall();
			return [self._to_user(row) for row in rows];
		except pymysql.MySQLError as error:
			raise PersistenceError(f"No se pudieron recuperar los usuarios: {error}") from error;
		finally:
			connection.close();

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
				f"SELECT {self._ID}, {self._NICK}, {self._NAME}, {self._SURNAME}, {self._PASSWORD}, {self._ACTIVE}, {self._CREATION_DATE} "
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
		return self._to_user(row);

	# endregion PUBLIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _to_user(row: DatabaseRowBase) -> User:
		"""Convierte una fila de la tabla `user` en un usuario de dominio.

		Args:
			row: Fila de la tabla `user`, que se lee por nombre de columna.

		Returns:
			El usuario de dominio.
		"""
		return User(
			id=row[MySQLUserRepository._ID],
			nick=row[MySQLUserRepository._NICK],
			name=row[MySQLUserRepository._NAME],
			surname=row[MySQLUserRepository._SURNAME],
			password=row[MySQLUserRepository._PASSWORD],
			active=bool(row[MySQLUserRepository._ACTIVE]),
			creation_date=row[MySQLUserRepository._CREATION_DATE],
		);

	# endregion PRIVATE STATIC METHODS
