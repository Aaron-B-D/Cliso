from app.application.exceptions.bim_model_error import BIMModelError;


class BIMModelNotFoundError(BIMModelError):
	"""No existe el modelo BIM con el identificador indicado."""
