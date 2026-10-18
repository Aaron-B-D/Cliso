from app.adapters.inbound.rest import ApplicationSettingParameterDto, ApplicationSettingsDto;
from app.domain.models import ApplicationSetting;


class ApplicationSettingsMapper:
	"""Convierte, campo a campo, los parámetros de configuración de dominio en sus DTOs.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(settings: list[ApplicationSetting]) -> ApplicationSettingsDto:
		"""Convierte una lista de parámetros de configuración en su DTO, para responder por la API.

		Args:
			settings: Parámetros de configuración de dominio.

		Returns:
			El DTO con todos los parámetros.
		"""
		return ApplicationSettingsDto(
			parameters=[ApplicationSettingsMapper.to_parameter_dto(setting) for setting in settings],
		);

	@staticmethod
	def to_parameter_dto(setting: ApplicationSetting) -> ApplicationSettingParameterDto:
		"""Convierte un parámetro de configuración de dominio en su DTO, para responder por la API.

		Args:
			setting: Parámetro de configuración de dominio.

		Returns:
			El DTO del parámetro.
		"""
		return ApplicationSettingParameterDto(
			parameter=setting.parameter,
			name=setting.name,
			description=setting.description,
			observations=setting.observations,
			value=setting.value,
		);

	# endregion PUBLIC STATIC METHODS
