/** Utilidades para trabajar con textos. */
export class StringUtils {
	//#region PUBLIC STATIC METHODS

	/**
	 * Sustituye los marcadores `{0}`, `{1}`, `{2}`... de un texto por los valores indicados, como `string.Format` de C#.
	 * Cada marcador se sustituye una sola vez: si un valor contiene otro marcador, se deja tal cual.
	 * @param template Texto con los marcadores (por ejemplo, `'Mostrar {0}'`).
	 * @param values Valores, por orden: el primero sustituye a `{0}`, el segundo a `{1}`...
	 * @returns El texto con los marcadores sustituidos. Un marcador sin valor se deja sin sustituir.
	 */
	public static Format(template: string, values: string[]): string {
		return template.replace(/\{(\d+)\}/g, (placeholder: string, indexText: string): string => {
			const index: number = Number(indexText);
			let result: string = placeholder;

			if (index < values.length) {
				result = values[index];
			} else {
				console.warn('StringUtils.Format() => falta el valor del marcador ' + placeholder);
			}

			return result;
		});
	}

	//#endregion PUBLIC STATIC METHODS
}
