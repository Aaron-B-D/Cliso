from pathlib import Path;
from typing import ClassVar;

from app.domain.models import BIMModel, User, UserRole;
from app.utils import PasswordUtils;


class DemoData:
	"""Datos de demostración, escritos como objetos de dominio.

	Clase estática: no se instancia. Cada modelo lleva el nombre de su fichero IFC, que está en la carpeta `demo_models`
	junto a este módulo.
	"""

	# region PRIVATE CONSTANTS

	_FILES_DIRECTORY: ClassVar[Path] = Path(__file__).resolve().parent / "demo_models";
	"""Carpeta con los ficheros IFC de los modelos demo."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def get_users() -> list[User]:
		"""Devuelve los usuarios de demostración, sin guardar (sin `id`), uno por cada rol salvo el administrador.

		La contraseña de cada uno es su propio nick, guardada hasheada. No pasan por las reglas de contraseña del
		servicio de usuarios: son datos de demostración.

		Returns:
			Los usuarios demo.
		"""
		return [
			User(
				nick="operator",
				name="Operador",
				surname="Demo",
				password=PasswordUtils.hash("operator"),
				role=UserRole.OPERATOR,
			),
			User(
				nick="viewer",
				name="Visor",
				surname="Demo",
				password=PasswordUtils.hash("viewer"),
				role=UserRole.VIEWER,
			),
		];

	@staticmethod
	def get_bim_models() -> list[BIMModel]:
		"""Devuelve los modelos BIM de demostración, sin guardar (sin `id`).

		Cada modelo lleva un nombre de fichero guardado fijo (no aleatorio): así, cada base de datos demo nueva vuelve a
		usar los mismos ficheros en disco en lugar de acumular copias.

		Returns:
			Los modelos demo.
		"""
		return [
			BIMModel(
				name="Casa de muestra",
				description="Vivienda unifamiliar de ejemplo (IFC 4).",
				file_name="Ifc4_SampleHouse.ifc",
				stored_file_name="demo_ifc4_sample_house.ifc",
			),
			BIMModel(
				name="Edificio dúplex",
				description="Edificio de dos viviendas, modelo de arquitectura (IFC 2x3).",
				file_name="Ifc2x3_Duplex_Architecture.ifc",
				stored_file_name="demo_ifc2x3_duplex_architecture.ifc",
			),
		];

	@staticmethod
	def get_bim_model_file_path(model: BIMModel) -> Path:
		"""Devuelve la ruta del fichero IFC de un modelo demo.

		Args:
			model: Modelo demo (uno de los que devuelve `get_bim_models`).

		Returns:
			La ruta del fichero, que se llama como el `file_name` del modelo.
		"""
		return DemoData._FILES_DIRECTORY / model.file_name;

	# endregion PUBLIC STATIC METHODS
