from app.application.exceptions.user.user_error import UserError;


class UserProtectedError(UserError):
	"""El usuario está protegido: no se puede borrar ni cambiar su rol."""
