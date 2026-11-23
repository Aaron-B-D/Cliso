/** Elemento del modelo BIM cargado en el visor (un muro, una puerta...): lo que se puede señalar o a lo que se puede anclar una pieza. */
export class BimViewerElement {
	//#region PUBLIC PROPERTIES

	/** Categoría del elemento en el modelo (por ejemplo, `IFCWALL`). Vacía si no la tiene. */
	public Category: string;

	/** Identificador local del elemento dentro del modelo. */
	public Id: number;

	/** Nombre del elemento. Vacío si no lo tiene. */
	public Name: string;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador local del elemento dentro del modelo.
	 * @param name Nombre del elemento.
	 * @param category Categoría del elemento en el modelo.
	 */
	constructor(id: number, name: string, category: string) {
		this.Category = category;
		this.Id = id;
		this.Name = name;
	}

	//#endregion CONSTRUCTOR
}
