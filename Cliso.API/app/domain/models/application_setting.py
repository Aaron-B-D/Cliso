from dataclasses import dataclass;

from app.domain.models.application_setting_parameter import ApplicationSettingParameter;


@dataclass(kw_only=True)
class ApplicationSetting:
	"""Objeto que representa un parámetro público de la configuración de la aplicación."""

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
