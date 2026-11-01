from dataclasses import dataclass, field;
from datetime import datetime;
from uuid import uuid4;


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

	observations: str = "";
	"""Observaciones adicionales sobre el modelo."""

	file_name: str;
	"""Nombre original del fichero asociado al modelo (vacío mientras no se ha subido ninguno)."""

	stored_file_name: str = field(default_factory=lambda: f"{uuid4().hex}.ifc");
	"""Nombre aleatorio y único con el que se guarda el fichero en disco. Se genera al crear el modelo, aunque todavía no tenga fichero, y no cambia nunca."""

	active: bool = True;
	"""Indica si el modelo está activo (True) o ha sido borrado (False)."""

	creation_date: datetime = field(default_factory=datetime.now);
	"""Fecha y hora de creación del modelo."""

	update_date: datetime | None = None;
	"""Fecha y hora de la última modificación del modelo (None si nunca se ha modificado)."""

	# endregion PUBLIC PROPERTIES
