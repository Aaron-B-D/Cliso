from app.adapters.inbound.rest import UserCreationDto, UserDto, UserModificationDto;
from app.domain.models import User;


class UserMapper:
	"""Convierte, campo a campo, entre el usuario de dominio y sus DTOs.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(user: User) -> UserDto:
		"""Convierte un usuario de dominio en su DTO, para responder por la API. No copia la contraseña.

		Args:
			user: Usuario de dominio ya guardado (con `id`).

		Returns:
			El DTO del usuario.

		Raises:
			ValueError: Si el usuario no tiene `id` (no se ha guardado).
		"""
		if user.id is None:
			raise ValueError("No se puede convertir en DTO un usuario sin identificador");
		return UserDto(
			id=user.id,
			nick=user.nick,
			name=user.name,
			surname=user.surname,
			role=user.role,
			active=user.active,
		);

	@staticmethod
	def to_domain_for_creation(dto: UserCreationDto) -> User:
		"""Convierte el DTO recibido para crear un usuario en un usuario de dominio, listo para entregar al servicio.

		La contraseña del DTO no se copia: el servicio la recibe aparte, en texto plano, y la sustituye por su hash.
		Por eso el usuario de dominio sale con la contraseña vacía.

		Args:
			dto: DTO recibido.

		Returns:
			El usuario de dominio, activo y sin `id` hasta que se guarde.
		"""
		return User(
			nick=dto.nick,
			name=dto.name,
			surname=dto.surname,
			password="",
			role=dto.role,
		);

	@staticmethod
	def to_domain_for_modification(dto: UserModificationDto) -> User:
		"""Convierte el DTO recibido para modificar un usuario en un usuario de dominio, listo para entregar al servicio.

		La contraseña del DTO no se copia: el servicio la recibe aparte, en texto plano, y la sustituye por su hash.
		Por eso el usuario de dominio sale con la contraseña vacía.

		Args:
			dto: DTO recibido.

		Returns:
			El usuario de dominio con los datos nuevos, sin `id`.
		"""
		return User(
			nick=dto.nick,
			name=dto.name,
			surname=dto.surname,
			password="",
			role=dto.role,
		);

	# endregion PUBLIC STATIC METHODS
