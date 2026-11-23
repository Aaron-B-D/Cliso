from dataclasses import dataclass;

from app.domain.models.visualization_piece_type import VisualizationPieceType;


@dataclass(kw_only=True)
class VisualizationPiece:
	"""Pieza de una visualización: algo que el usuario ha añadido sobre el modelo BIM (un marcador, por ejemplo), por orden de añadido.

	Clase base: cada tipo de pieza la especializa con los datos que necesita para mostrarse.
	"""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador único de la pieza (None mientras no se ha guardado). El orden de añadido es el de los identificadores."""

	type: VisualizationPieceType;
	"""Tipo de la pieza."""

	# endregion PUBLIC PROPERTIES
