import { UserRole } from 'src/app/shared/definitions/user.definitions';

/** Usuario de la aplicación: sus datos y su rol. La contraseña nunca llega al front. */
export class User {
	//#region PUBLIC PROPERTIES

	/** `true` si el usuario está activo; `false` si se ha borrado de forma lógica. */
	public Active: boolean;

	/** Identificador del usuario. Es el identificador sin definir mientras el usuario no se ha guardado. */
	public Id: number;

	/** Nombre del usuario. */
	public Name: string;

	/** Alias único del usuario, siempre en minúsculas. No se puede cambiar una vez guardado. */
	public Nick: string;

	/** Rol del usuario: define qué puede hacer en la aplicación. */
	public Role: UserRole;

	/** Apellidos del usuario. */
	public Surname: string;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador del usuario.
	 * @param nick Alias único del usuario.
	 * @param name Nombre del usuario.
	 * @param surname Apellidos del usuario.
	 * @param role Rol del usuario.
	 * @param active `true` si el usuario está activo.
	 */
	constructor(id: number, nick: string, name: string, surname: string, role: UserRole, active: boolean) {
		this.Active = active;
		this.Id = id;
		this.Name = name;
		this.Nick = nick;
		this.Role = role;
		this.Surname = surname;
	}

	//#endregion CONSTRUCTOR
}
