from datetime import datetime;

from pydantic import BaseModel;


class UserDto(BaseModel):
	"""DTO de un usuario. No incluye la contraseña, ni siquiera hasheada."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador. Lo asigna el sistema; se ignora en la entrada."""

	nick: str;
	"""Alias único del usuario."""

	name: str;
	"""Nombre del usuario."""

	surname: str;
	"""Apellidos del usuario."""

	creation_date: datetime | None = None;
	"""Fecha de creación. La asigna el sistema; se ignora en la entrada."""

	# endregion PUBLIC PROPERTIES
