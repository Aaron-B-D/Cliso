from abc import ABC, abstractmethod;

from app.domain.models import Permission, Session, UserRole;


class PermissionServiceBase(ABC):
	"""Contrato de los permisos: qué puede hacer el usuario de una sesión según su rol."""

	# region PUBLIC METHODS

	@abstractmethod
	def has(self, session: Session, permission: Permission) -> bool:
		"""Dice si el rol del usuario de la sesión tiene un permiso.

		Args:
			session: Sesión del usuario.
			permission: Permiso que se consulta.

		Returns:
			True si el rol tiene el permiso; False si no.
		"""

	@abstractmethod
	def check(self, session: Session, permission: Permission) -> None:
		"""Exige que el rol del usuario de la sesión tenga un permiso.

		Args:
			session: Sesión del usuario.
			permission: Permiso que se exige.

		Raises:
			PermissionDeniedError: Si el rol no tiene el permiso.
		"""

	@abstractmethod
	def get_permissions(self, role: UserRole) -> list[Permission]:
		"""Devuelve todos los permisos de un rol.

		Args:
			role: Rol del que se quieren los permisos.

		Returns:
			Los permisos del rol (la lista queda vacía si no tiene ninguno).
		"""

	# endregion PUBLIC METHODS
