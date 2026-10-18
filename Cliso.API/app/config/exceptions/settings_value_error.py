from app.config.exceptions.settings_error import SettingsError;


class SettingsValueError(SettingsError):
	"""Un setting del fichero tiene un valor de un tipo distinto al esperado."""
