from app.adapters.inbound.rest import UserDto;
from app.domain.models import User;


class UserMapper:
	"""Convierte, campo a campo, entre el objeto de dominio `User` y su DTO `UserDto`.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(user: User) -> UserDto:
		"""Convierte un usuario de dominio en su DTO, para responder por la API. No copia la contraseña.

		Args:
			user: Usuario de dominio.

		Returns:
			El DTO con los datos públicos del usuario.
		"""
		return UserDto(
			id=user.id,
			nick=user.nick,
			name=user.name,
			surname=user.surname,
			creation_date=user.creation_date,
		);

	@staticmethod
	def to_domain(dto: UserDto, password_hash: str) -> User:
		"""Convierte un DTO recibido por la API en un usuario de dominio, listo para guardar.

		Ignora `id` y `creation_date` del DTO: los asigna el sistema.

		Args:
			dto: DTO recibido.
			password_hash: Contraseña ya hasheada. El DTO nunca la lleva, así que llega aparte.

		Returns:
			El usuario de dominio, activo y sin `id` hasta que se guarde.
		"""
		return User(
			nick=dto.nick,
			name=dto.name,
			surname=dto.surname,
			password=password_hash,
		);

	# endregion PUBLIC STATIC METHODS
