from fastapi import APIRouter;

from app.adapters.inbound.rest.dtos import ApplicationParameterDto, ApplicationParametersDto;
from app.adapters.inbound.rest.mappers import ApplicationParameterMapper;
from app.application.ports.inbound import ApplicationParameterServiceBase;
from app.domain.models import ApplicationParameterType;


class ApplicationParameterRouter:
	"""Endpoints de los parámetros de la aplicación.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create(service: ApplicationParameterServiceBase) -> APIRouter:
		"""Crea el router de los parámetros de la aplicación.

		Args:
			service: Servicio de parámetros que usan sus endpoints.

		Returns:
			El router, listo para incluirlo en la aplicación.
		"""
		router = APIRouter(prefix="/application-parameters", tags=["Parámetros de la aplicación"]);

		@router.get("")
		def get_parameters() -> ApplicationParametersDto:
			"""Devuelve todos los parámetros de la aplicación.

			Returns:
				Los parámetros de la aplicación, con su valor actual.
			"""
			return ApplicationParameterMapper.to_dto(service.get_parameters());

		@router.get("/{parameter_type}")
		def get_parameter(parameter_type: ApplicationParameterType) -> ApplicationParameterDto:
			"""Devuelve un parámetro de la aplicación. Responde 404 si no existe.

			Args:
				parameter_type: Tipo del parámetro (por ejemplo, LANGUAGE).

			Returns:
				El parámetro pedido.
			"""
			return ApplicationParameterMapper.to_parameter_dto(service.get_parameter(parameter_type));

		return router;

	# endregion PUBLIC STATIC METHODS
