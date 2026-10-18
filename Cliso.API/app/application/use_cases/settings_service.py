from app.application.exceptions import SettingNotFoundError;
from app.application.ports.inbound import SettingsServiceBase;
from app.domain.models import ApplicationSetting, ApplicationSettingParameter;


class SettingsService(SettingsServiceBase):
	"""Caso de uso de la configuración: sirve los parámetros públicos con los que ha arrancado la aplicación."""

	# region CONSTRUCTOR

	def __init__(self, settings: list[ApplicationSetting]) -> None:
		"""Crea el servicio.

		Args:
			settings: Parámetros públicos de la configuración. Es lo único de la configuración que conoce el servicio.
		"""
		self._settings = {setting.parameter: setting for setting in settings};
		"""Parámetros públicos, por su identificador."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_settings(self) -> list[ApplicationSetting]:
		"""Devuelve todos los parámetros públicos de la configuración.

		Returns:
			Los parámetros públicos de la configuración con la que ha arrancado la aplicación.
		"""
		return list(self._settings.values());

	def get_setting(self, parameter: ApplicationSettingParameter) -> ApplicationSetting:
		"""Devuelve un parámetro público de la configuración.

		Args:
			parameter: Identificador del parámetro.

		Returns:
			El parámetro pedido.

		Raises:
			SettingNotFoundError: Si ese parámetro no está en la configuración pública.
		"""
		setting = self._settings.get(parameter);
		if setting is None:
			raise SettingNotFoundError(f"No existe el parámetro de configuración '{parameter}'");
		return setting;

	# endregion PUBLIC METHODS
