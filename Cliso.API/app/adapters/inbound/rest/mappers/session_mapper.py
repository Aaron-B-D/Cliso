from app.adapters.inbound.rest import SessionDto;
from app.domain.models import Permission, Session;


class SessionMapper:
	"""Convierte, campo a campo, la sesión de dominio en su DTO.

	Clase estática: no se instancia.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_dto(session: Session, permissions: list[Permission]) -> SessionDto:
		"""Convierte una sesión de dominio en su DTO, para responder por la API. No copia el token.

		Args:
			session: Sesión de dominio.
			permissions: Permisos del rol del usuario de la sesión.

		Returns:
			El DTO de la sesión.
		"""
		return SessionDto(user_id=session.user_id, nick=session.nick, role=session.role, permissions=permissions);

	# endregion PUBLIC STATIC METHODS
