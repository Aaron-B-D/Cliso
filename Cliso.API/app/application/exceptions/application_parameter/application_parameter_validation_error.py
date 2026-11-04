from app.application.exceptions.application_parameter.application_parameter_error import ApplicationParameterError;


class ApplicationParameterValidationError(ApplicationParameterError):
	"""El valor recibido no es válido para el tipo del parámetro de la aplicación (por ejemplo, un texto donde se espera un número)."""
