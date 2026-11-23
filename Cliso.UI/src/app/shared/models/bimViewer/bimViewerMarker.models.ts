import {
	BimViewerMarkerIcon,
	BimViewerMarkerLinkTarget,
	BimViewerMarkerTitlePosition
} from 'src/app/shared/definitions/bimViewer.definitions';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { Color } from 'src/app/shared/models/color/color.models';

/** Marcador que el visor pinta sobre el modelo: un icono de un color, con un título, en una coordenada del mundo. */
export class BimViewerMarker {
	//#region PUBLIC PROPERTIES

	/** Identificador local, dentro del modelo, del elemento al que está anclado el marcador. Es `null` si está libre. */
	public AnchorId: number | null = null;

	/** Color del icono. */
	public Color: Color;

	/** Descripción que se muestra en la información emergente. */
	public Description: string = '';

	/** Indica si el marcador se atenúa mientras el puntero no está encima de él. */
	public DimWhenIdle: boolean = false;

	/** Indica si al seleccionar el marcador se resalta el elemento al que está anclado. */
	public HighlightOnSelect: boolean = false;

	/** Icono del marcador. */
	public Icon: BimViewerMarkerIcon;

	/** Identificador con el que el visor avisa de este marcador al seleccionarlo o moverlo. */
	public Id: number;

	/** Enlace asociado al marcador. Vacío si no tiene. */
	public Link: string = '';

	/** Dónde se abre el enlace. */
	public LinkTarget: BimViewerMarkerLinkTarget = BimViewerMarkerLinkTarget.NEW_WINDOW;

	/** Opacidad del marcador, de 0 (invisible) a 1 (opaco). */
	public Opacity: number = 1;

	/** Coordenada del mundo donde se pinta el marcador. */
	public Position: BimViewerPoint;

	/** Tamaño del marcador, como factor del tamaño normal (1 es el normal). */
	public Size: number;

	/** Color del título. */
	public TextColor: Color = new Color('#FFFFFF');

	/** Título del marcador. */
	public Text: string;

	/** Dónde se escribe el título respecto al icono. */
	public TitlePosition: BimViewerMarkerTitlePosition = BimViewerMarkerTitlePosition.BELOW;

	/** Indica si el marcador se ve a través del modelo cuando hay elementos delante. */
	public VisibleThroughModel: boolean = true;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param id Identificador con el que el visor avisa de este marcador.
	 * @param position Coordenada del mundo donde se pinta el marcador.
	 * @param color Color del icono.
	 * @param icon Icono del marcador.
	 * @param size Tamaño del marcador, como factor del tamaño normal.
	 * @param text Título que se escribe bajo el icono.
	 */
	constructor(id: number, position: BimViewerPoint, color: Color, icon: BimViewerMarkerIcon, size: number, text: string) {
		this.Color = color;
		this.Icon = icon;
		this.Id = id;
		this.Position = position;
		this.Size = size;
		this.Text = text;
	}

	//#endregion CONSTRUCTOR
}
