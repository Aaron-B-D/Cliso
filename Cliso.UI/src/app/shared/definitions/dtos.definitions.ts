//#region TYPES

/** Parámetro de la aplicación tal y como lo envía el API: su tipo y sus valores, como texto. */
type ApplicationParameterDto = {
	type: string;
	default_value: string;
	value: string;
};

/** Datos que se envían al API para modificar el valor actual de un parámetro de la aplicación. */
type ApplicationParameterModificationDto = {
	value: string;
};

/** Parámetros de la aplicación tal y como los envía el API. */
type ApplicationParametersDto = {
	parameters: ApplicationParameterDto[];
};

/** Modelo BIM tal y como lo envía y lo recibe el API. Solo se usa en la capa de acceso a datos. */
type BimModelDto = {
	id: number | null;
	name: string;
	description: string;
	observations: string;
	file_name: string | null;
	creation_date: string | null;
	file_size: number | null;
};

/** Datos que se envían al API para iniciar sesión. */
type LoginDto = {
	nick: string;
	password: string;
};

/** Sesión que devuelve el API: el usuario que ha iniciado sesión, su rol y los permisos de ese rol. */
type SessionDto = {
	user_id: number;
	nick: string;
	role: string;
	permissions: string[];
};

/** Datos que se envían al API para crear un usuario, con su contraseña en texto plano. */
type UserCreationDto = {
	nick: string;
	name: string;
	surname: string;
	role: string;
	password: string;
};

/** Usuario tal y como lo envía el API. Nunca trae la contraseña. */
type UserDto = {
	id: number;
	nick: string;
	name: string;
	surname: string;
	role: string;
	active: boolean;
};

/** Datos que se envían al API para modificar un usuario. Sin contraseña (`null`), conserva la que tiene. */
type UserModificationDto = {
	nick: string;
	name: string;
	surname: string;
	role: string;
	password: string | null;
};

//#endregion TYPES

export {
	type ApplicationParameterDto,
	type ApplicationParameterModificationDto,
	type ApplicationParametersDto,
	type BimModelDto,
	type LoginDto,
	type SessionDto,
	type UserCreationDto,
	type UserDto,
	type UserModificationDto
};
