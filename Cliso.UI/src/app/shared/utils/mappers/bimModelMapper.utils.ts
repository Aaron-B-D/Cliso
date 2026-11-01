import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { type BimModelDto } from 'src/app/shared/definitions/dtos.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Convierte, campo a campo, entre el modelo BIM del front y el que envía y recibe el API. */
export class BimModelMapper {
	//#region PUBLIC STATIC METHODS

	/**
	 * Convierte el modelo del front al que entiende el API. El API ignora lo que asigna él mismo (identificador, fichero y fecha).
	 * @param model Modelo del front.
	 * @returns El modelo para el API.
	 */
	public static ToDto(model: BimModel): BimModelDto {
		return {
			id: model.Id === ID_NUMERIC_UNDEFINED ? null : model.Id,
			name: model.Name,
			description: model.Description,
			observations: model.Observations,
			file_name: model.FileName === STRING_UNDEFINED ? null : model.FileName,
			creation_date: CheckUtils.IsNull(model.CreationDate) ? null : model.CreationDate.toInstant().toString(),
			file_size: model.FileSize
		};
	}

	/**
	 * Convierte el modelo que envía el API al del front.
	 * @param dto Modelo del API.
	 * @returns El modelo del front.
	 */
	public static ToModel(dto: BimModelDto): BimModel {
		return new BimModel(
			CheckUtils.IsNull(dto.id) ? ID_NUMERIC_UNDEFINED : dto.id,
			dto.name,
			dto.description,
			dto.observations,
			CheckUtils.IsNull(dto.file_name) ? STRING_UNDEFINED : dto.file_name,
			CheckUtils.IsNull(dto.file_size) ? 0 : dto.file_size,
			dto.creation_date
		);
	}

	//#endregion PUBLIC STATIC METHODS
}
