/** Utilidades para tratar los errores que se capturan en un `catch`. */
export class ErrorUtils {
	//#region PUBLIC STATIC METHODS

	/**
	 * Saca el texto de un error capturado, venga de donde venga: un `Error` normal, un objeto con `message` (como el
	 * `HttpErrorResponse` de Angular, que no es un `Error`) o cualquier otro valor.
	 * @param error Lo que llega al `catch`.
	 * @returns El mensaje del error.
	 */
	public static GetMessage(error: unknown): string {
		let result: string = String(error);

		if (error instanceof Error) {
			result = error.message;
		} else if (typeof error === 'object' && error !== null && 'message' in error) {
			result = String(error.message);
		} else {
			// Se queda con la conversión a texto del valor
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
