from app.application.exceptions.user.user_error import UserError;


class UserValidationError(UserError):
	"""Los datos recibidos de un usuario no son válidos (nick, nombre o apellidos vacíos o demasiado largos)."""
