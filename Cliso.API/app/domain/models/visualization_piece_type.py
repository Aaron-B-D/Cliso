from enum import StrEnum;


class VisualizationPieceType(StrEnum):
	"""Tipo de una pieza de una visualización: define qué clase de pieza es y qué datos guarda."""

	# region PUBLIC CONSTANTS

	MARKER = "MARKER";
	"""Marcador: un icono de un color, con título, en una coordenada del modelo BIM."""

	# endregion PUBLIC CONSTANTS
