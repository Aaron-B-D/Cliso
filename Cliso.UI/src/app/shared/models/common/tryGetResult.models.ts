/**
 * Resultado de una operación que espera obtener un valor y que puede no conseguirlo (equivale al `TryGet` de C#):
 * permite saber si ha ido bien sin usar excepciones.
 */
export class TryGetResult<ResultType> {
	//#region PUBLIC PROPERTIES

	/** Indica si se ha obtenido el resultado. */
	public Success: boolean;

	/** El resultado obtenido. Si no se ha podido obtener, es `null`. */
	public Result: ResultType | null;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param success Indica si se ha obtenido el resultado.
	 * @param result El resultado obtenido, o `null` si no se ha podido.
	 */
	constructor(success: boolean, result: ResultType | null) {
		this.Success = success;
		this.Result = result;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC STATIC METHODS

	/**
	 * Crea un resultado fallido, sin valor.
	 * @returns El resultado fallido.
	 */
	public static Failed<ResultType>(): TryGetResult<ResultType> {
		return new TryGetResult<ResultType>(false, null);
	}

	/**
	 * Crea un resultado correcto con el valor obtenido.
	 * @param result El valor obtenido.
	 * @returns El resultado correcto.
	 */
	public static Succeeded<ResultType>(result: ResultType): TryGetResult<ResultType> {
		return new TryGetResult<ResultType>(true, result);
	}

	//#endregion PUBLIC STATIC METHODS
}
