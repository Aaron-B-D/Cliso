import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserCreationDto, UserDto, UserModificationDto } from 'src/app/shared/definitions/dtos.definitions';

/** Llamadas al API de los usuarios. Cada llamada devuelve el `Observable` de `HttpClient`. */
export class UserDataAccessService {
	//#region PRIVATE PROPERTIES

	/** URL base de los endpoints de los usuarios. */
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
		this._BaseUrl = `${apiUrl}/users`;
		this._Http = http;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Crea un usuario.
	 * @param user Datos del usuario, con su contraseña.
	 * @returns El usuario creado, con su identificador; la petición falla (400) si los datos o la contraseña no son válidos, o (409) si el nick ya existe.
	 */
	public Add(user: UserCreationDto): Observable<UserDto> {
		return this._Http.post<UserDto>(this._BaseUrl, user);
	}

	/**
	 * Elimina un usuario.
	 * @param id Identificador del usuario.
	 * @param force Con `false` el borrado es lógico (se conservan sus datos); con `true` se borra todo de verdad.
	 * @returns Una respuesta vacía al terminar; la petición falla (403) si es el usuario de la sesión o el protegido.
	 */
	public Delete(id: number, force: boolean): Observable<void> {
		const params: HttpParams = new HttpParams().set('force', force);

		return this._Http.delete<void>(`${this._BaseUrl}/${id}`, { params: params });
	}

	/**
	 * Obtiene todos los usuarios activos.
	 * @returns Los usuarios.
	 */
	public GetAll(): Observable<UserDto[]> {
		return this._Http.get<UserDto[]>(this._BaseUrl);
	}

	/**
	 * Modifica el nombre, los apellidos y el rol de un usuario y, si se indica, su contraseña. El nick no se puede cambiar.
	 * @param id Identificador del usuario.
	 * @param user Nuevos datos del usuario, con el nick que ya tiene.
	 * @returns El usuario modificado; la petición falla (400) si los datos o la contraseña no son válidos, o (403) si se cambia el rol del usuario protegido.
	 */
	public Update(id: number, user: UserModificationDto): Observable<UserDto> {
		return this._Http.put<UserDto>(`${this._BaseUrl}/${id}`, user);
	}

	//#endregion PUBLIC METHODS
}
