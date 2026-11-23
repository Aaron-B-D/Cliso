import json;
from typing import ClassVar, cast;

from app.domain.models import BIMModelVisualizationMarkerPiece, VisualizationPiece, VisualizationPieceType;


class VisualizationPieceContentMapper:
	"""Convierte, campo a campo, entre una pieza de dominio y el JSON que se guarda en la columna `content`.

	Clase estática: no se instancia. El JSON lleva siempre el tipo de la pieza (`type`), que decide a qué clase se
	deserializa.
	"""

	# TODO: revisar dónde vive esta clase. Está en la raíz de `persistence/`, que las directrices reservan a las clases
	# `*Base`, porque la comparten SQLite y MySQL. Al añadir más tipos de pieza dejará de ser un `if` y habrá que repensarla.

	# region PRIVATE CONSTANTS

	_ICONS: ClassVar[tuple[str, ...]] = ("PIN", "INFO", "WARNING", "CHECK", "FLAG");
	"""Iconos permitidos para un marcador."""

	_LINK_TARGETS: ClassVar[tuple[str, ...]] = ("CURRENT_TAB", "NEW_WINDOW");
	"""Destinos permitidos del enlace de un marcador."""

	_TITLE_POSITIONS: ClassVar[tuple[str, ...]] = ("ABOVE", "BELOW", "RIGHT", "HIDDEN");
	"""Posiciones permitidas del título de un marcador."""

	# endregion PRIVATE CONSTANTS

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
		data["anchor_id"] = piece.anchor_id;
		data["description"] = piece.description;
		data["dim_when_idle"] = piece.dim_when_idle;
		data["highlight_on_select"] = piece.highlight_on_select;
		data["icon"] = piece.icon;
		data["link"] = piece.link;
		data["link_target"] = piece.link_target;
		data["opacity"] = piece.opacity;
		data["size"] = piece.size;
		data["text_color"] = piece.text_color;
		data["title"] = piece.title;
		data["title_position"] = piece.title_position;
		data["visible_through_model"] = piece.visible_through_model;
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
			anchor_id=VisualizationPieceContentMapper._read_optional_int(piece_id, data, "anchor_id"),
			description=VisualizationPieceContentMapper._read_text(piece_id, data, "description", ""),
			dim_when_idle=VisualizationPieceContentMapper._read_bool(piece_id, data, "dim_when_idle", False),
			highlight_on_select=VisualizationPieceContentMapper._read_bool(piece_id, data, "highlight_on_select", False),
			icon=VisualizationPieceContentMapper._read_choice(piece_id, data, "icon", "PIN", VisualizationPieceContentMapper._ICONS),
			link=VisualizationPieceContentMapper._read_text(piece_id, data, "link", ""),
			link_target=VisualizationPieceContentMapper._read_choice(
				piece_id, data, "link_target", "NEW_WINDOW", VisualizationPieceContentMapper._LINK_TARGETS
			),
			opacity=VisualizationPieceContentMapper._read_range(piece_id, data, "opacity", 1.0, 0.0, 1.0, True),
			size=VisualizationPieceContentMapper._read_range(piece_id, data, "size", 1.0, 0.0, 10.0, False),
			text_color=VisualizationPieceContentMapper._read_color(piece_id, data, "text_color", "#FFFFFF"),
			title=VisualizationPieceContentMapper._read_text(piece_id, data, "title", ""),
			title_position=VisualizationPieceContentMapper._read_choice(
				piece_id, data, "title_position", "BELOW", VisualizationPieceContentMapper._TITLE_POSITIONS
			),
			visible_through_model=VisualizationPieceContentMapper._read_bool(piece_id, data, "visible_through_model", True),
		);

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _read_bool(piece_id: int, data: dict[str, object], key: str, default: bool | None = None) -> bool:
		"""Lee un dato booleano del JSON de una pieza.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.
			default: Valor si el dato falta (así se leen piezas guardadas antes de añadirse el dato). Sin él, el dato es obligatorio.

		Returns:
			El booleano.

		Raises:
			ValueError: Si el dato falta (y no hay valor por defecto) o no es un booleano.
		"""
		value = data.get(key);
		result: bool = False;
		if isinstance(value, bool):
			result = value;
		elif key not in data and default is not None:
			result = default;
		else:
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} falta o no es un booleano");
		return result;

	@staticmethod
	def _read_text(piece_id: int, data: dict[str, object], key: str, default: str | None = None) -> str:
		"""Lee un dato de texto del JSON de una pieza.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.
			default: Valor si el dato falta (así se leen piezas guardadas antes de añadirse el dato). Sin él, el dato es obligatorio.

		Returns:
			El texto.

		Raises:
			ValueError: Si el dato falta (y no hay valor por defecto) o no es un texto.
		"""
		value = data.get(key);
		result: str = "";
		if isinstance(value, str):
			result = value;
		elif key not in data and default is not None:
			result = default;
		else:
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} falta o no es un texto");
		return result;

	@staticmethod
	def _read_color(piece_id: int, data: dict[str, object], key: str, default: str) -> str:
		"""Lee un color en hexadecimal (`#RRGGBB`) del JSON de una pieza.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.
			default: Valor si el dato falta.

		Returns:
			El color.

		Raises:
			ValueError: Si el dato no es un texto o no tiene el formato `#RRGGBB`.
		"""
		value = VisualizationPieceContentMapper._read_text(piece_id, data, key, default);
		# Siete caracteres: la almohadilla y seis dígitos hexadecimales (al quitar estos de lo que sigue, no queda nada)
		is_valid = len(value) == 7 and value.startswith("#") and value[1:].strip("0123456789abcdefABCDEF") == "";
		if not is_valid:
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} no es un color #RRGGBB: '{value}'");
		return value;

	@staticmethod
	def _read_range(
		piece_id: int,
		data: dict[str, object],
		key: str,
		default: float,
		minimum: float,
		maximum: float,
		minimum_included: bool,
	) -> float:
		"""Lee un dato numérico del JSON de una pieza que debe estar entre un mínimo y un máximo (incluido).

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.
			default: Valor si el dato falta.
			minimum: Límite inferior.
			maximum: Límite superior, incluido.
			minimum_included: `True` si el propio mínimo es un valor válido.

		Returns:
			El número.

		Raises:
			ValueError: Si el dato no es un número o está fuera del rango.
		"""
		value = VisualizationPieceContentMapper._read_number(piece_id, data, key, default);
		is_valid = value <= maximum and (value >= minimum if minimum_included else value > minimum);
		if not is_valid:
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} está fuera de rango: {value}");
		return value;

	@staticmethod
	def _read_choice(piece_id: int, data: dict[str, object], key: str, default: str, allowed: tuple[str, ...]) -> str:
		"""Lee un dato de texto del JSON de una pieza que solo puede tomar unos valores concretos.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.
			default: Valor si el dato falta.
			allowed: Valores permitidos.

		Returns:
			El texto.

		Raises:
			ValueError: Si el dato no es un texto o no es uno de los valores permitidos.
		"""
		value = VisualizationPieceContentMapper._read_text(piece_id, data, key, default);
		if value not in allowed:
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} no tiene un valor permitido: '{value}'");
		return value;

	@staticmethod
	def _read_optional_int(piece_id: int, data: dict[str, object], key: str) -> int | None:
		"""Lee un dato entero opcional del JSON de una pieza.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.

		Returns:
			El entero, o None si el dato es null.

		Raises:
			ValueError: Si el dato no es un entero ni null (si falta, se devuelve None: pieza libre).
		"""
		value = data.get(key);
		result: int | None = None;
		if value is None:
			pass;
		elif isinstance(value, int) and not isinstance(value, bool):
			result = value;
		else:
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} no es un entero");
		return result;

	@staticmethod
	def _read_number(piece_id: int, data: dict[str, object], key: str, default: float | None = None) -> float:
		"""Lee un dato numérico del JSON de una pieza.

		Args:
			piece_id: Identificador de la pieza, para el mensaje de error.
			data: JSON de la pieza ya convertido en diccionario.
			key: Nombre del dato.
			default: Valor si el dato falta (así se leen piezas guardadas antes de añadirse el dato). Sin él, el dato es obligatorio.

		Returns:
			El número.

		Raises:
			ValueError: Si el dato falta (y no hay valor por defecto) o no es un número.
		"""
		value = data.get(key);
		result: float = 0.0;
		if not isinstance(value, bool) and isinstance(value, (int, float)):
			result = float(value);
		elif key not in data and default is not None:
			result = default;
		else:
			raise ValueError(f"El dato '{key}' de la pieza {piece_id} falta o no es un número");
		return result;

	# endregion PRIVATE STATIC METHODS
