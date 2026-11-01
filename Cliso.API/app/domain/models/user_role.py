from enum import StrEnum;


class UserRole(StrEnum):
	"""Rol de un usuario, guardado en la columna `role` de la tabla `user`: define qué puede hacer en la aplicación."""

	# region PUBLIC CONSTANTS

	ADMIN = "ADMIN";
	"""Administrador: ve todo y gestiona modelos, usuarios, parámetros de la aplicación, etc."""

	OPERATOR = "OPERATOR";
	"""Operador: edita sus visualizaciones y hace todo lo operativo de los modelos BIM, pero no gestiona usuarios ni parámetros."""

	VIEWER = "VIEWER";
	"""Visor: solo consulta las visualizaciones públicas a las que se le da acceso, sin modificar nada."""

	# endregion PUBLIC CONSTANTS
