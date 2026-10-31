from dataclasses import dataclass;

from app.domain.models.application_parameter_type import ApplicationParameterType;


@dataclass(kw_only=True)
class ApplicationParameter:
	"""Parámetro de la aplicación guardado en base de datos, que se puede cambiar en caliente.

	Los valores son siempre texto: quien los usa los interpreta según el tipo de parámetro.
	"""

	# region PUBLIC PROPERTIES

	type: ApplicationParameterType;
	"""Tipo de parámetro: identifica de cuál se trata."""

	default_value: str;
	"""Valor con el que se creó el parámetro."""

	value: str;
	"""Valor actual del parámetro."""

	# endregion PUBLIC PROPERTIES
