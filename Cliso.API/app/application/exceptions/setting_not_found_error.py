from app.application.exceptions.setting_error import SettingError;


class SettingNotFoundError(SettingError):
	"""No existe el parámetro de configuración pedido."""
