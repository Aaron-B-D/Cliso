from typing import Annotated, Any, ClassVar;

from fastapi import APIRouter, Depends, Path, Request, Response;
from fastapi.responses import FileResponse;

from app.adapters.inbound.rest import BIMModelDto, BIMModelMapper, SessionDependency;
from app.application.ports.inbound import AuthServiceBase, BIMModelServiceBase;
from app.domain.models import Session;


class BIMModelRouter:
	"""Endpoints de los modelos BIM y de sus ficheros IFC.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación. Todos los
	endpoints exigen una sesión válida y actúan en nombre de su usuario: responden 403 si su rol no permite la operación.
	"""

	# region PRIVATE CONSTANTS

	_MAX_ID: ClassVar[int] = 2**63 - 1;
	"""Mayor identificador posible: el máximo de un `long` (64 bits con signo, `BIGINT`), el tipo de la columna `id`."""

	_DOWNLOAD_CHUNK_SIZE: ClassVar[int] = 1024 * 1024;
	"""Tamaño, en bytes, de cada trozo con el que se envía un fichero IFC en la descarga (1 MiB). Los ficheros pueden llegar a los gigas: con el tamaño por defecto (64 KiB) la descarga es más lenta."""

	_UPLOAD_BODY: Any = {
		"requestBody": {
			"required": True,
			"content": {"application/octet-stream": {"schema": {"type": "string", "format": "binary"}}},
		}
	};
	"""Descripción del cuerpo de la subida del fichero para la documentación automática (el cuerpo se lee como flujo, no como modelo)."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create(service: BIMModelServiceBase, auth_service: AuthServiceBase) -> APIRouter:
		"""Crea el router de los modelos BIM.

		Args:
			service: Servicio de modelos BIM que usan sus endpoints.
			auth_service: Servicio de autenticación con el que se exige una sesión válida en todos sus endpoints.

		Returns:
			El router, listo para incluirlo en la aplicación.
		"""
		# La sesión se pide dos veces a propósito (FastAPI ejecuta la dependencia una sola vez por petición):
		# - En el router: todo endpoint, también uno nuevo que olvide el parámetro `session`, exige sesión (401 sin ella).
		# - En cada endpoint: entrega la `Session` al servicio, que comprueba el permiso. Un `dependencies` de router no
		#   puede entregar el valor al endpoint. Un endpoint nuevo copia este patrón.
		require_session = SessionDependency(auth_service).require_session;
		router = APIRouter(prefix="/bim-models", tags=["Modelos BIM"], dependencies=[Depends(require_session)]);

		@router.get("")
		def get_bim_models(session: Annotated[Session, Depends(require_session)]) -> list[BIMModelDto]:
			"""Devuelve todos los modelos BIM activos.

			Args:
				session: Sesión del usuario que los pide.

			Returns:
				Los modelos activos.
			"""
			return [BIMModelMapper.to_dto(model) for model in service.get_bim_models(session)];

		@router.get("/{model_id}")
		def get_bim_model(
			session: Annotated[Session, Depends(require_session)],
			model_id: Annotated[int, Path(ge=1, le=BIMModelRouter._MAX_ID)],
		) -> BIMModelDto:
			"""Devuelve el modelo BIM activo con ese identificador. Responde 404 si no existe.

			Args:
				session: Sesión del usuario que lo pide.
				model_id: Identificador del modelo.

			Returns:
				El modelo encontrado.
			"""
			return BIMModelMapper.to_dto(service.get_bim_model(session, model_id));

		@router.post("", status_code=201)
		def add_bim_model(session: Annotated[Session, Depends(require_session)], dto: BIMModelDto) -> BIMModelDto:
			"""Añade un modelo BIM con sus datos básicos (nombre, descripción y observaciones). Responde 400 si el nombre no es válido.

			El fichero IFC se sube después, con `PUT /bim-models/{model_id}/content`.

			Args:
				session: Sesión del usuario que lo crea.
				dto: Datos del modelo. `id`, `file_name` y `creation_date` se ignoran: los asigna el sistema.

			Returns:
				El modelo creado, con su identificador.
			"""
			return BIMModelMapper.to_dto(service.add_bim_model(session, BIMModelMapper.to_domain(dto, "")));

		@router.put("/{model_id}")
		def update_bim_model(
			session: Annotated[Session, Depends(require_session)],
			model_id: Annotated[int, Path(ge=1, le=BIMModelRouter._MAX_ID)],
			dto: BIMModelDto,
		) -> BIMModelDto:
			"""Modifica el nombre, la descripción y las observaciones de un modelo BIM. Responde 404 si no existe y 400 si el nombre no es válido.

			No toca el fichero IFC.

			Args:
				session: Sesión del usuario que lo modifica.
				model_id: Identificador del modelo.
				dto: Datos nuevos. Solo se usan `name`, `description` y `observations`.

			Returns:
				El modelo modificado.
			"""
			return BIMModelMapper.to_dto(service.update_bim_model(session, model_id, BIMModelMapper.to_domain(dto, "")));

		@router.put("/{model_id}/content", openapi_extra=BIMModelRouter._UPLOAD_BODY)
		async def set_content(
			session: Annotated[Session, Depends(require_session)],
			model_id: Annotated[int, Path(ge=1, le=BIMModelRouter._MAX_ID)],
			file_name: str,
			request: Request,
		) -> BIMModelDto:
			"""Sube el fichero IFC de un modelo BIM, enviado como cuerpo binario de la petición y recibido por trozos.

			Si el modelo ya tenía fichero, lo sustituye. Responde 404 si el modelo no existe y 400 si el nombre del
			fichero no es válido.

			Args:
				session: Sesión del usuario que sube el fichero.
				model_id: Identificador del modelo.
				file_name: Nombre original del fichero (debe acabar en `.ifc`).
				request: Petición, de la que se lee el cuerpo por trozos.

			Returns:
				El modelo, con el nombre del fichero ya actualizado.
			"""
			return BIMModelMapper.to_dto(await service.set_content(session, model_id, file_name, request.stream()));

		@router.get("/{model_id}/content")
		def get_content(
			session: Annotated[Session, Depends(require_session)],
			model_id: Annotated[int, Path(ge=1, le=BIMModelRouter._MAX_ID)],
		) -> FileResponse:
			"""Descarga el fichero IFC de un modelo BIM, enviado por trozos. Responde 404 si no existe el modelo o no tiene fichero.

			Args:
				session: Sesión del usuario que descarga el fichero.
				model_id: Identificador del modelo.

			Returns:
				El fichero, como descarga con el nombre original.
			"""
			wrapper = service.get_bim_model(session, model_id);
			path = service.get_content_path(session, model_id);
			response = FileResponse(path, media_type="application/octet-stream", filename=wrapper.file_name);
			response.chunk_size = BIMModelRouter._DOWNLOAD_CHUNK_SIZE;
			return response;

		@router.delete("/{model_id}", status_code=204)
		def delete_bim_model(
			session: Annotated[Session, Depends(require_session)],
			model_id: Annotated[int, Path(ge=1, le=BIMModelRouter._MAX_ID)],
			force: bool = False,
		) -> Response:
			"""Elimina un modelo BIM. Responde 404 si no existe.

			Por defecto el borrado es lógico: el modelo queda inactivo y se conservan sus datos, sus visualizaciones y su
			fichero. Con `force=true` se borran de verdad el modelo, sus visualizaciones y su fichero.

			Args:
				session: Sesión del usuario que lo elimina.
				model_id: Identificador del modelo.
				force: True para borrar también los datos y el fichero.

			Returns:
				Respuesta vacía.
			"""
			service.delete_bim_model(session, model_id, force);
			return Response(status_code=204);

		return router;

	# endregion PUBLIC STATIC METHODS
