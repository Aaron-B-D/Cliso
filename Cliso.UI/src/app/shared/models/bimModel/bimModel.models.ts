import { IComparable } from 'src/app/shared/interfaces/comparable.interface';

/** Modelo BIM: sus datos básicos y los del fichero IFC asociado. */
export class BimModel implements IComparable {
	//#region PUBLIC PROPERTIES

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
	 */
	constructor(id: number, name: string, description: string, observations: string, fileName: string, fileSize: number) {
		this.Description = description;
		this.FileName = fileName;
		this.FileSize = fileSize;
		this.Id = id;
		this.Name = name;
		this.Observations = observations;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Indica si otro modelo tiene los mismos datos que este.
	 * @param other Modelo con el que se compara.
	 * @returns `true` si tienen el mismo identificador, nombre, descripción, observaciones y fichero.
	 */
	public Equals(other: BimModel): boolean {
		return (
			this.Id === other.Id &&
			this.Name === other.Name &&
			this.Description === other.Description &&
			this.Observations === other.Observations &&
			this.FileName === other.FileName &&
			this.FileSize === other.FileSize
		);
	}

	//#endregion PUBLIC METHODS
}
