/** Usuario de la aplicación. */
export class User {
	//#region PUBLIC PROPERTIES

	/** Identificador del usuario. */
	public Id: number;

	/** Nombre del usuario. */
	public Name: string;

	/** Alias único del usuario. */
	public Nick: string;

	/** Apellidos del usuario. */
	public Surname: string;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador del usuario.
	 * @param nick Alias único del usuario.
	 * @param name Nombre del usuario.
	 * @param surname Apellidos del usuario.
	 */
	constructor(id: number, nick: string, name: string, surname: string) {
		this.Id = id;
		this.Name = name;
		this.Nick = nick;
		this.Surname = surname;
	}

	//#endregion CONSTRUCTOR
}
