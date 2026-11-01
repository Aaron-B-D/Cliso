from pydantic import BaseModel, Field;


class LoginDto(BaseModel):
	"""DTO con las credenciales que se reciben por la API para iniciar sesión."""

	# region PUBLIC PROPERTIES

	nick: str = Field(max_length=50);
	"""Alias del usuario (no distingue mayúsculas de minúsculas). Como máximo, la longitud que admite un nick al guardarlo."""

	password: str = Field(max_length=1000);
	"""Contraseña del usuario, en texto plano. El límite evita que una contraseña desmesurada obligue a calcular su hash en balde."""

	# endregion PUBLIC PROPERTIES
