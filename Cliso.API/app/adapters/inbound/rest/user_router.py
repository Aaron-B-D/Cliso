from typing import Annotated, ClassVar;

from fastapi import APIRouter, Depends, Path, Response;

from app.adapters.inbound.rest import SessionDependency, UserCreationDto, UserDto, UserMapper, UserModificationDto;
from app.application.ports.inbound import AuthServiceBase, UserServiceBase;
from app.domain.models import Session;


class UserRouter:
	"""Endpoints de la gestión de usuarios.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación. Todos los
	endpoints exigen una sesión válida y actúan en nombre de su usuario: responden 403 si su rol no permite gestionar
	usuarios.
	"""

	# region PRIVATE CONSTANTS

	_MAX_ID: ClassVar[int] = 2**63 - 1;
	"""Mayor identificador posible: el máximo de un `long` (64 bits con signo, `BIGINT`), el tipo de la columna `id`."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create(service: UserServiceBase, auth_service: AuthServiceBase) -> APIRouter:
		"""Crea el router de los usuarios.

		Args:
			service: Servicio de usuarios que usan sus endpoints.
			auth_service: Servicio de autenticación con el que se exige una sesión válida en todos sus endpoints.

		Returns:
			El router, listo para incluirlo en la aplicación.
		"""
		# La sesión se pide dos veces a propósito (FastAPI ejecuta la dependencia una sola vez por petición):
		# - En el router: todo endpoint, también uno nuevo que olvide el parámetro `session`, exige sesión (401 sin ella).
		# - En cada endpoint: entrega la `Session` al servicio, que comprueba el permiso. Un `dependencies` de router no
		#   puede entregar el valor al endpoint. Un endpoint nuevo copia este patrón.
		require_session = SessionDependency(auth_service).require_session;
		router = APIRouter(prefix="/users", tags=["Usuarios"], dependencies=[Depends(require_session)]);

		@router.get("")
		def get_users(session: Annotated[Session, Depends(require_session)]) -> list[UserDto]:
			"""Devuelve todos los usuarios activos.

			Args:
				session: Sesión del usuario que los pide.

			Returns:
				Los usuarios activos.
			"""
			return [UserMapper.to_dto(user) for user in service.get_users(session)];

		@router.get("/{user_id}")
		def get_user(
			session: Annotated[Session, Depends(require_session)],
			user_id: Annotated[int, Path(ge=1, le=UserRouter._MAX_ID)],
		) -> UserDto:
			"""Devuelve el usuario activo con ese identificador. Responde 404 si no existe.

			Args:
				session: Sesión del usuario que lo pide.
				user_id: Identificador del usuario.

			Returns:
				El usuario encontrado.
			"""
			return UserMapper.to_dto(service.get_user(session, user_id));

		@router.post("", status_code=201)
		def add_user(session: Annotated[Session, Depends(require_session)], dto: UserCreationDto) -> UserDto:
			"""Crea un usuario. Responde 400 si los datos o la contraseña no son válidos y 409 si el nick ya existe.

			Si la contraseña no cumple los requisitos, la respuesta 400 incluye en `requirements` los códigos de los
			que falla.

			Args:
				session: Sesión del usuario que lo crea.
				dto: Datos del usuario, con su contraseña en texto plano.

			Returns:
				El usuario creado, con su identificador y sin contraseña.
			"""
			return UserMapper.to_dto(service.add_user(session, UserMapper.to_domain_for_creation(dto), dto.password));

		@router.put("/{user_id}")
		def update_user(
			session: Annotated[Session, Depends(require_session)],
			user_id: Annotated[int, Path(ge=1, le=UserRouter._MAX_ID)],
			dto: UserModificationDto,
		) -> UserDto:
			"""Modifica el nombre, los apellidos y el rol de un usuario, y opcionalmente su contraseña.

			Responde 404 si no existe, 400 si los datos o la contraseña no son válidos (o si el nick no es el que ya
			tiene: no se puede cambiar) y 403 si se intenta cambiar el rol del usuario protegido.

			Args:
				session: Sesión del usuario que lo modifica.
				user_id: Identificador del usuario.
				dto: Datos nuevos. El nick debe ser el que ya tiene; si no se indica contraseña, conserva la suya.

			Returns:
				El usuario modificado.
			"""
			return UserMapper.to_dto(
				service.update_user(session, user_id, UserMapper.to_domain_for_modification(dto), dto.password)
			);

		@router.delete("/{user_id}", status_code=204)
		def delete_user(
			session: Annotated[Session, Depends(require_session)],
			user_id: Annotated[int, Path(ge=1, le=UserRouter._MAX_ID)],
			force: bool = False,
		) -> Response:
			"""Elimina un usuario. Responde 404 si no existe y 403 si es el usuario protegido o el propio usuario de la sesión.

			Por defecto el borrado es lógico: el usuario queda inactivo y se conservan sus datos y sus visualizaciones.
			Con `force=true` se borran de verdad el usuario y sus visualizaciones.

			Args:
				session: Sesión del usuario que lo elimina.
				user_id: Identificador del usuario.
				force: True para borrar también los datos.

			Returns:
				Respuesta vacía.
			"""
			service.delete_user(session, user_id, force);
			return Response(status_code=204);

		return router;

	# endregion PUBLIC STATIC METHODS
