from fastapi import APIRouter;

from app.adapters.inbound.rest import UserCredentialsDto, UserDto, UserMapper;
from app.application.ports.inbound import UserServiceBase;


class UserRouter:
	"""Endpoints de los usuarios.

	Clase estática: no se instancia. El router solo puede usar el servicio que se le entrega al crearlo. Los errores
	del servicio no se capturan aquí: se escapan y los traduce a respuestas HTTP quien monta la aplicación.
	"""

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
			"""Devuelve todos los usuarios activos (sin contraseña).

			Returns:
				Los usuarios activos.
			"""
			return [UserMapper.to_dto(user) for user in service.get_users()];

		@router.get("/{nick}")
		def get_user_by_nick(nick: str) -> UserDto:
			"""Devuelve el usuario activo con ese nick (sin contraseña). Responde 404 si no existe.

			Args:
				nick: Alias del usuario.

			Returns:
				El usuario encontrado.
			"""
			return UserMapper.to_dto(service.get_user_by_nick(nick));

		@router.post("/validate-password")
		def validate_password(credentials: UserCredentialsDto) -> bool:
			"""Indica si el hash de contraseña corresponde al nick. Responde 404 si el usuario no existe.

			Args:
				credentials: Nick y hash de la contraseña a comprobar.

			Returns:
				True si coincide con el guardado; False si no.
			"""
			return service.validate_password(credentials.nick, credentials.password_hash);

		return router;

	# endregion PUBLIC STATIC METHODS
