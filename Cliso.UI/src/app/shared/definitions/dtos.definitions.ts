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

//#endregion TYPES

export { type BimModelDto };
