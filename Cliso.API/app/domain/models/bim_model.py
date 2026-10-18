from dataclasses import dataclass, field;
from datetime import datetime;


@dataclass(kw_only=True)
class BIMModel:
	"""Objeto que representa un modelo BIM."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador único del modelo (None mientras no se ha guardado)."""

	name: str;
	"""Nombre del modelo."""

	description: str = "";
	"""Descripción del modelo."""

	file_name: str;
	"""Nombre del fichero asociado al modelo."""

	active: bool = True;
	"""Indica si el modelo está activo (True) o ha sido borrado (False)."""

	creation_date: datetime = field(default_factory=datetime.now);
	"""Fecha y hora de creación del modelo."""

	# endregion PUBLIC PROPERTIES
