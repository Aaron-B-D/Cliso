import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Environment } from 'src/environments/environment';

/**
 * Único punto de acceso al API: aquí van todas las llamadas HTTP. Cada llamada devuelve el `Observable` de
 * `HttpClient` y quien la usa lo espera con `RequestUtils.AwaitRequest`.
 */
@Injectable({ providedIn: 'root' })
export class DataAccessService {
	//#region PRIVATE PROPERTIES

	/** Cliente HTTP de Angular. Se usará desde las llamadas que se vayan añadiendo. */
	private _Http: HttpClient;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param http Cliente HTTP de Angular.
	 */
	constructor(http: HttpClient) {
		this._Http = http;
	}

	//#endregion CONSTRUCTOR

	//#region PRIVATE METHODS

	/**
	 * Construye la URL completa de un endpoint.
	 * @param path Ruta del endpoint, con `/` inicial (por ejemplo, `/users`).
	 * @returns La URL completa.
	 */
	private buildUrl(path: string): string {
		return Environment.API_URL + path;
	}

	//#endregion PRIVATE METHODS
}
