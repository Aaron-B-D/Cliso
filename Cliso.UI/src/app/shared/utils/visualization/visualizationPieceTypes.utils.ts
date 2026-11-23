import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { VisualizationPieceType, VisualizationPieceTypeInfo } from 'src/app/shared/definitions/visualization.definitions';
import { BimViewerHit } from 'src/app/shared/models/bimViewer/bimViewerHit.models';
import { BimModelVisualizationMarkerPiece } from 'src/app/shared/models/visualization/bimModelVisualizationMarkerPiece.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/**
 * Catálogo de los tipos de pieza que puede llevar una visualización. Para añadir un tipo nuevo se declara aquí con su
 * nombre, su descripción y su icono; las listas y el selector de tipos lo muestran sin más cambios.
 */
export class VisualizationPieceTypes {
	//#region PUBLIC STATIC METHODS

	/**
	 * Devuelve cómo se presentan al usuario todos los tipos de pieza.
	 * @returns Un registro por tipo, en el orden en que se ofrecen al añadir.
	 */
	public static GetAll(): VisualizationPieceTypeInfo[] {
		return [
			{
				Create: (hit: BimViewerHit, title: string): VisualizationPiece => BimModelVisualizationMarkerPiece.CreateAt(hit, title),
				Description: LanguageManager.GetText('WEB_PIECE_MARKER_DESCRIPTION'),
				IconUrl: IconsUtils.GetUrl(IconName.LOCATION_ON),
				Name: LanguageManager.GetText('WEB_PIECE_MARKER_NAME'),
				Type: VisualizationPieceType.MARKER
			}
		];
	}

	/**
	 * Devuelve cómo se presenta al usuario un tipo de pieza.
	 * @param type Tipo de pieza.
	 * @returns El registro del tipo, o `null` si no está en el catálogo.
	 */
	public static Get(type: VisualizationPieceType): VisualizationPieceTypeInfo | null {
		const found: VisualizationPieceTypeInfo | undefined = VisualizationPieceTypes.GetAll().find(
			(info: VisualizationPieceTypeInfo): boolean => info.Type === type
		);
		let result: VisualizationPieceTypeInfo | null = null;

		if (!found) {
			console.warn(`VisualizationPieceTypes.Get() => tipo no declarado en el catálogo: ${type}`);
		} else {
			result = found;
		}

		return result;
	}

	//#endregion PUBLIC STATIC METHODS
}
