from app.adapters.inbound.rest.dtos import ApplicationParameterDto, ApplicationParametersDto;
from app.domain.models import ApplicationParameter;


class ApplicationParameterMapper:
	"""Convierte, campo a campo, los parámetros de la aplicación de dominio en sus DTOs.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(parameters: list[ApplicationParameter]) -> ApplicationParametersDto:
		"""Convierte una lista de parámetros de la aplicación en su DTO, para responder por la API.

		Args:
			parameters: Parámetros de la aplicación de dominio.

		Returns:
			El DTO con todos los parámetros.
		"""
		return ApplicationParametersDto(
			parameters=[ApplicationParameterMapper.to_parameter_dto(parameter) for parameter in parameters],
		);

	@staticmethod
	def to_parameter_dto(parameter: ApplicationParameter) -> ApplicationParameterDto:
		"""Convierte un parámetro de la aplicación de dominio en su DTO, para responder por la API.

		Args:
			parameter: Parámetro de la aplicación de dominio.

		Returns:
			El DTO del parámetro.
		"""
		return ApplicationParameterDto(
			type=parameter.type,
			default_value=parameter.default_value,
			value=parameter.value,
		);

	# endregion PUBLIC STATIC METHODS
