from enum import StrEnum;


class SessionCookieSameSite(StrEnum):
	"""Política `SameSite` de la cookie de la sesión: decide en qué peticiones la envía el navegador, según dónde esté alojada la web."""

	# region PUBLIC CONSTANTS

	LAX = "lax";
	"""La web y la API están en el mismo sitio (el mismo dominio, aunque sea en puertos distintos, o detrás de un mismo proxy). Es la política por defecto."""

	STRICT = "strict";
	"""Como `lax`, pero el navegador tampoco envía la cookie al llegar a la web desde un enlace de otro sitio."""

	NONE = "none";
	"""La web y la API están en sitios distintos (dominios distintos). El navegador exige https: la cookie se marca siempre como `Secure`."""

	# endregion PUBLIC CONSTANTS
