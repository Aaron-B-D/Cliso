from app.application.exceptions.auth.auth_error import AuthError;


class AuthSessionNotValidError(AuthError):
	"""No hay una sesión válida: no se ha iniciado, el token es desconocido o la sesión ha caducado."""
