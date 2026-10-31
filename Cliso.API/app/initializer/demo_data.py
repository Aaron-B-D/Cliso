from app.domain.models import BIMModel;


class DemoData:
	"""Datos de demostración, escritos como objetos de dominio.

	Clase estática: no se instancia. Los modelos no tienen fichero IFC (`file_name` vacío) hasta que se sube uno.
	"""

	# region PUBLIC STATIC METHODS

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
