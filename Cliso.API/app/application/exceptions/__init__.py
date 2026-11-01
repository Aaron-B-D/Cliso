"""Excepciones de la capa de aplicación: las del contrato de los puertos."""

from app.application.exceptions.application_parameter import ApplicationParameterError, ApplicationParameterNotFoundError;
from app.application.exceptions.auth import (
	AuthError,
	AuthInvalidCredentialsError,
	AuthSessionNotValidError,
	AuthTooManyAttemptsError,
);
from app.application.exceptions.bim_model import (
	BIMModelContentNotFoundError,
	BIMModelError,
	BIMModelNotFoundError,
	BIMModelValidationError,
);
from app.application.exceptions.file_storage_error import FileStorageError;
from app.application.exceptions.persistence_error import PersistenceError;
from app.application.exceptions.user import (
	UserAlreadyExistsError,
	UserError,
	UserNotFoundError,
	UserPasswordValidationError,
	UserProtectedError,
	UserValidationError,
);
from app.application.exceptions.visualization import (
	VisualizationError,
	VisualizationForbiddenError,
	VisualizationNotFoundError,
	VisualizationValidationError,
);

__all__ = [
	"ApplicationParameterError",
	"ApplicationParameterNotFoundError",
	"AuthError",
	"AuthInvalidCredentialsError",
	"AuthSessionNotValidError",
	"AuthTooManyAttemptsError",
	"BIMModelContentNotFoundError",
	"BIMModelError",
	"BIMModelNotFoundError",
	"BIMModelValidationError",
	"FileStorageError",
	"PersistenceError",
	"UserAlreadyExistsError",
	"UserError",
	"UserNotFoundError",
	"UserPasswordValidationError",
	"UserProtectedError",
	"UserValidationError",
	"VisualizationError",
	"VisualizationForbiddenError",
	"VisualizationNotFoundError",
	"VisualizationValidationError",
];
