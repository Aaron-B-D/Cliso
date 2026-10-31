import { firstValueFrom, map, Observable, takeUntil } from 'rxjs';

import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';

/** Utilidades para esperar el resultado de las peticiones al API. */
export class RequestUtils {
	//#region PUBLIC STATIC METHODS

	/**
	 * Espera la respuesta de una petición, que se cancela si se llama al canceller. Una sola respuesta por llamada.
	 * Usa un genérico (`T`) para devolver la respuesta con el tipo que tenga la petición: es el único sitio, junto con
	 * `TryGetResult`, donde se permiten genéricos.
	 * @param request$ Petición a esperar.
	 * @param canceller Canceller que corta la petición (obligatorio).
	 * @returns Resultado correcto con la respuesta, o fallido si la petición se canceló. Si la petición falla, lanza
	 * el error: quien llama lo recoge con `try`/`catch`.
	 */
	public static AwaitRequest<T>(request$: Observable<T>, canceller: HttpRequestCanceller): Promise<TryGetResult<T>> {
		// Si el canceller avisa, la petición se corta y termina sin respuesta.
		const cancellable$: Observable<T> = request$.pipe(takeUntil(canceller.GetToken()));
		// La respuesta se envuelve en un resultado correcto.
		const result$: Observable<TryGetResult<T>> = cancellable$.pipe(map((response: T) => TryGetResult.Succeeded<T>(response)));

		// Se espera un único valor; si no llega ninguno (petición cancelada), el resultado es fallido.
		return firstValueFrom(result$, { defaultValue: TryGetResult.Failed<T>() });
	}

	//#endregion PUBLIC STATIC METHODS
}
