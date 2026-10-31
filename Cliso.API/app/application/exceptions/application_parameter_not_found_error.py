from app.application.exceptions.application_parameter_error import ApplicationParameterError;


class ApplicationParameterNotFoundError(ApplicationParameterError):
	"""No existe el parámetro de la aplicación pedido."""
