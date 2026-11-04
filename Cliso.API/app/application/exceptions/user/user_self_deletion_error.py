from app.application.exceptions.user.user_error import UserError;


class UserSelfDeletionError(UserError):
	"""Un usuario intenta borrarse a sí mismo: no se permite, para no quedarse sin acceso en mitad de la sesión."""
