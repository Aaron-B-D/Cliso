from collections.abc import Sequence;
from typing import Any, Protocol;

from app.adapters.outbound.persistence import DatabaseRowBase;


class DatabaseCursorBase(Protocol):
	"""Lo mínimo que debe ofrecer un cursor para consultar datos, sea del proveedor que sea."""

	# region PUBLIC PROPERTIES

	@property
	def lastrowid(self) -> int | None:
		"""Identificador asignado por la base de datos a la última fila insertada con este cursor."""
		...;

	@property
	def rowcount(self) -> int:
		"""Número de filas que ha afectado la última sentencia ejecutada con este cursor."""
		...;

	# endregion PUBLIC PROPERTIES

	# region PUBLIC METHODS

	def execute(self, query: str, parameters: tuple[Any, ...] = (), /) -> Any:
		"""Ejecuta una sentencia SQL con sus parámetros (`?` en SQLite, `%s` en MySQL).

		Args:
			query: Sentencia SQL.
			parameters: Valores de los parámetros de la sentencia, en orden.
		"""
		...;

	def fetchone(self) -> DatabaseRowBase | None:
		"""Devuelve la siguiente fila del resultado, o None si no quedan más."""
		...;

	def fetchall(self) -> Sequence[DatabaseRowBase]:
		"""Devuelve todas las filas que quedan del resultado (según el motor, en una lista o en una tupla)."""
		...;

	# endregion PUBLIC METHODS
