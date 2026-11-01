from app.application.exceptions.bim_model.bim_model_error import BIMModelError;


class BIMModelContentNotFoundError(BIMModelError):
	"""El modelo BIM existe, pero todavía no tiene fichero asociado."""
