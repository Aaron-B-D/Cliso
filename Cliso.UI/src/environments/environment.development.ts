/** Configuración del entorno de desarrollo. Sustituye a `environment.ts` al compilar con `development`. */
export class Environment {
	//#region PUBLIC CONSTANTS

	/** URL base del API en local (`uvicorn` en el puerto 8000). */
	public static readonly API_URL: string = 'http://localhost:8000';

	//#endregion PUBLIC CONSTANTS
}
