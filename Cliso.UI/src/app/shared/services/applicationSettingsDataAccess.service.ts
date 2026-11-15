import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ApplicationSettingsParameter } from 'src/app/shared/definitions/applicationSettings.definitions';
import {
	ApplicationParameterDto,
	ApplicationParameterModificationDto,
	ApplicationParametersDto
} from 'src/app/shared/definitions/dtos.definitions';
import { ApplicationSettingsParameterBase } from 'src/app/shared/models/applicationSettings/applicationSettingsParameterBase.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ApplicationSettingsMapper } from 'src/app/shared/utils/mappers/applicationSettingsMapper.utils';

/** Llamadas al API de los parámetros de la aplicación. Cada llamada devuelve el `Observable` de `HttpClient`. */
export class ApplicationSettingsDataAccessService {
	//#region PRIVATE PROPERTIES

	/** URL base de los endpoints de los parámetros de la aplicación. */
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
		this._BaseUrl = `${apiUrl}/application-parameters`;
		this._Http = http;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Pide todos los parámetros de la aplicación.
	 * @returns Los parámetros con su valor actual; se descartan los que el front no conoce.
	 */
	public GetAll(): Observable<ApplicationSettingsParameterBase[]> {
		return this._Http.get<ApplicationParametersDto>(this._BaseUrl).pipe(
			map((dto: ApplicationParametersDto): ApplicationSettingsParameterBase[] => {
				const result: ApplicationSettingsParameterBase[] = [];

				for (const item of dto.parameters) {
					const parameter: ApplicationSettingsParameterBase | null = ApplicationSettingsMapper.ToModel(item);

					if (!CheckUtils.IsNull(parameter)) {
						result.push(parameter);
					} else {
						// Ya se ha avisado en el mapper
					}
				}

				return result;
			})
		);
	}

	/**
	 * Modifica el valor actual de un parámetro. Su valor por defecto no cambia.
	 * @param parameter Parámetro que se modifica.
	 * @param value Valor nuevo, como texto.
	 * @returns El parámetro modificado; la petición falla (400) si el valor no es válido, o (403) si el rol no permite modificarlo.
	 */
	public Update(parameter: ApplicationSettingsParameter, value: string): Observable<ApplicationSettingsParameterBase> {
		const body: ApplicationParameterModificationDto = { value: value };

		return this._Http.put<ApplicationParameterDto>(`${this._BaseUrl}/${parameter}`, body).pipe(
			map((dto: ApplicationParameterDto): ApplicationSettingsParameterBase => {
				const result: ApplicationSettingsParameterBase | null = ApplicationSettingsMapper.ToModel(dto);

				if (CheckUtils.IsNull(result)) {
					throw new Error(
						'ApplicationSettingsDataAccessService.Update() => el API devolvió un parámetro desconocido: ' + dto.type
					);
				} else {
					// Parámetro conocido
				}

				return result;
			})
		);
	}

	//#endregion PUBLIC METHODS
}
