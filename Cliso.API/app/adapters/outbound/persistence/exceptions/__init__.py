"""Excepciones de base de datos."""

from app.adapters.outbound.persistence.exceptions.database_error import DatabaseError;
from app.adapters.outbound.persistence.exceptions.database_already_exists_error import DatabaseAlreadyExistsError;
from app.adapters.outbound.persistence.exceptions.database_not_found_error import DatabaseNotFoundError;
from app.adapters.outbound.persistence.exceptions.database_operation_error import DatabaseOperationError;

__all__ = ["DatabaseAlreadyExistsError", "DatabaseError", "DatabaseNotFoundError", "DatabaseOperationError"];
