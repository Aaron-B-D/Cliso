from typing import ClassVar;

from app.application.exceptions import PermissionDeniedError;
from app.application.ports.inbound import PermissionServiceBase;
from app.domain.models import Permission, Session, UserRole;


class PermissionService(PermissionServiceBase):
	"""Caso de uso de los permisos: la matriz que dice qué permisos tiene cada rol y las consultas sobre ella.

	Solo sabe de roles. Las reglas que dependen del dato (por ejemplo, si una visualización es del usuario) las decide
	quien la usa: elige el permiso que corresponde (`..._OWN` o `..._ANY`) y se lo pide a este servicio.
	"""

	# region PRIVATE CONSTANTS

	_ROLE_PERMISSIONS: ClassVar[dict[UserRole, list[Permission]]] = {
		UserRole.ADMIN: [
			Permission.USERS_MANAGE,
			Permission.APPLICATION_PARAMETERS_EDIT,
			Permission.BIM_MODELS_READ,
			Permission.BIM_MODELS_EDIT,
			Permission.BIM_MODELS_DELETE,
			Permission.VISUALIZATIONS_VIEW_ANY,
			Permission.VISUALIZATIONS_CREATE,
			Permission.VISUALIZATIONS_EDIT_OWN,
			Permission.VISUALIZATIONS_EDIT_ANY,
			Permission.VISUALIZATIONS_DELETE_OWN,
			Permission.VISUALIZATIONS_DELETE_ANY,
		],
		UserRole.OPERATOR: [
			Permission.BIM_MODELS_READ,
			Permission.BIM_MODELS_EDIT,
			Permission.VISUALIZATIONS_CREATE,
			Permission.VISUALIZATIONS_EDIT_OWN,
			Permission.VISUALIZATIONS_DELETE_OWN,
		],
		UserRole.VIEWER: [
			Permission.BIM_MODELS_READ,
		],
	};
	"""Matriz de permisos: los permisos de cada rol."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC METHODS

	def has(self, session: Session, permission: Permission) -> bool:
		"""Dice si el rol del usuario de la sesión tiene un permiso.

		Args:
			session: Sesión del usuario.
			permission: Permiso que se consulta.

		Returns:
			True si el rol tiene el permiso; False si no.
		"""
		return permission in self.get_permissions(session.role);

	def check(self, session: Session, permission: Permission) -> None:
		"""Exige que el rol del usuario de la sesión tenga un permiso.

		Args:
			session: Sesión del usuario.
			permission: Permiso que se exige.

		Raises:
			PermissionDeniedError: Si el rol no tiene el permiso.
		"""
		if not self.has(session, permission):
			raise PermissionDeniedError("Tu rol no permite hacer esta operación");

	def get_permissions(self, role: UserRole) -> list[Permission]:
		"""Devuelve todos los permisos de un rol.

		Args:
			role: Rol del que se quieren los permisos.

		Returns:
			Los permisos del rol (la lista queda vacía si no tiene ninguno).
		"""
		permissions: list[Permission] = [];
		if role in self._ROLE_PERMISSIONS:
			permissions = list(self._ROLE_PERMISSIONS[role]);
		else:
			# Un rol sin entrada en la matriz no tiene ningún permiso.
			pass;
		return permissions;

	# endregion PUBLIC METHODS
