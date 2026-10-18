"""Configuración de la aplicación: `Settings` (los valores), `SettingsManager` (los lee del JSON y los sirve),
`SettingsMapper` (los convierte en los parámetros públicos del dominio) y las excepciones de settings. Todo se
importa desde este namespace.

El orden de los imports importa: primero las excepciones y el enumerado de proveedores, que usan los settings y su gestor.
"""

from app.config.exceptions import SettingsError, SettingsFileError, SettingsValueError;
from app.config.database_provider import DatabaseProvider;
from app.config.settings import Settings;
from app.config.settings_manager import SettingsManager;
from app.config.settings_mapper import SettingsMapper;

__all__ = [
	"DatabaseProvider",
	"Settings",
	"SettingsError",
	"SettingsFileError",
	"SettingsManager",
	"SettingsMapper",
	"SettingsValueError",
];
