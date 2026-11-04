/** Contrato de las clases que se pueden comparar con otra instancia de su misma clase por su contenido. */
export interface IComparable {
	/**
	 * Indica si la instancia tiene el mismo contenido que otra de su misma clase.
	 * @param other Instancia con la que se compara.
	 * @returns `true` si tienen el mismo contenido.
	 */
	Equals(other: IComparable): boolean;
}
