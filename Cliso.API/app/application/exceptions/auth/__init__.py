"""Excepciones de la autenticación."""

from app.application.exceptions.auth.auth_error import AuthError;
from app.application.exceptions.auth.auth_invalid_credentials_error import AuthInvalidCredentialsError;
from app.application.exceptions.auth.auth_session_not_valid_error import AuthSessionNotValidError;
from app.application.exceptions.auth.auth_too_many_attempts_error import AuthTooManyAttemptsError;

__all__ = [
	"AuthError",
	"AuthInvalidCredentialsError",
	"AuthSessionNotValidError",
	"AuthTooManyAttemptsError",
];
