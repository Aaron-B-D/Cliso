"""Puertos de entrada: lo que el exterior puede pedir a la aplicación (interfaces de los casos de uso)."""

from app.application.ports.inbound.settings_service_base import SettingsServiceBase;
from app.application.ports.inbound.user_service_base import UserServiceBase;

__all__ = ["SettingsServiceBase", "UserServiceBase"];
