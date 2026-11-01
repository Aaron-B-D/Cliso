import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { filter, firstValueFrom, map, Observable, takeUntil, tap } from 'rxjs';

import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';

/** Utilidades para esperar el resultado de las peticiones al API. */
export class RequestUtils {
	//#region PRIVATE CONSTANTS

	/** Porcentaje máximo del progreso de una petición. */
	private static readonly _MAX_PERCENT: number = 100;

	/** Tiempo mínimo entre dos avisos de progreso, para no refrescar la pantalla con cada trozo que llega. */
	private static readonly _PROGRESS_THROTTLE_MS: number = 150;

	//#endregion PRIVATE CONSTANTS

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

	/**
	 * Como `AwaitRequest`, pero para una petición que informa de su progreso (subida o descarga de un fichero): avisa del
	 * porcentaje mientras avanza y devuelve la respuesta al terminar.
	 * @param request$ Petición a esperar, con `observe: 'events'` y `reportProgress: true`.
	 * @param canceller Canceller que corta la petición (obligatorio).
	 * @param onProgress Se llama con el porcentaje (de 0 a 100) cada cierto tiempo y siempre al llegar al 100.
	 * @returns Resultado correcto con el cuerpo de la respuesta, o fallido si la petición se canceló. Si la petición falla,
	 * lanza el error: quien llama lo recoge con `try`/`catch`.
	 */
	public static AwaitRequestWithProgress<T>(
		request$: Observable<HttpEvent<T>>,
		canceller: HttpRequestCanceller,
		onProgress: (percent: number) => void
	): Promise<TryGetResult<T>> {
		let lastReportTime: number = 0;

		const result$: Observable<TryGetResult<T>> = request$.pipe(
			takeUntil(canceller.GetToken()),
			tap((event: HttpEvent<T>): void => {
				if ((event.type === HttpEventType.UploadProgress || event.type === HttpEventType.DownloadProgress) && !CheckUtils.IsUndefined(event.total)) {
					const percent: number = Math.round((event.loaded / event.total) * RequestUtils._MAX_PERCENT);
					const now: number = Date.now();

					if (percent >= RequestUtils._MAX_PERCENT || now - lastReportTime >= RequestUtils._PROGRESS_THROTTLE_MS) {
						lastReportTime = now;
						onProgress(Math.min(RequestUtils._MAX_PERCENT, percent));
					} else {
						// Se acaba de avisar: se espera al siguiente trozo
					}
				} else {
					// No es un evento de progreso o no se conoce el tamaño total
				}
			}),
			filter((event: HttpEvent<T>): boolean => event.type === HttpEventType.Response),
			map((event: HttpEvent<T>): TryGetResult<T> => {
				const body: T | null = (event as HttpResponse<T>).body;
				let result: TryGetResult<T> = TryGetResult.Failed<T>();

				if (CheckUtils.IsNull(body)) {
					throw new Error('RequestUtils.AwaitRequestWithProgress() => la respuesta no trae contenido');
				} else {
					result = TryGetResult.Succeeded<T>(body);
				}

				return result;
			})
		);

		return firstValueFrom(result$, { defaultValue: TryGetResult.Failed<T>() });
	}

	//#endregion PUBLIC STATIC METHODS
}
