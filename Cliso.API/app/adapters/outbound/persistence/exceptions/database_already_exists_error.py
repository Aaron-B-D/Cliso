from app.adapters.outbound.persistence.exceptions.database_error import DatabaseError;


class DatabaseAlreadyExistsError(DatabaseError):
	"""Se intentó crear una base de datos que ya existe."""
