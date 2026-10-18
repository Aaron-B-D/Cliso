"""Adaptadores de base de datos: el contrato `DatabaseAdapterBase` en la raíz y cada motor en su subcarpeta (`sqlite`, `mysql`)."""

from app.adapters.outbound.persistence.database_adapter.database_adapter_base import DatabaseAdapterBase;
from app.adapters.outbound.persistence.database_adapter.sqlite import SQLiteAdapter;
from app.adapters.outbound.persistence.database_adapter.mysql import MySQLAdapter;

__all__ = ["DatabaseAdapterBase", "MySQLAdapter", "SQLiteAdapter"];
