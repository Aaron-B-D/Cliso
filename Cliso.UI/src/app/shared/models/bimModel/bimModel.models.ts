import { Temporal } from 'temporal-polyfill';

import { type DateInput } from 'src/app/shared/definitions/date.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { DateUtils } from 'src/app/shared/utils/date.utils';

/** Modelo BIM: sus datos básicos y los del fichero IFC asociado. */
export class BimModel {
	//#region PUBLIC PROPERTIES

	/** Fecha de creación. Es `null` mientras el modelo no se ha guardado. */
	public CreationDate: Temporal.ZonedDateTime | null;

	/** Descripción del modelo. */
	public Description: string;

	/** Nombre del fichero IFC. Es el texto sin definir mientras el modelo no tiene fichero. */
	public FileName: string;

	/** Tamaño del fichero IFC en bytes. Es 0 mientras el modelo no tiene fichero. */
	public FileSize: number;

	/** Identificador del modelo. Es el identificador sin definir mientras el modelo no se ha guardado. */
	public Id: number;

	/** Nombre del modelo. */
	public Name: string;

	/** Observaciones adicionales sobre el modelo. */
	public Observations: string;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador del modelo.
	 * @param name Nombre del modelo.
	 * @param description Descripción del modelo.
	 * @param observations Observaciones adicionales sobre el modelo.
	 * @param fileName Nombre del fichero IFC.
	 * @param fileSize Tamaño del fichero IFC en bytes.
	 * @param creationDate Fecha de creación, en cualquier formato que `DateUtils.Parse` entienda (por ejemplo, el texto del API). Se convierte al instante.
	 */
	constructor(
		id: number,
		name: string,
		description: string,
		observations: string,
		fileName: string,
		fileSize: number,
		creationDate: DateInput | null
	) {
		this.CreationDate = CheckUtils.IsNull(creationDate) ? null : DateUtils.Parse(creationDate);
		this.Description = description;
		this.FileName = fileName;
		this.FileSize = fileSize;
		this.Id = id;
		this.Name = name;
		this.Observations = observations;
	}

	//#endregion CONSTRUCTOR
}
