from dataclasses import dataclass, field;
from datetime import datetime;

from app.domain.models.user_role import UserRole;


@dataclass(kw_only=True)
class User:
	"""Objeto que representa un usuario de la aplicación."""

	# region PUBLIC PROPERTIES

	id: int | None = None;
	"""Identificador único del usuario (None mientras no se ha guardado)."""

	nick: str;
	"""Alias del usuario. Es único entre todos los usuarios."""

	name: str;
	"""Nombre del usuario."""

	surname: str;
	"""Apellidos del usuario."""

	password: str;
	"""Contraseña del usuario, ya hasheada (nunca en texto plano)."""

	role: UserRole;
	"""Rol del usuario: define qué puede hacer en la aplicación."""

	active: bool = True;
	"""Indica si el usuario está activo (True) o ha sido borrado (False)."""

	creation_date: datetime = field(default_factory=datetime.now);
	"""Fecha y hora de creación del usuario."""

	update_date: datetime | None = None;
	"""Fecha y hora de la última modificación del usuario (None si nunca se ha modificado)."""

	# endregion PUBLIC PROPERTIES
