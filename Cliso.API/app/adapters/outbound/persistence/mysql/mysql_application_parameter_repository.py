from typing import ClassVar;

import pymysql;

from app.adapters.outbound.persistence import DatabaseConnectionProviderBase, DatabaseError, DatabaseRowBase;
from app.application.exceptions import ApplicationParameterNotFoundError, PersistenceError;
from app.application.ports.outbound import ApplicationParameterRepositoryBase;
from app.domain.models import ApplicationParameter, ApplicationParameterType;


class MySQLApplicationParameterRepository(ApplicationParameterRepositoryBase):
	"""Parámetros de la aplicación guardados en una base de datos MySQL."""

	# region PRIVATE CONSTANTS

	_TYPE: ClassVar[str] = "type";
	"""Columna `type` de la tabla `application_parameter`."""

	_DEFAULT_VALUE: ClassVar[str] = "default_value";
	"""Columna `default_value` de la tabla `application_parameter`."""

	_CURRENT_VALUE: ClassVar[str] = "current_value";
	"""Columna `current_value` de la tabla `application_parameter`."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, database: DatabaseConnectionProviderBase) -> None:
		"""Crea el repositorio.

		Args:
			database: Quien entrega las conexiones a la base de datos en la que se guardan los parámetros.
		"""
		self._database = database;
		"""Quien entrega las conexiones a la base de datos."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_all(self) -> list[ApplicationParameter]:
		"""Recupera todos los parámetros de la aplicación, ordenados por tipo.

		Raises:
			PersistenceError: Si no se puede abrir la base de datos, falla la consulta o hay datos no válidos.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudieron recuperar los parámetros de la aplicación: {error}") from error;

		# 2. Ejecutamos la consulta y convertimos las filas en parámetros. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"SELECT {self._TYPE}, {self._DEFAULT_VALUE}, {self._CURRENT_VALUE} "
				f"FROM application_parameter ORDER BY {self._TYPE}"
			);
			rows = cursor.fetchall();
			return [self._to_application_parameter(row) for row in rows];
		except (pymysql.MySQLError, ValueError) as error:
			raise PersistenceError(f"No se pudieron recuperar los parámetros de la aplicación: {error}") from error;
		finally:
			connection.close();

	def get_by_type(self, parameter_type: ApplicationParameterType) -> ApplicationParameter:
		"""Recupera el parámetro de ese tipo.

		Raises:
			ApplicationParameterNotFoundError: Si no existe el parámetro.
			PersistenceError: Si no se puede abrir la base de datos, falla la consulta o hay datos no válidos.
		"""
		# 1. Abrimos la conexión.
		try:
			connection = self._database.connect();
		except DatabaseError as error:
			raise PersistenceError(f"No se pudo recuperar el parámetro '{parameter_type}': {error}") from error;

		# 2. Ejecutamos la consulta. La conexión se cierra siempre (finally).
		try:
			cursor = connection.cursor();
			cursor.execute(
				f"SELECT {self._TYPE}, {self._DEFAULT_VALUE}, {self._CURRENT_VALUE} "
				f"FROM application_parameter WHERE {self._TYPE} = %s",
				(parameter_type.value,),
			);
			row: DatabaseRowBase | None = cursor.fetchone();
		except pymysql.MySQLError as error:
			raise PersistenceError(f"No se pudo recuperar el parámetro '{parameter_type}': {error}") from error;
		finally:
			connection.close();

		# 3. Si no hay fila, el parámetro no existe; si la hay, la convertimos en un parámetro.
		if row is None:
			raise ApplicationParameterNotFoundError(f"No existe el parámetro de la aplicación '{parameter_type}'");
		try:
			return self._to_application_parameter(row);
		except ValueError as error:
			raise PersistenceError(f"Datos no válidos del parámetro '{parameter_type}': {error}") from error;

	# endregion PUBLIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _to_application_parameter(row: DatabaseRowBase) -> ApplicationParameter:
		"""Convierte una fila de la tabla `application_parameter` en un parámetro de dominio.

		Args:
			row: Fila de la tabla `application_parameter`, que se lee por nombre de columna.

		Returns:
			El parámetro de dominio.

		Raises:
			ValueError: Si el tipo de la fila no corresponde a ningún tipo de parámetro conocido.
		"""
		return ApplicationParameter(
			type=ApplicationParameterType(row[MySQLApplicationParameterRepository._TYPE]),
			default_value=row[MySQLApplicationParameterRepository._DEFAULT_VALUE],
			value=row[MySQLApplicationParameterRepository._CURRENT_VALUE],
		);

	# endregion PRIVATE STATIC METHODS
