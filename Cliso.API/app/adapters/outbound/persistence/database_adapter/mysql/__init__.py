"""Base de datos MySQL: en un servidor, para instalaciones que lo necesiten."""

from app.adapters.outbound.persistence.database_adapter.mysql.mysql_adapter import MySQLAdapter;

__all__ = ["MySQLAdapter"];
