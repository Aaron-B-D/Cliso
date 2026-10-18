"""Base de datos SQLite: un fichero local, sin servidor. Es el proveedor por defecto."""

from app.adapters.outbound.persistence.database_adapter.sqlite.sqlite_adapter import SQLiteAdapter;

__all__ = ["SQLiteAdapter"];
