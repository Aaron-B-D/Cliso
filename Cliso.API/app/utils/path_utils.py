from pathlib import Path;
from typing import ClassVar;


class PathUtils:
	"""Utilidades para calcular rutas.

	Clase estática: no se instancia.
	"""

	# region PUBLIC CONSTANTS

	API_ROOT: ClassVar[Path] = Path(__file__).resolve().parents[2];
	"""Carpeta raíz de Cliso.API. Las rutas relativas de la aplicación se resuelven desde aquí."""

	# endregion PUBLIC CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def resolve(value: str) -> Path:
		"""Convierte una ruta en absoluta.

		Args:
			value: Ruta absoluta, o relativa a la carpeta Cliso.API.

		Returns:
			La ruta absoluta.
		"""
		path = Path(value);
		if not path.is_absolute():
			path = PathUtils.API_ROOT / path;
		return path;

	# endregion PUBLIC STATIC METHODS
