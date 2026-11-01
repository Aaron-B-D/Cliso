from app.application.exceptions.user.user_error import UserError;


class UserAlreadyExistsError(UserError):
	"""Ya existe un usuario con ese nick."""
