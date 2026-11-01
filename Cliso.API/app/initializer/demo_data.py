from app.domain.models import BIMModel, User, UserRole;
from app.utils import PasswordUtils;


class DemoData:
	"""Datos de demostración, escritos como objetos de dominio.

	Clase estática: no se instancia. Los modelos no tienen fichero IFC (`file_name` vacío) hasta que se sube uno.
	"""

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

		Returns:
			Los modelos demo.
		"""
		return [
			BIMModel(
				name="Edificio de oficinas",
				description="Modelo BIM de ejemplo de un edificio de oficinas.",
				file_name="",
			),
			BIMModel(
				name="Puente peatonal",
				description="Modelo BIM de ejemplo de un puente peatonal.",
				file_name="",
			),
		];

	# endregion PUBLIC STATIC METHODS
