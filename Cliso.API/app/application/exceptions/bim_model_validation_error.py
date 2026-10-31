from app.application.exceptions.bim_model_error import BIMModelError;


class BIMModelValidationError(BIMModelError):
	"""Los datos recibidos de un modelo BIM no son válidos (nombre vacío, nombre de fichero no admitido...)."""
