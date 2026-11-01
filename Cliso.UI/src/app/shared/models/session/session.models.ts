import { UserRole } from 'src/app/shared/definitions/user.definitions';

/** Sesión abierta: el usuario que ha iniciado sesión y su rol. */
export class Session {
	//#region PUBLIC PROPERTIES

	/** Alias único del usuario. */
	public Nick: string;

	/** Rol del usuario. */
	public Role: UserRole;

	/** Identificador del usuario. */
	public UserId: number;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param userId Identificador del usuario.
	 * @param nick Alias único del usuario.
	 * @param role Rol del usuario.
	 */
	constructor(userId: number, nick: string, role: UserRole) {
		this.Nick = nick;
		this.Role = role;
		this.UserId = userId;
	}

	//#endregion CONSTRUCTOR
}
