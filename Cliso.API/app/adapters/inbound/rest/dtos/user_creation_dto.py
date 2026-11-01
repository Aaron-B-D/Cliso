from pydantic import BaseModel;

from app.domain.models import UserRole;


class UserCreationDto(BaseModel):
	"""DTO con los datos que se reciben por la API para crear un usuario."""

	# region PUBLIC PROPERTIES

	nick: str;
	"""Alias del usuario. Se guarda en minúsculas y no se podrá cambiar."""

	name: str;
	"""Nombre del usuario."""

	surname: str;
	"""Apellidos del usuario."""

	role: UserRole;
	"""Rol del usuario."""

	password: str;
	"""Contraseña del usuario, en texto plano. Se guarda hasheada."""

	# endregion PUBLIC PROPERTIES
