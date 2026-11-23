import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { EditorCardComponent } from 'src/app/shared/components/editorCard/editorCard.component';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';

/** Pieza en la lista, con lo que la plantilla necesita ya calculado. */
export type VisualizationPieceListItem = {
	IconText: string;
	IconUrl: string;
	Id: number;
	IsSelected: boolean;
	Name: string;
	TypeName: string;
};

/**
 * Lista de las piezas de una visualización, de cualquier tipo, con el botón de añadir una nueva. Lo que se le pasa como
 * contenido es el panel flotante que se abre anclado al botón mientras `IsAddPanelOpen` es `true`.
 */
@Component({
	selector: 'app-visualization-piece-list',
	imports: [CdkConnectedOverlay, CdkOverlayOrigin, EditorCardComponent, MatButtonModule],
	templateUrl: './pieceList.component.html',
	styleUrl: './pieceList.component.scss'
})
export class VisualizationPieceListComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** Se emite al pulsar el botón de añadir una pieza. */
	@Output() public addClicked: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite al pulsar fuera del panel flotante de añadir, que se pide cerrar. */
	@Output() public addPanelClosed: EventEmitter<void> = new EventEmitter<void>();

	/** `true` si el usuario puede añadir piezas: si no, el botón no se muestra. */
	@Input() public CanAdd: boolean = false;

	/** `true` si el panel flotante de añadir está abierto junto al botón. */
	@Input() public IsAddPanelOpen: boolean = false;

	/** Piezas que se listan. */
	@Input() public Items: VisualizationPieceListItem[] = [];

	/** Se emite con el identificador de la pieza que se pulsa. */
	@Output() public pieceSelected: EventEmitter<number> = new EventEmitter<number>();

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Botón que abre el selector del tipo de pieza a añadir. */
	public readonly ADD_TEXT: string = LanguageManager.GetText('VPL_ADD');

	/** Texto cuando la visualización no tiene piezas. */
	public readonly EMPTY_TEXT: string = LanguageManager.GetText('VPL_EMPTY');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Separación, en píxeles, entre el botón de añadir y el panel flotante. */
	private readonly _ADD_PANEL_GAP: number = 8;

	/** Título de la lista, con el número de piezas en `{0}`. */
	private readonly _TITLE_TEXT: string = LanguageManager.GetText('VPL_TITLE');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono del botón de añadir. */
	public AddIcon: string = IconsUtils.GetUrl(IconName.ADD);

	/** Sitios donde se abre el panel de añadir, por orden de preferencia: a la izquierda del botón y, si no cabe, debajo de él. */
	public AddPanelPositions: ConnectedPosition[] = [
		{ originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -this._ADD_PANEL_GAP },
		{ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: this._ADD_PANEL_GAP },
		{ originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -this._ADD_PANEL_GAP }
	];

	/** `true` si hay alguna pieza que listar. */
	public HasItems: boolean = false;

	/** Título de la lista, con el número de piezas. */
	public TitleText: string = '';

	//#endregion PUBLIC PROPERTIES

	//#region EMITTERS

	private emitAddClicked(): void {
		this.addClicked.emit();
	}

	private emitAddPanelClosed(): void {
		this.addPanelClosed.emit();
	}

	private emitPieceSelected(id: number): void {
		this.pieceSelected.emit(id);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		this.HasItems = this.Items.length > 0;
		this.TitleText = StringUtils.Format(this._TITLE_TEXT, [String(this.Items.length)]);
	}

	public ngOnDestroy(): void {
		this.addClicked.complete();
		this.addPanelClosed.complete();
		this.pieceSelected.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnAddClicked(): void {
		this.emitAddClicked();
	}

	public OnAddPanelBackdropClicked(): void {
		this.emitAddPanelClosed();
	}

	public OnPieceClicked(id: number): void {
		this.emitPieceSelected(id);
	}

	//#endregion SUBSCRIBERS
}
