from pathlib import Path;
from typing import ClassVar;

from app.domain.models import BIMModel, User, UserRole;
from app.utils import PasswordUtils;


class DemoData:
	"""Datos de demostración (usuarios y modelos BIM), escritos como objetos de dominio.

	Clase estática: no se instancia. Cada modelo lleva el nombre de su fichero IFC, que está en la carpeta `demo_models`
	junto a este módulo.
	"""

	# region PUBLIC CONSTANTS

	OPERATOR_NICK: ClassVar[str] = "operator";
	"""Nick del primer operador demo."""

	OPERATOR2_NICK: ClassVar[str] = "operator2";
	"""Nick del segundo operador demo."""

	HOUSE_FILE: ClassVar[str] = "Ifc4_SampleHouse.ifc";
	"""Fichero del modelo «Casa de muestra»."""

	DUPLEX_FILE: ClassVar[str] = "Ifc2x3_Duplex_Architecture.ifc";
	"""Fichero del modelo «Edificio dúplex»."""

	HUB_FILE: ClassVar[str] = "Ifc4_DigitalHub_Architecture.ifc";
	"""Fichero del modelo «Digital Hub»."""

	WELLNESS_FILE: ClassVar[str] = "Ifc2x3_WellnessCenter_Sama.ifc";
	"""Fichero del modelo «Centro de bienestar Sama»."""

	# endregion PUBLIC CONSTANTS

	# region PRIVATE CONSTANTS

	_FILES_DIRECTORY: ClassVar[Path] = Path(__file__).resolve().parent / "demo_models";
	"""Carpeta con los ficheros IFC de los modelos demo."""

	_VIEWER_NICK: ClassVar[str] = "viewer";
	"""Nick del visor demo."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def get_users() -> list[User]:
		"""Devuelve los usuarios de demostración, sin guardar (sin `id`): dos operadores y un visor.

		El administrador no está aquí: lo crea el inicializador con los datos básicos. La contraseña de cada usuario demo es
		su propio nick, guardada hasheada. No pasan por las reglas de contraseña del servicio de usuarios: son datos de
		demostración.

		Returns:
			Los usuarios demo.
		"""
		return [
			User(
				nick=DemoData.OPERATOR_NICK,
				name="Operador",
				surname="Demo",
				password=PasswordUtils.hash(DemoData.OPERATOR_NICK),
				role=UserRole.OPERATOR,
			),
			User(
				nick=DemoData.OPERATOR2_NICK,
				name="Operador 2",
				surname="Demo",
				password=PasswordUtils.hash(DemoData.OPERATOR2_NICK),
				role=UserRole.OPERATOR,
			),
			User(
				nick=DemoData._VIEWER_NICK,
				name="Visor",
				surname="Demo",
				password=PasswordUtils.hash(DemoData._VIEWER_NICK),
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
				file_name=DemoData.HOUSE_FILE,
				stored_file_name="demo_ifc4_sample_house.ifc",
			),
			BIMModel(
				name="Edificio dúplex",
				description="Edificio de dos viviendas, modelo de arquitectura (IFC 2x3).",
				file_name=DemoData.DUPLEX_FILE,
				stored_file_name="demo_ifc2x3_duplex_architecture.ifc",
			),
			BIMModel(
				name="Digital Hub",
				description="Edificio de oficinas con sótano y dos plantas, modelo de arquitectura para gestión de instalaciones (IFC 4).",
				file_name=DemoData.HUB_FILE,
				stored_file_name="demo_ifc4_digital_hub_architecture.ifc",
			),
			BIMModel(
				name="Centro de bienestar Sama",
				description="Centro de bienestar de cinco niveles, modelo de arquitectura (IFC 2x3). Modelo grande, para ver la carga.",
				file_name=DemoData.WELLNESS_FILE,
				stored_file_name="demo_ifc2x3_wellness_center_sama.ifc",
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
