import shutil;
from pathlib import Path;
from typing import ClassVar;


class FileUtils:
	"""Utilidades para trabajar con carpetas y ficheros del disco.

	Clase estática: no se instancia. Los fallos del sistema de ficheros se escapan como `OSError`: quien llama decide
	cómo traducirlos.
	"""

	# region PRIVATE CONSTANTS

	_ENCODING: ClassVar[str] = "utf-8";
	"""Codificación de los ficheros de texto."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create_directory(directory: Path) -> None:
		"""Crea una carpeta, con las que falten por encima. Si ya existe, no hace nada.

		Args:
			directory: Carpeta que debe existir.

		Raises:
			OSError: Si no se puede crear.
		"""
		directory.mkdir(parents=True, exist_ok=True);

	@staticmethod
	def copy(source: Path, destination: Path) -> None:
		"""Copia un fichero. Si el destino ya existe, lo sustituye.

		Args:
			source: Fichero a copiar.
			destination: Ruta de la copia (la carpeta debe existir).

		Raises:
			OSError: Si no se puede copiar.
		"""
		shutil.copyfile(source, destination);

	@staticmethod
	def delete(path: Path) -> None:
		"""Borra un fichero. Si no existe, no hace nada.

		Args:
			path: Fichero a borrar.

		Raises:
			OSError: Si no se puede borrar (por ejemplo, porque está en uso).
		"""
		path.unlink(missing_ok=True);

	@staticmethod
	def read_text(path: Path) -> str:
		"""Lee un fichero de texto.

		Args:
			path: Fichero a leer.

		Returns:
			El contenido del fichero.

		Raises:
			OSError: Si no se puede leer.
		"""
		return path.read_text(encoding=FileUtils._ENCODING);

	# endregion PUBLIC STATIC METHODS
