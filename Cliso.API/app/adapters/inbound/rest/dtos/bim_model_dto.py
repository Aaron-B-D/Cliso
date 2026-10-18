from datetime import datetime;

from pydantic import BaseModel;


class BIMModelDto(BaseModel):
	"""DTO de un modelo BIM, tanto de entrada como de salida de la API."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador. Lo asigna el sistema; se ignora en la entrada."""

	name: str;
	"""Nombre del modelo."""

	description: str = "";
	"""Descripción del modelo."""

	file_name: str | None = None;
	"""Nombre del fichero. Lo asigna la subida del fichero; se ignora en la entrada."""

	creation_date: datetime | None = None;
	"""Fecha de creación. La asigna el sistema; se ignora en la entrada."""

	# endregion PUBLIC PROPERTIES
