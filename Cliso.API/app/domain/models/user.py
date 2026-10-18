from dataclasses import dataclass, field;
from datetime import datetime;


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

	active: bool = True;
	"""Indica si el usuario está activo (True) o ha sido borrado (False)."""

	creation_date: datetime = field(default_factory=datetime.now);
	"""Fecha y hora de creación del usuario."""

	# endregion PUBLIC PROPERTIES
