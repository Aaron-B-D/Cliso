from pydantic import BaseModel;

from app.adapters.inbound.rest.dtos.application_parameter_dto import ApplicationParameterDto;


class ApplicationParametersDto(BaseModel):
	"""DTO con los parámetros de la aplicación que expone la API."""

	# region PUBLIC PROPERTIES

	parameters: list[ApplicationParameterDto];
	"""Parámetros de la aplicación."""

	# endregion PUBLIC PROPERTIES
