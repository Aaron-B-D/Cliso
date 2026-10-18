from pydantic import BaseModel;


class UserCredentialsDto(BaseModel):
	"""DTO con las credenciales de un usuario para validarlas. Solo se recibe, nunca se devuelve."""

	# region PUBLIC PROPERTIES

	nick: str;
	"""Alias del usuario."""

	password_hash: str;
	"""Hash de la contraseña. Quien llama debe hashearla antes de enviarla."""

	# endregion PUBLIC PROPERTIES
