from dataclasses import dataclass;

from app.domain.models import BIMModel;


@dataclass(kw_only=True)
class BIMModelWrapper(BIMModel):
	"""Un modelo BIM con las mismas propiedades que se guardan en su tabla y datos extra, calculados al consultarlo."""

	# region PUBLIC PROPERTIES

	file_size: int;
	"""Tamaño, en bytes, del fichero IFC guardado. Es 0 si el modelo todavía no tiene fichero."""

	# endregion PUBLIC PROPERTIES
