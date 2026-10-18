from enum import StrEnum;


class ApplicationSettingParameter(StrEnum):
	"""Identifica cada parámetro público de la configuración de la aplicación."""

	# region PUBLIC CONSTANTS

	LANGUAGE = "LANGUAGE";
	"""Idioma de arranque de la aplicación, como código internacional (por ejemplo, es-ES)."""

	IS_DEMO = "IS_DEMO";
	"""Indica si la aplicación ha arrancado en modo demo."""

	# endregion PUBLIC CONSTANTS
