import { SessionDto } from 'src/app/shared/definitions/dtos.definitions';
import { Permission, UserRole } from 'src/app/shared/definitions/user.definitions';
import { Session } from 'src/app/shared/models/session/session.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Convierte la sesión entre el formato del API y la clase del front. */
export class SessionMapper {
	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte la sesión que envía el API en una sesión del front.
	 * @param dto Sesión tal y como la envía el API.
	 * @returns La sesión del front.
	 */
	public static ToModel(dto: SessionDto): Session {
		return new Session(dto.user_id, dto.nick, SessionMapper.toRole(dto.role), SessionMapper.toPermissions(dto.permissions));
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Convierte el texto de un permiso que envía el API en un permiso del front.
	 * @param text Permiso como texto.
	 * @returns El permiso, o `null` si el texto no es de un permiso conocido.
	 */
	private static toPermission(text: string): Permission | null {
		let result: Permission | null = null;

		for (const permission of Object.values(Permission)) {
			if (permission === text) {
				result = permission;
			} else {
				// No es este permiso
			}
		}

		return result;
	}

	/**
	 * Convierte los permisos que envía el API en permisos del front. Los desconocidos se descartan: sin permiso no se muestra nada.
	 * @param permissions Permisos como texto.
	 * @returns Los permisos conocidos.
	 */
	private static toPermissions(permissions: string[]): Permission[] {
		const result: Permission[] = [];

		for (const text of permissions) {
			const permission: Permission | null = SessionMapper.toPermission(text);

			if (!CheckUtils.IsNull(permission)) {
				result.push(permission);
			} else {
				console.warn('SessionMapper.toPermissions() => permiso no admitido: ' + text);
			}
		}

		return result;
	}

	/**
	 * Convierte el texto del rol que envía el API en un rol del front.
	 * @param role Rol como texto.
	 * @returns El rol; el de menos permisos (visor) si el texto no es de un rol conocido.
	 */
	private static toRole(role: string): UserRole {
		let result: UserRole = UserRole.VIEWER;

		switch (role) {
			case UserRole.ADMIN:
				result = UserRole.ADMIN;
				break;
			case UserRole.OPERATOR:
				result = UserRole.OPERATOR;
				break;
			case UserRole.VIEWER:
				result = UserRole.VIEWER;
				break;
			default:
				console.warn('SessionMapper.toRole() => rol no admitido: ' + role);
				break;
		}

		return result;
	}

	//#endregion PRIVATE STATIC METHODS
}
