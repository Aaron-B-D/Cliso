from app.application.exceptions.visualization.visualization_error import VisualizationError;


class VisualizationNotFoundError(VisualizationError):
	"""No existe la visualización con el identificador indicado."""
