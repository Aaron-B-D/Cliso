from typing import Literal;

from pydantic import BaseModel;


class BIMModelVisualizationMarkerPieceDto(BaseModel):
	"""DTO de una pieza de marcador (un círculo de un color en una coordenada del modelo BIM), de entrada y de salida."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador. Lo asigna el sistema; se ignora en la entrada."""

	type: Literal["MARKER"] = "MARKER";
	"""Tipo de la pieza: siempre `MARKER`."""

	x: float;
	"""Coordenada X del marcador en el modelo BIM."""

	y: float;
	"""Coordenada Y del marcador en el modelo BIM."""

	z: float;
	"""Coordenada Z del marcador en el modelo BIM."""

	color: str = "#FF0000";
	"""Color del círculo, en hexadecimal (`#RRGGBB`)."""

	# endregion PUBLIC PROPERTIES
