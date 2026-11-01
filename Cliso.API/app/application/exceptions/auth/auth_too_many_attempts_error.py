from app.application.exceptions.auth.auth_error import AuthError;


class AuthTooManyAttemptsError(AuthError):
	"""Se han hecho demasiados intentos fallidos de iniciar sesión seguidos: el acceso queda bloqueado un tiempo."""
