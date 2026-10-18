"""Excepciones de la capa de aplicación: las que forman parte del contrato de los puertos (fallo de almacenamiento,
usuario o parámetro de configuración no encontrado). Todo se importa desde este namespace."""

from app.application.exceptions.persistence_error import PersistenceError;
from app.application.exceptions.setting_error import SettingError;
from app.application.exceptions.setting_not_found_error import SettingNotFoundError;
from app.application.exceptions.user_error import UserError;
from app.application.exceptions.user_not_found_error import UserNotFoundError;

__all__ = ["PersistenceError", "SettingError", "SettingNotFoundError", "UserError", "UserNotFoundError"];
