/** Configuración del entorno de producción. `environment.development.ts` la sustituye al compilar en desarrollo. */
export class Environment {
	//#region PUBLIC CONSTANTS

	/** URL base del API: ruta relativa, que el servidor web reenvía a la API. */
	public static readonly API_URL: string = '/api';

	//#endregion PUBLIC CONSTANTS
}
