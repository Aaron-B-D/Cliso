from pydantic import BaseModel;

from app.domain.models import Permission, UserRole;


class SessionDto(BaseModel):
	"""DTO de una sesión para responder por la API. Nunca incluye el token: viaja solo en la cookie."""

	# region PUBLIC PROPERTIES

	user_id: int;
	"""Identificador del usuario de la sesión."""

	nick: str;
	"""Alias del usuario de la sesión."""

	role: UserRole;
	"""Rol del usuario de la sesión."""

	permissions: list[Permission];
	"""Permisos de su rol: es lo que el cliente usa para decidir qué opciones muestra (el API los exige igualmente en cada operación)."""

	# endregion PUBLIC PROPERTIES
