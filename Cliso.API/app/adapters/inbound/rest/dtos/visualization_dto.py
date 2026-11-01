from pydantic import BaseModel;


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

	# endregion PUBLIC PROPERTIES
