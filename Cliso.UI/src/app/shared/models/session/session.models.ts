import { Permission, UserRole } from 'src/app/shared/definitions/user.definitions';

/** Sesión abierta: el usuario que ha iniciado sesión, su rol y lo que este le permite hacer. */
export class Session {
	//#region PUBLIC PROPERTIES

	/** Alias único del usuario. */
	public Nick: string;

	/** Permisos del rol del usuario. */
	public Permissions: Permission[];

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
	 * @param permissions Permisos del rol del usuario.
	 */
	constructor(userId: number, nick: string, role: UserRole, permissions: Permission[]) {
		this.Nick = nick;
		this.Permissions = permissions;
		this.Role = role;
		this.UserId = userId;
	}

	//#endregion CONSTRUCTOR
}
