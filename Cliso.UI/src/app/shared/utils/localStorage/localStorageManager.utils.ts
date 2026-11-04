import { LAST_BIM_MODEL_CONFIGURATION } from 'src/app/shared/definitions/localStorage.definitions';
import { BimViewerConfiguration } from 'src/app/shared/models/bimViewer/bimViewerConfiguration.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';

/** Guarda en el almacenamiento local del navegador lo que hay que recordar entre recargas de la página, sin cifrar. */
export class LocalStorageManager {
	//#region PUBLIC STATIC METHODS

	/** Borra la configuración guardada del último modelo BIM abierto. */
	public static ClearLastBimModelConfiguration(): void {
		try {
			window.localStorage.removeItem(LAST_BIM_MODEL_CONFIGURATION);
		} catch (error) {
			console.warn(`LocalStorageManager.ClearLastBimModelConfiguration() => ${ErrorUtils.GetMessage(error)}`);
		}
	}

	/**
	 * Recupera la configuración del último modelo BIM abierto.
	 * @returns La configuración guardada, o `null` si no hay ninguna o no es válida.
	 */
	public static GetLastBimModelConfiguration(): BimViewerConfiguration | null {
		let result: BimViewerConfiguration | null = null;

		try {
			const json: string | null = window.localStorage.getItem(LAST_BIM_MODEL_CONFIGURATION);

			if (CheckUtils.IsNull(json)) {
				// No hay nada guardado
			} else {
				result = BimViewerConfiguration.Convert(JSON.parse(json) as Partial<BimViewerConfiguration>);
			}
		} catch (error) {
			console.warn(`LocalStorageManager.GetLastBimModelConfiguration() => ${ErrorUtils.GetMessage(error)}`);
		}

		return result;
	}

	/**
	 * Guarda la configuración del modelo BIM abierto, para poder recuperarla si se recarga la página.
	 * @param configuration Configuración del visor.
	 */
	public static SetLastBimModelConfiguration(configuration: BimViewerConfiguration): void {
		try {
			window.localStorage.setItem(LAST_BIM_MODEL_CONFIGURATION, JSON.stringify(configuration));
		} catch (error) {
			console.warn(`LocalStorageManager.SetLastBimModelConfiguration() => ${ErrorUtils.GetMessage(error)}`);
		}
	}

	//#endregion PUBLIC STATIC METHODS
}
