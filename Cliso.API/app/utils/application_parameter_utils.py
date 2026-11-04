import re;
from typing import ClassVar;


class ApplicationParameterUtils:
	"""Comprobaciones comunes sobre el texto de un valor, para validar los parámetros de la aplicación.

	Clase estática: no se instancia. Cada comprobación solo dice si el valor las cumple (True o False): quien las usa
	decide qué hacer si no.
	"""

	# region PRIVATE CONSTANTS

	_LANGUAGE_PATTERN: ClassVar[re.Pattern[str]] = re.compile(r"[a-z]{2}-[A-Z]{2}");
	"""Forma de un código de idioma: dos letras minúsculas, un guion y dos mayúsculas (por ejemplo, es-ES)."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def is_positive_integer(value: str) -> bool:
		"""Dice si el texto es un número entero mayor que cero, escrito solo con dígitos (sin signo, espacios ni decimales).

		Args:
			value: Texto que se comprueba.

		Returns:
			True si es un entero mayor que cero; False si no.
		"""
		is_number = value.isascii() and value.isdigit();
		return is_number and int(value) > 0;

	@staticmethod
	def is_language_code(value: str) -> bool:
		"""Dice si el texto es un código de idioma, como es-ES.

		Args:
			value: Texto que se comprueba.

		Returns:
			True si tiene la forma de un código de idioma; False si no.
		"""
		return ApplicationParameterUtils._LANGUAGE_PATTERN.fullmatch(value) is not None;

	@staticmethod
	def has_surrounding_spaces(value: str) -> bool:
		"""Dice si el texto empieza o acaba con espacios (u otros caracteres en blanco).

		Args:
			value: Texto que se comprueba.

		Returns:
			True si tiene espacios al principio o al final; False si no.
		"""
		return value != value.strip();

	@staticmethod
	def is_blank(value: str) -> bool:
		"""Dice si el texto está vacío o solo tiene espacios.

		Args:
			value: Texto que se comprueba.

		Returns:
			True si está vacío o en blanco; False si tiene algún carácter visible.
		"""
		return value.strip() == "";

	# endregion PUBLIC STATIC METHODS
