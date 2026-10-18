from typing import Protocol;

from app.adapters.outbound.persistence import DatabaseCursorBase;


class DatabaseConnectionBase(Protocol):
	"""Lo mínimo que debe ofrecer una conexión a la base de datos, sea del proveedor que sea."""

	# region PUBLIC METHODS

	def cursor(self) -> DatabaseCursorBase:
		"""Devuelve un cursor para ejecutar consultas SQL."""
		...;

	def commit(self) -> None:
		"""Confirma los cambios realizados desde el último commit."""
		...;

	def rollback(self) -> None:
		"""Descarta los cambios realizados desde el último commit."""
		...;

	def close(self) -> None:
		"""Cierra la conexión y libera sus recursos."""
		...;

	# endregion PUBLIC METHODS
