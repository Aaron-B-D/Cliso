from pydantic import BaseModel;

from app.adapters.inbound.rest.dtos.application_setting_parameter_dto import ApplicationSettingParameterDto;


class ApplicationSettingsDto(BaseModel):
	"""DTO con la configuración de la aplicación que expone la API: una lista de parámetros."""

	# region PUBLIC PROPERTIES

	parameters: list[ApplicationSettingParameterDto];
	"""Parámetros de configuración de la aplicación."""

	# endregion PUBLIC PROPERTIES
