from enum import StrEnum;


class Permission(StrEnum):
	"""Permiso para hacer una operación en la aplicación. Qué permisos tiene cada rol lo decide la matriz de permisos."""

	# region PUBLIC CONSTANTS

	USERS_MANAGE = "USERS_MANAGE";
	"""Gestionar usuarios: consultarlos, crearlos, modificarlos y borrarlos."""

	APPLICATION_PARAMETERS_EDIT = "APPLICATION_PARAMETERS_EDIT";
	"""Modificar los parámetros de la aplicación (consultarlos puede cualquier usuario con sesión)."""

	BIM_MODELS_READ = "BIM_MODELS_READ";
	"""Consultar los modelos BIM y descargar sus ficheros."""

	BIM_MODELS_EDIT = "BIM_MODELS_EDIT";
	"""Crear y modificar modelos BIM, y subir sus ficheros."""

	BIM_MODELS_DELETE = "BIM_MODELS_DELETE";
	"""Borrar modelos BIM."""

	VISUALIZATIONS_VIEW_ANY = "VISUALIZATIONS_VIEW_ANY";
	"""Ver las visualizaciones privadas de otros usuarios (las públicas y las propias las ve cualquiera)."""

	VISUALIZATIONS_CREATE = "VISUALIZATIONS_CREATE";
	"""Crear visualizaciones."""

	VISUALIZATIONS_EDIT_OWN = "VISUALIZATIONS_EDIT_OWN";
	"""Modificar las visualizaciones propias."""

	VISUALIZATIONS_EDIT_ANY = "VISUALIZATIONS_EDIT_ANY";
	"""Modificar las visualizaciones de otros usuarios."""

	VISUALIZATIONS_DELETE_OWN = "VISUALIZATIONS_DELETE_OWN";
	"""Borrar las visualizaciones propias."""

	VISUALIZATIONS_DELETE_ANY = "VISUALIZATIONS_DELETE_ANY";
	"""Borrar las visualizaciones de otros usuarios."""

	# endregion PUBLIC CONSTANTS
