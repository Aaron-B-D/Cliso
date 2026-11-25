import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { UserRole } from 'src/app/shared/definitions/user.definitions';

/**
 * Datos del formulario de un usuario tal y como se escriben: los de `User` más la contraseña y su repetición, que `User` no
 * tiene porque la contraseña nunca llega al front.
 */
export class UserForm {
	//#region PUBLIC PROPERTIES

	/** Nombre del usuario. */
	public Name: string;

	/** Alias del usuario. */
	public Nick: string;

	/** Contraseña escrita. Vacía si el formulario no la pide. */
	public Password: string;

	/** Repetición de la contraseña escrita. Vacía si el formulario no la pide. */
	public PasswordRepeat: string;

	/** `true` si la contraseña es obligatoria (al añadir un usuario); al modificar, se cambia aparte. */
	public RequiresPassword: boolean;

	/** Rol del usuario. */
	public Role: UserRole;

	/** Apellidos del usuario. */
	public Surname: string;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param nick Alias del usuario.
	 * @param name Nombre del usuario.
	 * @param surname Apellidos del usuario.
	 * @param role Rol del usuario.
	 * @param requiresPassword `true` si la contraseña es obligatoria.
	 * @param password Contraseña escrita.
	 * @param passwordRepeat Repetición de la contraseña.
	 */
	constructor(
		nick: string,
		name: string,
		surname: string,
		role: UserRole,
		requiresPassword: boolean,
		password: string = STRING_UNDEFINED,
		passwordRepeat: string = STRING_UNDEFINED
	) {
		this.Name = name;
		this.Nick = nick;
		this.Password = password;
		this.PasswordRepeat = passwordRepeat;
		this.RequiresPassword = requiresPassword;
		this.Role = role;
		this.Surname = surname;
	}

	//#endregion CONSTRUCTOR
}
