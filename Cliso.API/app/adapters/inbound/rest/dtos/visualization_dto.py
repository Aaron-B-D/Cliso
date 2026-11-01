from pydantic import BaseModel;

from app.adapters.inbound.rest.dtos.bim_model_visualization_marker_piece_dto import BIMModelVisualizationMarkerPieceDto;


class VisualizationDto(BaseModel):
	"""DTO de una visualización, tanto de entrada como de salida de la API."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador. Lo asigna el sistema; se ignora en la entrada."""

	user_id: int | None = None;
	"""Usuario propietario. Se toma de la sesión; se ignora en la entrada."""

	bim_model_id: int;
	"""Modelo BIM sobre el que trabaja la visualización."""

	name: str;
	"""Nombre de la visualización."""

	description: str = "";
	"""Descripción de la visualización."""

	observations: str = "";
	"""Observaciones adicionales."""

	is_public: bool = False;
	"""Si es True, otros usuarios pueden verla pero no modificarla."""

	pieces: list[BIMModelVisualizationMarkerPieceDto] | None = None;
	"""Piezas, por orden de añadido. En la salida, None si no se han pedido (`depth` 0). En la entrada, al modificar, None deja las piezas como están y una lista las sustituye todas."""

	# endregion PUBLIC PROPERTIES
