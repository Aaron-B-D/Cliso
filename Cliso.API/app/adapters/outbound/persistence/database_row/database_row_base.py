from typing import Any, Protocol;


class DatabaseRowBase(Protocol):
	"""Lo mínimo que debe ofrecer una fila devuelta por una consulta, sea del proveedor que sea: leerla por nombre de columna."""

	# region PUBLIC METHODS

	def __getitem__(self, column: str, /) -> Any:
		"""Devuelve el valor de una columna de la fila.

		Args:
			column: Nombre de la columna.
		"""
		...;

	# endregion PUBLIC METHODS
