from app.config.exceptions.startup_parameters_error import StartupParametersError;


class StartupParametersFileError(StartupParametersError):
	"""El fichero de configuración no se puede leer, no es un JSON válido o no contiene un objeto."""
