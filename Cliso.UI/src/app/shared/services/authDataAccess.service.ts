import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';

import { type LoginDto, type SessionDto } from 'src/app/shared/definitions/dtos.definitions';
import { Session } from 'src/app/shared/models/session/session.models';
import { SessionMapper } from 'src/app/shared/utils/mappers/sessionMapper.utils';

/** Llamadas al API de la autenticación. Cada llamada devuelve el `Observable` de `HttpClient`. */
export class AuthDataAccessService {
	//#region PRIVATE CONSTANTS

	/** Milisegundos que se espera la sesión actual: se pide al arrancar y, si el API no responde, no puede dejar la pantalla en blanco. */
	private static readonly _GET_SESSION_TIMEOUT_MS: number = 8000;

	//#endregion PRIVATE CONSTANTS

	//#region PRIVATE PROPERTIES

	/** URL base de los endpoints de la autenticación. */
	private readonly _BaseUrl: string;

	/** Cliente HTTP de Angular. */
	private readonly _Http: HttpClient;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param http Cliente HTTP de Angular.
	 * @param apiUrl URL base del API.
	 */
	constructor(http: HttpClient, apiUrl: string) {
		this._BaseUrl = `${apiUrl}/auth`;
		this._Http = http;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Pide la sesión abierta con la cookie que ya tiene el navegador.
	 * @returns La sesión actual; la petición falla (401) si no hay sesión o ha caducado, y también si el API tarda más de unos segundos.
	 */
	public GetSession(): Observable<Session> {
		return this._Http
			.get<SessionDto>(`${this._BaseUrl}/me`)
			.pipe(
				timeout(AuthDataAccessService._GET_SESSION_TIMEOUT_MS),
				map((dto: SessionDto) => SessionMapper.ToModel(dto))
			);
	}

	/**
	 * Inicia sesión. El API responde con la cookie de sesión, que el navegador guarda.
	 * @param nick Alias del usuario.
	 * @param password Contraseña en texto plano.
	 * @returns La sesión abierta; la petición falla (401) si las credenciales no son correctas, o (429) si hay demasiados intentos.
	 */
	public Login(nick: string, password: string): Observable<Session> {
		const body: LoginDto = { nick: nick, password: password };

		return this._Http.post<SessionDto>(`${this._BaseUrl}/login`, body).pipe(map((dto: SessionDto) => SessionMapper.ToModel(dto)));
	}

	/**
	 * Cierra la sesión. El API borra la cookie de sesión.
	 * @returns Una respuesta vacía al terminar.
	 */
	public Logout(): Observable<void> {
		return this._Http.post<void>(`${this._BaseUrl}/logout`, null);
	}

	//#endregion PUBLIC METHODS
}
