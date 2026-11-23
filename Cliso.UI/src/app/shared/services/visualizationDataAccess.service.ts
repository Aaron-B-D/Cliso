import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { VisualizationDto } from 'src/app/shared/definitions/dtos.definitions';

/** Llamadas al API de las visualizaciones. Cada llamada devuelve el `Observable` de `HttpClient`. */
export class VisualizationDataAccessService {
	//#region PRIVATE PROPERTIES

	/** URL base de los endpoints de las visualizaciones. */
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
		this._BaseUrl = `${apiUrl}/visualizations`;
		this._Http = http;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Añade una visualización, de la que será propietario el usuario de la sesión.
	 * @param visualization Datos de la visualización, con sus piezas si las lleva.
	 * @returns La visualización creada, con su identificador.
	 */
	public Add(visualization: VisualizationDto): Observable<VisualizationDto> {
		return this._Http.post<VisualizationDto>(this._BaseUrl, visualization);
	}

	/**
	 * Elimina una visualización.
	 * @param id Identificador de la visualización.
	 * @param force Con `false` el borrado es lógico (se conservan sus datos); con `true` se borran de verdad la visualización y sus piezas.
	 * @returns Una respuesta vacía al terminar.
	 */
	public Delete(id: number, force: boolean): Observable<void> {
		const params: HttpParams = new HttpParams().set('force', force);

		return this._Http.delete<void>(`${this._BaseUrl}/${id}`, { params: params });
	}

	/**
	 * Obtiene una visualización.
	 * @param id Identificador de la visualización.
	 * @param depth 0 para recuperarla sin piezas; 1 para incluirlas.
	 * @returns La visualización.
	 */
	public Get(id: number, depth: number): Observable<VisualizationDto> {
		const params: HttpParams = new HttpParams().set('depth', depth);

		return this._Http.get<VisualizationDto>(`${this._BaseUrl}/${id}`, { params: params });
	}

	/**
	 * Obtiene las visualizaciones activas que puede ver el usuario.
	 * @param depth 0 para recuperarlas sin piezas; 1 para incluirlas.
	 * @returns Las visualizaciones.
	 */
	public GetAll(depth: number): Observable<VisualizationDto[]> {
		const params: HttpParams = new HttpParams().set('depth', depth);

		return this._Http.get<VisualizationDto[]>(this._BaseUrl, { params: params });
	}

	/**
	 * Modifica el nombre, la descripción, las observaciones, la visibilidad y las piezas de una visualización. El modelo BIM no se puede cambiar.
	 * @param id Identificador de la visualización.
	 * @param visualization Nuevos datos. Con `pieces` a `null` las piezas guardadas no se tocan; con una lista, se sustituyen todas.
	 * @returns La visualización modificada.
	 */
	public Update(id: number, visualization: VisualizationDto): Observable<VisualizationDto> {
		return this._Http.put<VisualizationDto>(`${this._BaseUrl}/${id}`, visualization);
	}

	//#endregion PUBLIC METHODS
}
