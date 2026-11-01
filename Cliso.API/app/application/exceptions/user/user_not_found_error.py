from app.application.exceptions.user.user_error import UserError;


class UserNotFoundError(UserError):
	"""No existe el usuario con el identificador indicado."""
