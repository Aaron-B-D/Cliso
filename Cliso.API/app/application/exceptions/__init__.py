"""Excepciones de la capa de aplicación: las del contrato de los puertos."""

from app.application.exceptions.application_parameter import (
	ApplicationParameterError,
	ApplicationParameterNotFoundError,
	ApplicationParameterValidationError,
);
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
from app.application.exceptions.permission_denied_error import PermissionDeniedError;
from app.application.exceptions.persistence_error import PersistenceError;
from app.application.exceptions.user import (
	UserAlreadyExistsError,
	UserError,
	UserNotFoundError,
	UserPasswordValidationError,
	UserProtectedError,
	UserSelfDeletionError,
	UserValidationError,
);
from app.application.exceptions.visualization import (
	VisualizationError,
	VisualizationNotFoundError,
	VisualizationValidationError,
);

__all__ = [
	"ApplicationParameterError",
	"ApplicationParameterNotFoundError",
	"ApplicationParameterValidationError",
	"AuthError",
	"AuthInvalidCredentialsError",
	"AuthSessionNotValidError",
	"AuthTooManyAttemptsError",
	"BIMModelContentNotFoundError",
	"BIMModelError",
	"BIMModelNotFoundError",
	"BIMModelValidationError",
	"FileStorageError",
	"PermissionDeniedError",
	"PersistenceError",
	"UserAlreadyExistsError",
	"UserError",
	"UserNotFoundError",
	"UserPasswordValidationError",
	"UserProtectedError",
	"UserSelfDeletionError",
	"UserValidationError",
	"VisualizationError",
	"VisualizationNotFoundError",
	"VisualizationValidationError",
];
