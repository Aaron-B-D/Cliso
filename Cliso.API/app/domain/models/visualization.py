from dataclasses import dataclass, field;
from datetime import datetime;


@dataclass(kw_only=True)
class Visualization:
	"""Objeto que representa una visualización de un usuario sobre un modelo BIM."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador único de la visualización (None mientras no se ha guardado)."""

	user_id: int;
	"""Identificador del usuario propietario. Solo él puede modificarla."""

	bim_model_id: int;
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

	creation_date: datetime = field(default_factory=datetime.now);
	"""Fecha y hora de creación de la visualización."""

	update_date: datetime | None = None;
	"""Fecha y hora de la última modificación de la visualización (None si nunca se ha modificado)."""

	# endregion PUBLIC PROPERTIES
