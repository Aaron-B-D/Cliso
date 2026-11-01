from app.application.exceptions.auth.auth_error import AuthError;


class AuthInvalidCredentialsError(AuthError):
	"""El nick o la contraseña no son correctos (no se distingue cuál, para no revelar qué nicks existen)."""
