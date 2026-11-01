from dataclasses import dataclass, field;
from datetime import datetime;

from app.domain.models.user_role import UserRole;


@dataclass(kw_only=True)
class Session:
	"""Objeto que representa la sesión abierta de un usuario que ha iniciado sesión. Solo vive en memoria."""

	# region PUBLIC PROPERTIES

	token: str;
	"""Identificador secreto y aleatorio de la sesión: es lo que el cliente presenta en cada petición."""

	user_id: int;
	"""Identificador del usuario que inició la sesión."""

	nick: str;
	"""Alias del usuario que inició la sesión."""

	role: UserRole;
	"""Rol del usuario cuando inició la sesión."""

	ip_address: str;
	"""Dirección IP desde la que se inició la sesión: solo se acepta el token desde esa misma dirección."""

	creation_date: datetime = field(default_factory=datetime.now);
	"""Fecha y hora en que se inició la sesión."""

	last_access_date: datetime = field(default_factory=datetime.now);
	"""Fecha y hora de la última petición hecha con la sesión: desde ella se cuenta la inactividad."""

	# endregion PUBLIC PROPERTIES
