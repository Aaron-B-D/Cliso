import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthDataAccessService } from 'src/app/shared/services/authDataAccess.service';
import { BimModelDataAccessService } from 'src/app/shared/services/bimModelDataAccess.service';
import { Environment } from 'src/environments/environment';

/**
 * Único punto de acceso al API: aquí van todas las llamadas HTTP, agrupadas en una propiedad por concepto
 * (`Auth`, `BimModels`...). Cada llamada devuelve el `Observable` de `HttpClient` y quien la usa lo espera con
 * `RequestUtils.AwaitRequest`.
 */
@Injectable({ providedIn: 'root' })
export class DataAccessService {
	//#region PUBLIC PROPERTIES

	/** Llamadas de la autenticación. */
	public readonly Auth: AuthDataAccessService;

	/** Llamadas de los modelos BIM. */
	public readonly BimModels: BimModelDataAccessService;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param http Cliente HTTP de Angular.
	 */
	constructor(http: HttpClient) {
		this.Auth = new AuthDataAccessService(http, Environment.API_URL);
		this.BimModels = new BimModelDataAccessService(http, Environment.API_URL);
	}

	//#endregion CONSTRUCTOR
}
