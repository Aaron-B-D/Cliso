from typing import Annotated, ClassVar;

from fastapi import APIRouter, Depends, Path, Query, Response;

from app.adapters.inbound.rest import SessionDependency, VisualizationDto, VisualizationMapper;
from app.application.ports.inbound import AuthServiceBase, VisualizationServiceBase;
from app.domain.models import Session;


class VisualizationRouter:
	"""Endpoints de las visualizaciones.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación. Todos los
	endpoints exigen una sesión válida y actúan en nombre de su usuario.
	"""

	# region PRIVATE CONSTANTS

	_MAX_ID: ClassVar[int] = 2**63 - 1;
	"""Mayor identificador posible: el máximo de un `long` (64 bits con signo, `BIGINT`), el tipo de la columna `id`."""

	_MAX_DEPTH: ClassVar[int] = 1;
	"""Mayor profundidad admitida al recuperar visualizaciones: 0 sin piezas, 1 con todas sus piezas."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create(service: VisualizationServiceBase, auth_service: AuthServiceBase) -> APIRouter:
		"""Crea el router de las visualizaciones.

		Args:
			service: Servicio de visualizaciones que usan sus endpoints.
			auth_service: Servicio de autenticación con el que se exige una sesión válida en todos sus endpoints.

		Returns:
			El router, listo para incluirlo en la aplicación.
		"""
		require_session = SessionDependency(auth_service).require_session;
		router = APIRouter(
			prefix="/visualizations", tags=["Visualizaciones"], dependencies=[Depends(require_session)]
		);

		@router.get("")
		def get_visualizations(
			session: Annotated[Session, Depends(require_session)],
			bim_model_id: Annotated[int | None, Query(ge=1, le=VisualizationRouter._MAX_ID)] = None,
			depth: Annotated[int, Query(ge=0, le=VisualizationRouter._MAX_DEPTH)] = 0,
		) -> list[VisualizationDto]:
			"""Devuelve las visualizaciones activas que puede ver el usuario, todas o solo las de un modelo BIM.

			El administrador ve todas; los demás usuarios, las públicas y las suyas.

			Args:
				session: Sesión del usuario que las pide.
				bim_model_id: Si se indica, solo se devuelven las visualizaciones de ese modelo BIM.
				depth: 0 para recuperarlas sin piezas (`pieces` a null, recuperación ligera); 1 para incluir todas sus piezas.

			Returns:
				Las visualizaciones activas visibles para el usuario.
			"""
			return [
				VisualizationMapper.to_dto(visualization)
				for visualization in service.get_visualizations(session, bim_model_id, depth)
			];

		@router.get("/{visualization_id}")
		def get_visualization(
			session: Annotated[Session, Depends(require_session)],
			visualization_id: Annotated[int, Path(ge=1, le=VisualizationRouter._MAX_ID)],
			depth: Annotated[int, Query(ge=0, le=VisualizationRouter._MAX_DEPTH)] = 0,
		) -> VisualizationDto:
			"""Devuelve la visualización activa con ese identificador. Responde 404 si no existe o el usuario no puede verla.

			Args:
				session: Sesión del usuario que la pide.
				visualization_id: Identificador de la visualización.
				depth: 0 para recuperarla sin piezas (`pieces` a null, recuperación ligera); 1 para incluir todas sus piezas.

			Returns:
				La visualización encontrada.
			"""
			return VisualizationMapper.to_dto(service.get_visualization(session, visualization_id, depth));

		@router.post("", status_code=201)
		def add_visualization(
			session: Annotated[Session, Depends(require_session)], dto: VisualizationDto
		) -> VisualizationDto:
			"""Añade una visualización sobre un modelo BIM, de la que será propietario el usuario de la sesión.

			Responde 400 si el nombre no es válido, 403 si el rol del usuario no permite crear visualizaciones y 404 si no
			existe el modelo.

			Args:
				session: Sesión del usuario que la crea.
				dto: Datos de la visualización, con sus piezas si las lleva. `id` y `user_id` (y el `id` de cada pieza) se ignoran: los asigna el sistema.

			Returns:
				La visualización creada, con su identificador.
			"""
			# El propietario lo decide el servicio, con la sesión, así que aquí va un valor de relleno que se sustituye.
			return VisualizationMapper.to_dto(service.add_visualization(session, VisualizationMapper.to_domain(dto, 0)));

		@router.put("/{visualization_id}")
		def update_visualization(
			session: Annotated[Session, Depends(require_session)],
			visualization_id: Annotated[int, Path(ge=1, le=VisualizationRouter._MAX_ID)],
			dto: VisualizationDto,
		) -> VisualizationDto:
			"""Modifica el nombre, la descripción, las observaciones, la visibilidad y las piezas de una visualización.

			Responde 404 si no existe o el usuario no puede verla, 403 si no es suya o su rol no permite modificarla, y 400 si
			el nombre no es válido o si `bim_model_id` no es el que ya tiene.

			Si `pieces` es null (o no se envía), las piezas guardadas no se tocan; si es una lista, sustituye a todas las guardadas.

			Args:
				session: Sesión del usuario que la modifica.
				visualization_id: Identificador de la visualización.
				dto: Datos nuevos. Solo se usan `name`, `description`, `observations`, `is_public` y `pieces`; `bim_model_id` debe ser el actual (el modelo no se puede cambiar).

			Returns:
				La visualización modificada.
			"""
			return VisualizationMapper.to_dto(
				service.update_visualization(session, visualization_id, VisualizationMapper.to_domain(dto, 0))
			);

		@router.delete("/{visualization_id}", status_code=204)
		def delete_visualization(
			session: Annotated[Session, Depends(require_session)],
			visualization_id: Annotated[int, Path(ge=1, le=VisualizationRouter._MAX_ID)],
			force: bool = False,
		) -> Response:
			"""Elimina una visualización. Responde 404 si no existe o el usuario no puede verla, y 403 si no es suya o su rol no permite borrarla.

			Por defecto el borrado es lógico: la visualización queda inactiva y se conservan sus datos. Con `force=true`
			se borran de verdad la visualización y sus piezas.

			Args:
				session: Sesión del usuario que la elimina.
				visualization_id: Identificador de la visualización.
				force: True para borrar también los datos.

			Returns:
				Respuesta vacía.
			"""
			service.delete_visualization(session, visualization_id, force);
			return Response(status_code=204);

		return router;

	# endregion PUBLIC STATIC METHODS
