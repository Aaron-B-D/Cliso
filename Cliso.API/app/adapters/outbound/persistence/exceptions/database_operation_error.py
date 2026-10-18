from app.adapters.outbound.persistence.exceptions.database_error import DatabaseError;


class DatabaseOperationError(DatabaseError):
	"""Falló una operación contra el motor de base de datos (conexión, SQL, permisos...)."""
