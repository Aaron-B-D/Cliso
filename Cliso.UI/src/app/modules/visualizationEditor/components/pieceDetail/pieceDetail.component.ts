import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { VisualizationMarkerPanelComponent } from 'src/app/modules/visualizationEditor/components/markerPanel/markerPanel.component';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { VisualizationPieceType, VisualizationPieceTypeInfo } from 'src/app/shared/definitions/visualization.definitions';
import { BimViewerElement } from 'src/app/shared/models/bimViewer/bimViewerElement.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { VisualizationPieceTypes } from 'src/app/shared/utils/visualization/visualizationPieceTypes.utils';

/**
 * Panel de detalle de la pieza seleccionada. No conoce los datos de ningún tipo: muestra el nombre del tipo de la pieza y
 * delega en el panel especializado de ese tipo. Para soportar un tipo nuevo, se crea su panel y se añade aquí una rama.
 */
@Component({
	selector: 'app-visualization-piece-detail',
	imports: [MatButtonModule, MatTooltipModule, VisualizationMarkerPanelComponent],
	templateUrl: './pieceDetail.component.html',
	styleUrl: './pieceDetail.component.scss'
})
export class VisualizationPieceDetailComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** `true` si el usuario puede cambiar o quitar la pieza. */
	@Input() public CanEdit: boolean = false;

	/** Se emite con el identificador del elemento del modelo al que se acaba de anclar la pieza. */
	@Output() public anchored: EventEmitter<number> = new EventEmitter<number>();

	/** Se emite cuando se ha cambiado algún dato de la pieza. */
	@Output() public changed: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite al pulsar quitar la pieza. */
	@Output() public deleted: EventEmitter<void> = new EventEmitter<void>();

	/** Elementos del modelo a los que se puede anclar una pieza. Vacío mientras no se han cargado. */
	@Input() public Elements: BimViewerElement[] = [];

	/** Se emite al pedir la lista de elementos del modelo. */
	@Output() public elementsRequested: EventEmitter<void> = new EventEmitter<void>();

	/** `true` mientras se carga la lista de elementos del modelo. */
	@Input() public IsLoadingElements: boolean = false;

	/** Se emite al pulsar el botón que lleva la vista a la pieza. */
	@Output() public locateRequested: EventEmitter<void> = new EventEmitter<void>();

	/** Pieza seleccionada. Con `null` no hay ninguna. */
	@Input() public Piece: VisualizationPiece | null = null;

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	/** Tipo de pieza marcador, para elegir su panel. */
	public readonly MARKER_TYPE: VisualizationPieceType = VisualizationPieceType.MARKER;

	/** «Sin tipo»: no hay ninguna pieza seleccionada. */
	public readonly NO_TYPE: VisualizationPieceType | null = null;

	//#region LANGUAGE TEXTS

	/** Botón que quita la pieza. */
	public readonly DELETE_TEXT: string = LanguageManager.GetText('VPD_DELETE');

	/** Texto cuando no hay ninguna pieza seleccionada. */
	public readonly EMPTY_TEXT: string = LanguageManager.GetText('VPD_EMPTY');

	/** Botón que lleva la vista a la pieza. */
	public readonly LOCATE_TEXT: string = LanguageManager.GetText('VPD_LOCATE');

	/** Texto cuando la pieza es de un tipo que este panel aún no sabe mostrar. */
	public readonly UNSUPPORTED_TEXT: string = LanguageManager.GetText('VPD_UNSUPPORTED');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Título del panel cuando no hay ninguna pieza seleccionada. */
	private readonly _DEFAULT_TITLE_TEXT: string = LanguageManager.GetText('VPD_TITLE');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** `true` si se puede quitar la pieza: se puede editar y hay una seleccionada. */
	public CanDelete: boolean = false;

	/** `true` si la pieza seleccionada tiene un lugar en el modelo al que llevar la vista. */
	public CanLocate: boolean = false;

	/** Icono del botón de quitar. */
	public DeleteIcon: string = IconsUtils.GetUrl(IconName.DELETE);

	/** `true` si hay una pieza seleccionada. */
	public HasPiece: boolean = false;

	/** Icono del botón de ir a la pieza. */
	public LocateIcon: string = IconsUtils.GetUrl(IconName.MY_LOCATION);

	/** Tipo de la pieza seleccionada. Es `null` si no hay ninguna. */
	public PieceType: VisualizationPieceType | null = null;

	/** Título del panel: el nombre del tipo de la pieza seleccionada o, sin pieza, uno genérico. */
	public TitleText: string = '';

	//#endregion PUBLIC PROPERTIES

	//#region EMITTERS

	private emitAnchored(id: number): void {
		this.anchored.emit(id);
	}

	private emitChanged(): void {
		this.changed.emit();
	}

	private emitDeleted(): void {
		this.deleted.emit();
	}

	private emitElementsRequested(): void {
		this.elementsRequested.emit();
	}

	private emitLocateRequested(): void {
		this.locateRequested.emit();
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		const info: VisualizationPieceTypeInfo | null = CheckUtils.IsNull(this.Piece) ? null : VisualizationPieceTypes.Get(this.Piece.Type);

		this.CanLocate = !CheckUtils.IsNull(this.Piece) && !CheckUtils.IsNull(this.Piece.GetFocusPoint());
		this.HasPiece = !CheckUtils.IsNull(this.Piece);
		this.CanDelete = this.CanEdit && this.HasPiece;
		this.PieceType = CheckUtils.IsNull(this.Piece) ? null : this.Piece.Type;
		this.TitleText = CheckUtils.IsNull(info) ? this._DEFAULT_TITLE_TEXT : info.Name;
	}

	public ngOnDestroy(): void {
		this.anchored.complete();
		this.changed.complete();
		this.deleted.complete();
		this.elementsRequested.complete();
		this.locateRequested.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnAnchored(id: number): void {
		this.emitAnchored(id);
	}

	public OnChanged(): void {
		this.emitChanged();
	}

	public OnDeleteClicked(): void {
		this.emitDeleted();
	}

	public OnElementsRequested(): void {
		this.emitElementsRequested();
	}

	public OnLocateClicked(): void {
		this.emitLocateRequested();
	}

	//#endregion SUBSCRIBERS
}
