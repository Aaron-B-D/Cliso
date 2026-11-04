import { Color } from 'src/app/shared/models/color/color.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/**
 * Aspecto del visor 3D: colores, rejilla (tamaño de las cuadrículas primaria y secundaria, color y si se pinta) y si se
 * resaltan las piezas al hacer clic en ellas.
 */
export class BimViewerStyle {
	//#region PRIVATE CONSTANTS

	/** Color de fondo por defecto (el token `--color-bg`; el motor 3D no puede leer variables CSS). */
	private static readonly _DEFAULT_BACKGROUND_COLOR: string = '#000000';

	/** Color de la rejilla por defecto (el token `--color-border`). */
	private static readonly _DEFAULT_GRID_COLOR: string = '#2F3336';

	/** Tamaño de las cuadrículas de la rejilla primaria por defecto. */
	private static readonly _DEFAULT_GRID_PRIMARY_SIZE: number = 1;

	/** Tamaño de las cuadrículas de la rejilla secundaria por defecto: cada una abarca diez de las primarias. */
	private static readonly _DEFAULT_GRID_SECONDARY_SIZE: number = 10;

	/** Color de resaltado por defecto: un gris plata, que se distingue sobre las paredes blancas de los modelos sencillos. */
	private static readonly _DEFAULT_HIGHLIGHT_COLOR: string = '#C0C0C0';

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Color de fondo. */
	public BackgroundColor: Color;

	/** Color de la rejilla. */
	public GridColor: Color;

	/** Tamaño de las cuadrículas de la rejilla primaria. */
	public GridPrimarySize: number;

	/** Tamaño de las cuadrículas de la rejilla secundaria, que subdivide el espacio de la primaria. */
	public GridSecondarySize: number;

	/** `true` si se pinta la rejilla. */
	public GridVisible: boolean;

	/** Color con el que se resalta una pieza. */
	public HighlightColor: Color;

	/** `true` si se resaltan las piezas al hacer clic en ellas. */
	public HighlightEnabled: boolean;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * Sin argumentos crea el aspecto con el que arranca el visor, el mismo siempre hasta que el usuario lo cambie.
	 * @param backgroundColor Color de fondo.
	 * @param gridColor Color de la rejilla.
	 * @param gridPrimarySize Tamaño de las cuadrículas de la rejilla primaria.
	 * @param gridSecondarySize Tamaño de las cuadrículas de la rejilla secundaria.
	 * @param gridVisible `true` si se pinta la rejilla.
	 * @param highlightColor Color con el que se resalta una pieza.
	 * @param highlightEnabled `true` si se resaltan las piezas al hacer clic en ellas.
	 */
	constructor(
		backgroundColor: Color = new Color(BimViewerStyle._DEFAULT_BACKGROUND_COLOR),
		gridColor: Color = new Color(BimViewerStyle._DEFAULT_GRID_COLOR),
		gridPrimarySize: number = BimViewerStyle._DEFAULT_GRID_PRIMARY_SIZE,
		gridSecondarySize: number = BimViewerStyle._DEFAULT_GRID_SECONDARY_SIZE,
		gridVisible: boolean = true,
		highlightColor: Color = new Color(BimViewerStyle._DEFAULT_HIGHLIGHT_COLOR),
		highlightEnabled: boolean = false
	) {
		this.BackgroundColor = backgroundColor;
		this.GridColor = gridColor;
		this.GridPrimarySize = gridPrimarySize;
		this.GridSecondarySize = gridSecondarySize;
		this.GridVisible = gridVisible;
		this.HighlightColor = highlightColor;
		this.HighlightEnabled = highlightEnabled;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC STATIC METHODS

	/**
	 * Recupera el aspecto a partir de su serialización en JSON. Lo que falte o no sea válido toma el valor por defecto.
	 * @param obj Objeto leído del JSON.
	 * @returns El aspecto.
	 */
	public static Convert(obj: Partial<BimViewerStyle> | null | undefined): BimViewerStyle {
		const result: BimViewerStyle = new BimViewerStyle();

		if (CheckUtils.IsNullOrUndefined(obj)) {
			// Sin aspecto guardado: el de por defecto
		} else {
			result.BackgroundColor = Color.Convert(obj.BackgroundColor) ?? result.BackgroundColor;
			result.GridColor = Color.Convert(obj.GridColor) ?? result.GridColor;
			result.HighlightColor = Color.Convert(obj.HighlightColor) ?? result.HighlightColor;

			if (CheckUtils.IsNumber(obj.GridPrimarySize) && Number.isFinite(obj.GridPrimarySize) && obj.GridPrimarySize > 0) {
				result.GridPrimarySize = obj.GridPrimarySize;
			} else {
				// Tamaño no válido: el de por defecto
			}

			if (CheckUtils.IsNumber(obj.GridSecondarySize) && Number.isFinite(obj.GridSecondarySize) && obj.GridSecondarySize > 0) {
				result.GridSecondarySize = obj.GridSecondarySize;
			} else {
				// Tamaño no válido: el de por defecto
			}

			if (typeof obj.GridVisible === 'boolean') {
				result.GridVisible = obj.GridVisible;
			} else {
				// Sin valor válido: el de por defecto
			}

			if (typeof obj.HighlightEnabled === 'boolean') {
				result.HighlightEnabled = obj.HighlightEnabled;
			} else {
				// Sin valor válido: el de por defecto
			}
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
