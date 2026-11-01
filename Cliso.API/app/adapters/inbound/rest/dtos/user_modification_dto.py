from pydantic import BaseModel;

from app.domain.models import UserRole;


class UserModificationDto(BaseModel):
	"""DTO con los datos que se reciben por la API para modificar un usuario."""

	# region PUBLIC PROPERTIES

	nick: str;
	"""Alias del usuario. Debe ser el que ya tiene: el nick no se puede cambiar."""

	name: str;
	"""Nombre del usuario."""

	surname: str;
	"""Apellidos del usuario."""

	role: UserRole;
	"""Rol del usuario."""

	password: str | None = None;
	"""Contraseña nueva, en texto plano. Si no se indica, el usuario conserva la que tiene."""

	# endregion PUBLIC PROPERTIES
