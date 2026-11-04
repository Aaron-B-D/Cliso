//#region TYPES

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

//#endregion TYPES

export { type BimModelDto, type LoginDto, type SessionDto };
