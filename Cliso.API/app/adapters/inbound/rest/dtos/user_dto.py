from pydantic import BaseModel;

from app.domain.models import UserRole;


class UserDto(BaseModel):
	"""DTO de un usuario para responder por la API. Nunca incluye la contraseña, ni siquiera hasheada."""

	# region PUBLIC PROPERTIES

	id: int;
	"""Identificador del usuario."""

	nick: str;
	"""Alias del usuario, siempre en minúsculas. Es único y no se puede cambiar."""

	name: str;
	"""Nombre del usuario."""

	surname: str;
	"""Apellidos del usuario."""

	role: UserRole;
	"""Rol del usuario."""

	active: bool;
	"""Indica si el usuario está activo."""

	# endregion PUBLIC PROPERTIES
