from enum import StrEnum;


class VisualizationPieceType(StrEnum):
	"""Tipo de una pieza de una visualización: define qué clase de pieza es y qué datos guarda."""

	# region PUBLIC CONSTANTS

	MARKER = "MARKER";
	"""Marcador: un círculo de un color en una coordenada del modelo BIM."""

	# endregion PUBLIC CONSTANTS
