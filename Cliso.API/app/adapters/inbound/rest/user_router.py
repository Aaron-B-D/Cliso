from typing import Annotated, ClassVar;

from fastapi import APIRouter, Path, Response;

from app.adapters.inbound.rest import UserCreationDto, UserDto, UserMapper, UserModificationDto;
from app.application.ports.inbound import UserServiceBase;


class UserRouter:
	"""Endpoints de la gestión de usuarios.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación.
	"""

	# region PRIVATE CONSTANTS

	_MAX_ID: ClassVar[int] = 2**63 - 1;
	"""Mayor identificador posible: el máximo de un `long` (64 bits con signo, `BIGINT`), el tipo de la columna `id`."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def create(service: UserServiceBase) -> APIRouter:
		"""Crea el router de los usuarios.

		Args:
			service: Servicio de usuarios que usan sus endpoints.

		Returns:
			El router, listo para incluirlo en la aplicación.
		"""
		router = APIRouter(prefix="/users", tags=["Usuarios"]);

		@router.get("")
		def get_users() -> list[UserDto]:
			"""Devuelve todos los usuarios activos.

			Returns:
				Los usuarios activos.
			"""
			return [UserMapper.to_dto(user) for user in service.get_users()];

		@router.get("/{user_id}")
		def get_user(user_id: Annotated[int, Path(ge=1, le=UserRouter._MAX_ID)]) -> UserDto:
			"""Devuelve el usuario activo con ese identificador. Responde 404 si no existe.

			Args:
				user_id: Identificador del usuario.

			Returns:
				El usuario encontrado.
			"""
			return UserMapper.to_dto(service.get_user(user_id));

		@router.post("", status_code=201)
		def add_user(dto: UserCreationDto) -> UserDto:
			"""Crea un usuario. Responde 400 si los datos o la contraseña no son válidos y 409 si el nick ya existe.

			Si la contraseña no cumple los requisitos, la respuesta 400 incluye en `requirements` los códigos de los
			que falla.

			Args:
				dto: Datos del usuario, con su contraseña en texto plano.

			Returns:
				El usuario creado, con su identificador y sin contraseña.
			"""
			return UserMapper.to_dto(service.add_user(UserMapper.to_domain_for_creation(dto), dto.password));

		@router.put("/{user_id}")
		def update_user(
			user_id: Annotated[int, Path(ge=1, le=UserRouter._MAX_ID)], dto: UserModificationDto
		) -> UserDto:
			"""Modifica el nombre, los apellidos y el rol de un usuario, y opcionalmente su contraseña.

			Responde 404 si no existe, 400 si los datos o la contraseña no son válidos (o si el nick no es el que ya
			tiene: no se puede cambiar) y 403 si se intenta cambiar el rol del usuario protegido.

			Args:
				user_id: Identificador del usuario.
				dto: Datos nuevos. El nick debe ser el que ya tiene; si no se indica contraseña, conserva la suya.

			Returns:
				El usuario modificado.
			"""
			return UserMapper.to_dto(
				service.update_user(user_id, UserMapper.to_domain_for_modification(dto), dto.password)
			);

		@router.delete("/{user_id}", status_code=204)
		def delete_user(
			user_id: Annotated[int, Path(ge=1, le=UserRouter._MAX_ID)], force: bool = False
		) -> Response:
			"""Elimina un usuario. Responde 404 si no existe y 403 si es el usuario protegido.

			Por defecto el borrado es lógico: el usuario queda inactivo y se conservan sus datos y sus visualizaciones.
			Con `force=true` se borran de verdad el usuario y sus visualizaciones.

			Args:
				user_id: Identificador del usuario.
				force: True para borrar también los datos.

			Returns:
				Respuesta vacía.
			"""
			service.delete_user(user_id, force);
			return Response(status_code=204);

		return router;

	# endregion PUBLIC STATIC METHODS
