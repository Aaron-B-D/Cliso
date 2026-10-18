"""Repositorios de usuarios: una implementación por motor de base de datos (`sqlite`, `mysql`)."""

from app.adapters.outbound.persistence.user_repository.sqlite import SQLiteUserRepository;
from app.adapters.outbound.persistence.user_repository.mysql import MySQLUserRepository;

__all__ = ["MySQLUserRepository", "SQLiteUserRepository"];
