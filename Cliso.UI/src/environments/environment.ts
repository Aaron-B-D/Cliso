/** Configuración del entorno de producción. `environment.development.ts` la sustituye al compilar en desarrollo. */
export class Environment {
	//#region PUBLIC CONSTANTS

	/** URL base del API. Provisional: hay que poner la del servidor real antes de desplegar. */
	public static readonly API_URL: string = 'http://localhost:8000';

	//#endregion PUBLIC CONSTANTS
}
