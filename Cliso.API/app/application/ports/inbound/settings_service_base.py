from abc import ABC, abstractmethod;

from app.domain.models import ApplicationSetting, ApplicationSettingParameter;


class SettingsServiceBase(ABC):
	"""Contrato del servicio de configuración: lo que se puede pedir a la aplicación sobre sus parámetros públicos."""

	# region PUBLIC METHODS

	@abstractmethod
	def get_settings(self) -> list[ApplicationSetting]:
		"""Devuelve todos los parámetros públicos de la configuración.

		Returns:
			Los parámetros públicos de la configuración con la que ha arrancado la aplicación.
		"""

	@abstractmethod
	def get_setting(self, parameter: ApplicationSettingParameter) -> ApplicationSetting:
		"""Devuelve un parámetro público de la configuración.

		Args:
			parameter: Identificador del parámetro.

		Returns:
			El parámetro pedido.

		Raises:
			SettingNotFoundError: Si ese parámetro no está en la configuración pública.
		"""

	# endregion PUBLIC METHODS
