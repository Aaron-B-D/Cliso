from dataclasses import dataclass;

from app.domain.models.visualization_piece import VisualizationPiece;
from app.domain.models.visualization_piece_type import VisualizationPieceType;


@dataclass(kw_only=True)
class BIMModelVisualizationMarkerPiece(VisualizationPiece):
	"""Pieza que pinta un marcador (un icono de un color, con título) en una coordenada del modelo BIM, libre o anclado a un elemento."""

	# region PUBLIC PROPERTIES

	type: VisualizationPieceType = VisualizationPieceType.MARKER;
	"""Tipo de la pieza: siempre marcador."""

	anchor_id: int | None = None;
	"""Identificador local, dentro del modelo BIM, del elemento al que está anclado el marcador; None si está libre."""

	description: str = "";
	"""Descripción del marcador, que se muestra en su información emergente."""

	dim_when_idle: bool = False;
	"""Si es True, el marcador se atenúa mientras el ratón no está encima de él."""

	highlight_on_select: bool = False;
	"""Si es True, al pulsar el marcador se resalta el elemento al que está anclado."""

	icon: str = "PIN";
	"""Icono del marcador (`PIN`, `INFO`, `WARNING`, `CHECK` o `FLAG`)."""

	link: str = "";
	"""Enlace asociado al marcador; vacío si no tiene."""

	link_target: str = "NEW_WINDOW";
	"""Dónde se abre el enlace: `CURRENT_TAB` (pestaña actual) o `NEW_WINDOW` (ventana nueva)."""

	opacity: float = 1.0;
	"""Opacidad del marcador, de 0 (invisible) a 1 (opaco)."""

	size: float = 1.0;
	"""Tamaño del marcador, como factor del tamaño normal (1 es el normal)."""

	text_color: str = "#FFFFFF";
	"""Color del título, en hexadecimal (`#RRGGBB`)."""

	title: str = "";
	"""Título del marcador."""

	title_position: str = "BELOW";
	"""Dónde se escribe el título respecto al icono: `ABOVE`, `BELOW`, `RIGHT` o `HIDDEN` (sin título)."""

	visible_through_model: bool = True;
	"""Si es True, el marcador se ve a través del modelo cuando hay elementos del modelo delante."""

	x: float;
	"""Coordenada X del marcador en el modelo BIM."""

	y: float;
	"""Coordenada Y del marcador en el modelo BIM."""

	z: float;
	"""Coordenada Z del marcador en el modelo BIM."""

	color: str = "#FF0000";
	"""Color del icono, en hexadecimal (`#RRGGBB`)."""

	# endregion PUBLIC PROPERTIES
