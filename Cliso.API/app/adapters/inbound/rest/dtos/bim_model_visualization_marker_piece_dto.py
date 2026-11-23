from typing import Annotated, Literal;

from pydantic import BaseModel, Field, StringConstraints;


class BIMModelVisualizationMarkerPieceDto(BaseModel):
	"""DTO de una pieza de marcador (un icono de un color, con título, en una coordenada del modelo BIM), de entrada y de salida."""

	# region PUBLIC PROPERTIES

	anchor_id: Annotated[int, Field(ge=0)] | None = None;
	"""Identificador local, dentro del modelo BIM, del elemento al que está anclado el marcador; None si está libre."""

	description: Annotated[str, StringConstraints(max_length=1000)] = "";
	"""Descripción del marcador, que se muestra en su información emergente."""

	dim_when_idle: bool = False;
	"""Si es True, el marcador se atenúa mientras el ratón no está encima de él."""

	highlight_on_select: bool = False;
	"""Si es True, al pulsar el marcador se resalta el elemento al que está anclado."""

	icon: Annotated[str, StringConstraints(pattern="^(PIN|INFO|WARNING|CHECK|FLAG)$")] = "PIN";
	"""Icono del marcador: `PIN`, `INFO`, `WARNING`, `CHECK` o `FLAG`."""

	link: Annotated[str, StringConstraints(pattern=r"^(https?://\S+)?$", max_length=2000)] = "";
	"""Enlace asociado al marcador (solo `http://` o `https://`); vacío si no tiene."""

	link_target: Annotated[str, StringConstraints(pattern="^(CURRENT_TAB|NEW_WINDOW)$")] = "NEW_WINDOW";
	"""Dónde se abre el enlace: `CURRENT_TAB` (pestaña actual) o `NEW_WINDOW` (ventana nueva)."""

	opacity: Annotated[float, Field(ge=0, le=1)] = 1.0;
	"""Opacidad del marcador, de 0 (invisible) a 1 (opaco)."""

	size: Annotated[float, Field(gt=0, le=10)] = 1.0;
	"""Tamaño del marcador, como factor del tamaño normal (1 es el normal)."""

	text_color: Annotated[str, StringConstraints(pattern="^#[0-9A-Fa-f]{6}$")] = "#FFFFFF";
	"""Color del título, en hexadecimal (`#RRGGBB`)."""

	title: Annotated[str, StringConstraints(max_length=100)] = "";
	"""Título del marcador."""

	title_position: Annotated[str, StringConstraints(pattern="^(ABOVE|BELOW|RIGHT|HIDDEN)$")] = "BELOW";
	"""Dónde se escribe el título respecto al icono: `ABOVE`, `BELOW`, `RIGHT` o `HIDDEN` (sin título)."""

	visible_through_model: bool = True;
	"""Si es True, el marcador se ve a través del modelo cuando hay elementos del modelo delante."""

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
	"""Color del icono, en hexadecimal (`#RRGGBB`)."""

	# endregion PUBLIC PROPERTIES
