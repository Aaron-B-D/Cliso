import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { type BimModelDto } from 'src/app/shared/definitions/dtos.definitions';

/** Llamadas al API de los modelos BIM. Cada llamada devuelve el `Observable` de `HttpClient`. */
export class BimModelDataAccessService {
	//#region PRIVATE PROPERTIES

	/** URL base de los endpoints de los modelos BIM. */
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
		this._BaseUrl = `${apiUrl}/bim-models`;
		this._Http = http;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Añade un modelo BIM con sus datos básicos. El fichero IFC se sube después con `SetContent`.
	 * @param model Datos del modelo.
	 * @returns El modelo creado, con su identificador.
	 */
	public Add(model: BimModelDto): Observable<BimModelDto> {
		return this._Http.post<BimModelDto>(this._BaseUrl, model);
	}

	/**
	 * Elimina un modelo BIM.
	 * @param id Identificador del modelo.
	 * @param force Con `false` el borrado es lógico (se conservan sus datos y su fichero); con `true` se borra todo de verdad.
	 * @returns Una respuesta vacía al terminar.
	 */
	public Delete(id: number, force: boolean): Observable<void> {
		const params: HttpParams = new HttpParams().set('force', force);

		return this._Http.delete<void>(`${this._BaseUrl}/${id}`, { params: params });
	}

	/**
	 * Obtiene un modelo BIM.
	 * @param id Identificador del modelo.
	 * @returns El modelo.
	 */
	public Get(id: number): Observable<BimModelDto> {
		return this._Http.get<BimModelDto>(`${this._BaseUrl}/${id}`);
	}

	/**
	 * Obtiene todos los modelos BIM activos.
	 * @returns Los modelos.
	 */
	public GetAll(): Observable<BimModelDto[]> {
		return this._Http.get<BimModelDto[]>(this._BaseUrl);
	}

	/**
	 * Descarga el fichero IFC de un modelo BIM, informando del progreso.
	 * @param id Identificador del modelo.
	 * @returns Los eventos de la descarga; el último trae el fichero.
	 */
	public GetContent(id: number): Observable<HttpEvent<Blob>> {
		return this._Http.get(`${this._BaseUrl}/${id}/content`, {
			observe: 'events',
			reportProgress: true,
			responseType: 'blob'
		});
	}

	/**
	 * Sube el fichero IFC de un modelo BIM, informando del progreso. Si el modelo ya tenía fichero, lo sustituye.
	 * @param id Identificador del modelo.
	 * @param file Fichero IFC.
	 * @returns Los eventos de la subida; el último trae el modelo con el nombre del fichero ya actualizado.
	 */
	public SetContent(id: number, file: File): Observable<HttpEvent<BimModelDto>> {
		const params: HttpParams = new HttpParams().set('file_name', file.name);
		const headers: HttpHeaders = new HttpHeaders().set('Content-Type', 'application/octet-stream');

		return this._Http.put<BimModelDto>(`${this._BaseUrl}/${id}/content`, file, {
			headers: headers,
			observe: 'events',
			params: params,
			reportProgress: true
		});
	}

	/**
	 * Modifica el nombre y la descripción de un modelo BIM.
	 * @param id Identificador del modelo.
	 * @param model Nuevos datos del modelo.
	 * @returns El modelo modificado.
	 */
	public Update(id: number, model: BimModelDto): Observable<BimModelDto> {
		return this._Http.put<BimModelDto>(`${this._BaseUrl}/${id}`, model);
	}

	//#endregion PUBLIC METHODS
}
