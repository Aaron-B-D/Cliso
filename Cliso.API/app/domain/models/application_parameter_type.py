from enum import StrEnum;


class ApplicationParameterType(StrEnum):
	"""Tipo de parámetro de la aplicación guardado en la tabla `application_parameter`: identifica de cuál se trata."""

	# region PUBLIC CONSTANTS

	LANGUAGE = "LANGUAGE";
	"""Idioma de la aplicación, como código internacional (por ejemplo, es-ES)."""

	BIM_MODELS_DIRECTORY = "BIM_MODELS_DIRECTORY";
	"""Carpeta donde se guardan los ficheros IFC de los modelos BIM."""

	# endregion PUBLIC CONSTANTS
