import { BimViewerStyle } from 'src/app/shared/models/bimViewer/bimViewerStyle.models';
import { BimViewerView } from 'src/app/shared/models/bimViewer/bimViewerView.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/**
 * Configuración con la que se muestra un modelo en el visor: qué modelo es, su aspecto y las vistas de la cámara. Su JSON es
 * la propia clase (`JSON.stringify`) y `Convert` hace el camino inverso, para conservarla entre sesiones.
 */
export class BimViewerConfiguration {
	//#region PUBLIC PROPERTIES

	/** Última posición de la cámara, a la que se vuelve al reabrir el modelo. Es `null` si aún no se ha movido. */
	public CurrentView: BimViewerView | null;

	/** Vista a la que vuelve la cámara al restaurar la vista. Es `null` si se usa la del encuadre automático del modelo. */
	public DefaultView: BimViewerView | null;

	/** Identificador del modelo BIM mostrado. */
	public ModelId: number;

	/** Aspecto del visor. */
	public Style: BimViewerStyle;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param modelId Identificador del modelo BIM mostrado.
	 * @param style Aspecto del visor.
	 * @param defaultView Vista a la que vuelve la cámara al restaurar la vista. `null` si se usa la del encuadre automático.
	 * @param currentView Última posición de la cámara. `null` si aún no se ha movido.
	 */
	constructor(
		modelId: number,
		style: BimViewerStyle = new BimViewerStyle(),
		defaultView: BimViewerView | null = null,
		currentView: BimViewerView | null = null
	) {
		this.CurrentView = currentView;
		this.DefaultView = defaultView;
		this.ModelId = modelId;
		this.Style = style;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC STATIC METHODS

	/**
	 * Recupera la configuración a partir de su serialización en JSON. Lo que falte en el aspecto, o no sea válido, toma el valor
	 * por defecto; una vista no válida queda en `null`.
	 * @param obj Objeto leído del JSON.
	 * @returns La configuración, o `null` si no dice de qué modelo es.
	 */
	public static Convert(obj: Partial<BimViewerConfiguration> | null | undefined): BimViewerConfiguration | null {
		let result: BimViewerConfiguration | null = null;

		if (!CheckUtils.IsNullOrUndefined(obj) && CheckUtils.IsNumber(obj.ModelId)) {
			result = new BimViewerConfiguration(
				obj.ModelId,
				BimViewerStyle.Convert(obj.Style),
				BimViewerView.Convert(obj.DefaultView),
				BimViewerView.Convert(obj.CurrentView)
			);
		} else {
			console.warn('BimViewerConfiguration.Convert() => la configuración no indica el modelo');
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
