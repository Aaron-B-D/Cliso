"""Puertos de salida: lo que la aplicación necesita del exterior. Cada concepto (por ejemplo, `user_repository`) tiene su
directorio, con el contrato `*Base` en la raíz. Todo se importa desde este namespace."""

from app.application.ports.outbound.user_repository import UserRepositoryBase;

__all__ = ["UserRepositoryBase"];
