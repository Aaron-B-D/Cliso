from pydantic import BaseModel;


class ApplicationParameterModificationDto(BaseModel):
	"""DTO con el dato que se recibe por la API para modificar un parámetro de la aplicación. El tipo va en la ruta."""

	# region PUBLIC PROPERTIES

	value: str;
	"""Valor actual nuevo del parámetro, como texto."""

	# endregion PUBLIC PROPERTIES
