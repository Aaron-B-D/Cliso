from app.application.exceptions.visualization.visualization_error import VisualizationError;


class VisualizationForbiddenError(VisualizationError):
	"""El usuario de la sesión no puede hacer esa operación sobre la visualización (no es su propietario o su rol no lo permite)."""
