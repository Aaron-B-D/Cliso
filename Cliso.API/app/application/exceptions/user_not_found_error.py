from app.application.exceptions.user_error import UserError;


class UserNotFoundError(UserError):
	"""No existe ningún usuario activo con el nick indicado."""
