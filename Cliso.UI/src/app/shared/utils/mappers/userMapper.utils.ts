import { UserCreationDto, UserDto, UserModificationDto } from 'src/app/shared/definitions/dtos.definitions';
import { UserRole } from 'src/app/shared/definitions/user.definitions';
import { User } from 'src/app/shared/models/user/user.models';

/** Convierte, campo a campo, entre el usuario del front y el que envía y recibe el API. */
export class UserMapper {
	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte un usuario del front en los datos que el API necesita para crearlo.
	 * @param user Usuario del front. Su identificador no se envía: lo asigna el API.
	 * @param password Contraseña en texto plano.
	 * @returns Los datos para crear el usuario.
	 */
	public static ToCreationDto(user: User, password: string): UserCreationDto {
		return {
			nick: user.Nick,
			name: user.Name,
			surname: user.Surname,
			role: user.Role,
			password: password
		};
	}

	/**
	 * Convierte un usuario del front en los datos que el API necesita para modificarlo.
	 * @param user Usuario del front, con el nick que ya tiene (no se puede cambiar).
	 * @param password Contraseña nueva en texto plano, o `null` para conservar la que tiene.
	 * @returns Los datos para modificar el usuario.
	 */
	public static ToModificationDto(user: User, password: string | null): UserModificationDto {
		return {
			nick: user.Nick,
			name: user.Name,
			surname: user.Surname,
			role: user.Role,
			password: password
		};
	}

	/**
	 * Convierte el usuario que envía el API al del front.
	 * @param dto Usuario del API.
	 * @returns El usuario del front.
	 */
	public static ToModel(dto: UserDto): User {
		return new User(dto.id, dto.nick, dto.name, dto.surname, UserMapper.ToRole(dto.role), dto.active);
	}

	/**
	 * Convierte el texto del rol que envía el API en un rol del front.
	 * @param role Rol como texto.
	 * @returns El rol; el de menos permisos (visor) si el texto no es de un rol conocido.
	 */
	public static ToRole(role: string): UserRole {
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
				console.warn('UserMapper.ToRole() => rol no admitido: ' + role);
				break;
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
