from enum import StrEnum;


class PasswordRequirement(StrEnum):
	"""Requisito mínimo que debe cumplir una contraseña. Su valor es el código que recibe el cliente para explicar qué falla."""

	# region PUBLIC CONSTANTS

	MIN_LENGTH = "MIN_LENGTH";
	"""Tener la longitud mínima."""

	UPPERCASE = "UPPERCASE";
	"""Incluir una letra mayúscula."""

	LOWERCASE = "LOWERCASE";
	"""Incluir una letra minúscula."""

	DIGIT = "DIGIT";
	"""Incluir un número."""

	SYMBOL = "SYMBOL";
	"""Incluir un símbolo (un carácter que no es letra ni número)."""

	# endregion PUBLIC CONSTANTS
