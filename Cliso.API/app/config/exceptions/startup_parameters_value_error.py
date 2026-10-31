from app.config.exceptions.startup_parameters_error import StartupParametersError;


class StartupParametersValueError(StartupParametersError):
	"""Un parámetro del fichero de configuración tiene un valor de un tipo distinto al esperado."""
