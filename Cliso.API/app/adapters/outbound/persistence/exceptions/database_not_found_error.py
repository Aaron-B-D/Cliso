from app.adapters.outbound.persistence.exceptions.database_error import DatabaseError;


class DatabaseNotFoundError(DatabaseError):
	"""Se intentó borrar, cargar o usar una base de datos que no existe."""
