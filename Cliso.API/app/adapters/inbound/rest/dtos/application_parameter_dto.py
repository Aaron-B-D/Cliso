from pydantic import BaseModel;

from app.domain.models import ApplicationParameterType;


class ApplicationParameterDto(BaseModel):
	"""DTO de un parámetro de la aplicación: de qué tipo es y sus valores. Los textos para mostrarlo los pone quien lo consume."""

	# region PUBLIC PROPERTIES

	type: ApplicationParameterType;
	"""Tipo de parámetro: identifica de cuál se trata."""

	default_value: str;
	"""Valor con el que se creó el parámetro."""

	value: str;
	"""Valor actual del parámetro."""

	# endregion PUBLIC PROPERTIES
