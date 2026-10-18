from app.config.exceptions.settings_error import SettingsError;


class SettingsFileError(SettingsError):
	"""El fichero de settings no se puede leer, no es un JSON válido o no contiene un objeto."""
