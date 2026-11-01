from dataclasses import dataclass;

from app.domain.models.visualization_piece import VisualizationPiece;
from app.domain.models.visualization_piece_type import VisualizationPieceType;


@dataclass(kw_only=True)
class BIMModelVisualizationMarkerPiece(VisualizationPiece):
	"""Pieza que pinta un marcador sencillo (un círculo) de un color en una coordenada del modelo BIM."""

	# region PUBLIC PROPERTIES

	type: VisualizationPieceType = VisualizationPieceType.MARKER;
	"""Tipo de la pieza: siempre marcador."""

	x: float;
	"""Coordenada X del marcador en el modelo BIM."""

	y: float;
	"""Coordenada Y del marcador en el modelo BIM."""

	z: float;
	"""Coordenada Z del marcador en el modelo BIM."""

	color: str = "#FF0000";
	"""Color del círculo, en hexadecimal (`#RRGGBB`)."""

	# endregion PUBLIC PROPERTIES
