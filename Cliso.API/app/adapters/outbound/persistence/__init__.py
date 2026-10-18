"""Persistencia: acceso a la base de datos. Todo se importa desde este namespace.

Cada concepto tiene su directorio: `exceptions` (los errores de base de datos), `database_row` y `database_cursor`
(la fila y el cursor de una consulta, cada uno con su contrato `*Base`), `database_connection` (la conexión
con su contrato `*Base`), `database_connection_provider` (quien entrega conexiones, con su contrato `*Base`),
`database_adapter` (el adaptador de cada motor: `sqlite`, `mysql`) y `user_repository` (el repositorio de usuarios
de cada motor).
El orden de los imports importa: primero las excepciones, que usan todos; luego la fila, el cursor, la conexión y el
proveedor de conexiones, los adaptadores (que son proveedores de conexiones) y, por último, los repositorios, que usan el
proveedor.
"""

from app.adapters.outbound.persistence.exceptions import (
	DatabaseAlreadyExistsError,
	DatabaseError,
	DatabaseNotFoundError,
	DatabaseOperationError,
);
from app.adapters.outbound.persistence.database_row import DatabaseRowBase;
from app.adapters.outbound.persistence.database_cursor import DatabaseCursorBase;
from app.adapters.outbound.persistence.database_connection import DatabaseConnectionBase;
from app.adapters.outbound.persistence.database_connection_provider import DatabaseConnectionProviderBase;
from app.adapters.outbound.persistence.database_adapter import DatabaseAdapterBase, MySQLAdapter, SQLiteAdapter;
from app.adapters.outbound.persistence.user_repository import MySQLUserRepository, SQLiteUserRepository;

__all__ = [
	"DatabaseAdapterBase",
	"DatabaseAlreadyExistsError",
	"DatabaseConnectionBase",
	"DatabaseConnectionProviderBase",
	"DatabaseCursorBase",
	"DatabaseError",
	"DatabaseNotFoundError",
	"DatabaseOperationError",
	"DatabaseRowBase",
	"MySQLAdapter",
	"MySQLUserRepository",
	"SQLiteAdapter",
	"SQLiteUserRepository",
];
