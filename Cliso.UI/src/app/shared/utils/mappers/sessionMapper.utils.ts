import { SessionDto } from 'src/app/shared/definitions/dtos.definitions';
import { UserRole } from 'src/app/shared/definitions/user.definitions';
import { Session } from 'src/app/shared/models/session/session.models';

/** Convierte la sesión entre el formato del API y la clase del front. */
export class SessionMapper {
	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte la sesión que envía el API en una sesión del front.
	 * @param dto Sesión tal y como la envía el API.
	 * @returns La sesión del front.
	 */
	public static ToModel(dto: SessionDto): Session {
		return new Session(dto.user_id, dto.nick, SessionMapper.toRole(dto.role));
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

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
