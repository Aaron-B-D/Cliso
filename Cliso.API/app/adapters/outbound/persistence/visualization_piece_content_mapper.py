import json;
from typing import cast;

from app.domain.models import BIMModelVisualizationMarkerPiece, VisualizationPiece, VisualizationPieceType;


class VisualizationPieceContentMapper:
	"""Convierte, campo a campo, entre una pieza de dominio y el JSON que se guarda en la columna `content`.

	Clase estática: no se instancia. El JSON lleva siempre el tipo de la pieza (`type`), que decide a qué clase se
	deserializa.
	"""

	# TODO: revisar dónde vive esta clase. Está en la raíz de `persistence/`, que las directrices reservan a las clases
	# `*Base`, porque la comparten SQLite y MySQL. Al añadir más tipos de pieza dejará de ser un `if` y habrá que repensarla.

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_content(piece: VisualizationPiece) -> str:
		"""Convierte una pieza de dominio en el JSON que se guarda.

		Args:
			piece: Pieza de dominio.

		Returns:
			El JSON de la pieza, con su tipo y los datos propios de ese tipo (no incluye el `id`).

		Raises:
			ValueError: Si el tipo de la pieza no está soportado.
		"""
		if not isinstance(piece, BIMModelVisualizationMarkerPiece):
			raise ValueError(f"Tipo de pieza no soportado: '{piece.type}'");

		data: dict[str, object] = {};
		data["type"] = piece.type.value;
		data["x"] = piece.x;
		data["y"] = piece.y;
		data["z"] = piece.z;
		data["color"] = piece.color;
		return json.dumps(data);

	@staticmethod
	def to_piece(piece_id: int, content: str) -> VisualizationPiece:
		"""Convierte el JSON guardado en una pieza de dominio.

		Args:
			piece_id: Identificador de la pieza (el de su fila).
			content: JSON de la pieza.

		Returns:
			La pieza de dominio, de la clase que indica su tipo.

		Raises:
			ValueError: Si el JSON no es válido, falta algún dato o el tipo no está soportado.
		"""
		parsed: object = json.loads(content);
		if not isinstance(parsed, dict):
			raise ValueError(f"El contenido de la pieza {piece_id} no es un objeto JSON");
		data = cast(dict[str, object], parsed);

		piece_type = VisualizationPieceContentMapper._read_text(piece_id, data, "type");
		if piece_type != VisualizationPieceType.MARKER.value:
			raise ValueError(f"Tipo de pieza no soportado en la pieza {piece_id}: '{piece_type}'");

		return BIMModelVisualizationMarkerPiece(
			id=piece_id,
			x=VisualizationPieceContentMapper._read_number(piece_id, data, "x"),
			y=VisualizationPieceContentMapper._read_number(piece_id, data, "y"),
			z=VisualizationPieceContentMapper._read_number(piece_id, data, "z"),
			color=VisualizationPieceContentMapper._read_text(piece_id, data, "color"),
		);

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _read_text(piece_id: int, data: dict[str, object], key: str) -> str:
		"""Lee un dato de texto del JSON de una pieza.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.

		Returns:
			El texto.

		Raises:
			ValueError: Si el dato falta o no es un texto.
		"""
		value = data.get(key);
		if not isinstance(value, str):
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} falta o no es un texto");
		return value;

	@staticmethod
	def _read_number(piece_id: int, data: dict[str, object], key: str) -> float:
		"""Lee un dato numérico del JSON de una pieza.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.

		Returns:
			El número.

		Raises:
			ValueError: Si el dato falta o no es un número.
		"""
		value = data.get(key);
		if isinstance(value, bool) or not isinstance(value, (int, float)):
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} falta o no es un número");
		return float(value);

	# endregion PRIVATE STATIC METHODS
