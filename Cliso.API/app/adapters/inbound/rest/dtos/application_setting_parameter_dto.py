from pydantic import BaseModel;

from app.domain.models import ApplicationSettingParameter;


class ApplicationSettingParameterDto(BaseModel):
	"""DTO de un parámetro de configuración de la aplicación: qué parámetro es, su nombre, qué hace y su valor."""

	# region PUBLIC PROPERTIES

	parameter: ApplicationSettingParameter;
	"""Identifica de qué parámetro se trata."""

	name: str;
	"""Nombre del parámetro, tal y como figura en la configuración."""

	description: str;
	"""Qué es y para qué sirve el parámetro."""

	observations: str;
	"""Observaciones adicionales sobre el parámetro (por ejemplo, cómo se cambia)."""

	value: str | int | bool;
	"""Valor del parámetro."""

	# endregion PUBLIC PROPERTIES
