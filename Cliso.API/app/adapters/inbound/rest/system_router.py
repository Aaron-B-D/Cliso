from fastapi import APIRouter;

from app.adapters.inbound.rest import ApplicationSettingParameterDto, ApplicationSettingsDto, ApplicationSettingsMapper;
from app.application.ports.inbound import SettingsServiceBase;
from app.domain.models import ApplicationSettingParameter;


class SystemRouter:
	"""Endpoints de información del sistema.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create(service: SettingsServiceBase) -> APIRouter:
		"""Crea el router de información del sistema.

		Args:
			service: Servicio de configuración que usan sus endpoints.

		Returns:
			El router, listo para incluirlo en la aplicación.
		"""
		router = APIRouter(prefix="/settings", tags=["Sistema"]);

		@router.get("")
		def get_settings() -> ApplicationSettingsDto:
			"""Devuelve todos los parámetros públicos de la configuración de la aplicación.

			Returns:
				Los parámetros públicos de la configuración.
			"""
			return ApplicationSettingsMapper.to_dto(service.get_settings());

		@router.get("/{parameter}")
		def get_setting(parameter: ApplicationSettingParameter) -> ApplicationSettingParameterDto:
			"""Devuelve un parámetro público de la configuración. Responde 404 si no existe.

			Args:
				parameter: Identificador del parámetro (por ejemplo, LANGUAGE).

			Returns:
				El parámetro pedido.
			"""
			return ApplicationSettingsMapper.to_parameter_dto(service.get_setting(parameter));

		return router;

	# endregion PUBLIC STATIC METHODS
