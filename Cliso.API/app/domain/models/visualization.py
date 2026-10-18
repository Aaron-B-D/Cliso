from dataclasses import dataclass;


@dataclass(kw_only=True)
class Visualization:
	"""Objeto que representa una visualización de un usuario sobre un modelo BIM."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador único de la visualización (None mientras no se ha guardado)."""

	owner_id: int;
	"""Identificador del usuario propietario. Solo él puede modificarla."""

	model_id: int;
	"""Identificador del modelo BIM sobre el que trabaja la visualización."""

	name: str;
	"""Nombre de la visualización."""

	description: str = "";
	"""Descripción de la visualización."""

	observations: str = "";
	"""Observaciones adicionales sobre la visualización."""

	is_public: bool = False;
	"""Si es True, otros usuarios pueden visualizarla pero no modificarla."""

	active: bool = True;
	"""Indica si la visualización está activa (True) o ha sido borrada (False)."""

	# endregion PUBLIC PROPERTIES
