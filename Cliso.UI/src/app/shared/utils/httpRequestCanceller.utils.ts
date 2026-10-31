import { Observable, Subject } from 'rxjs';

/**
 * Permite cancelar las peticiones HTTP que están pendientes, para que no queden colgadas (por ejemplo, al destruir
 * un componente).
 *
 * Uso: el componente crea uno, lo pasa a `RequestUtils.AwaitRequest` en cada llamada y llama a `Destroy()` en
 * `ngOnDestroy`. `Cancel()` corta las pendientes y deja el canceller listo para seguir usándolo.
 */
export class HttpRequestCanceller {
	//#region PRIVATE PROPERTIES

	/** Avisa a las peticiones pendientes de que deben cancelarse. */
	private _CancelSubject: Subject<void> = new Subject<void>();

	//#endregion PRIVATE PROPERTIES

	//#region PUBLIC METHODS

	/** Cancela las peticiones pendientes. El canceller puede seguir usándose después. */
	public Cancel(): void {
		this._CancelSubject.next();
		this._CancelSubject.complete();
		this._CancelSubject = new Subject<void>();
	}

	/** Cancela las peticiones pendientes y deja el canceller inutilizable. Se llama al destruir el componente. */
	public Destroy(): void {
		this._CancelSubject.next();
		this._CancelSubject.complete();
	}

	/**
	 * Devuelve el aviso que escuchan las peticiones para saber si deben cancelarse.
	 * @returns El aviso de cancelación.
	 */
	public GetToken(): Observable<void> {
		return this._CancelSubject.asObservable();
	}

	//#endregion PUBLIC METHODS
}
