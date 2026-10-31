import { IconName } from 'src/app/shared/definitions/icons.definitions';

/** Utilidades de los iconos SVG de la aplicación. */
export class IconsUtils {
	//#region PUBLIC CONSTANTS

	/** Carpeta, relativa a la raíz de la aplicación, desde la que se sirven los iconos (`src/resources/img/icons`). */
	public static readonly PATH: string = 'img/icons';

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC STATIC METHODS

	/**
	 * Devuelve la ruta del fichero SVG de un icono.
	 * @param name Nombre del icono.
	 * @returns La ruta del fichero.
	 */
	public static GetUrl(name: IconName): string {
		return IconsUtils.PATH + '/' + name + '.svg';
	}

	//#endregion PUBLIC STATIC METHODS
}
