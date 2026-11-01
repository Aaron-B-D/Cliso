from app.application.exceptions.visualization.visualization_error import VisualizationError;


class VisualizationValidationError(VisualizationError):
	"""Los datos recibidos de una visualización no son válidos (nombre vacío o demasiado largo...)."""
