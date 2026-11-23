import { Component, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EditorCardComponent } from 'src/app/shared/components/editorCard/editorCard.component';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { VisualizationPieceType, VisualizationPieceTypeInfo } from 'src/app/shared/definitions/visualization.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { VisualizationPieceTypes } from 'src/app/shared/utils/visualization/visualizationPieceTypes.utils';

/** Panel flotante para elegir el tipo de pieza que se añade a la visualización: una lista de fichas, una por tipo. */
@Component({
	selector: 'app-visualization-piece-picker',
	imports: [EditorCardComponent, MatButtonModule, MatTooltipModule],
	templateUrl: './piecePicker.component.html',
	styleUrl: './piecePicker.component.scss'
})
export class VisualizationPiecePickerComponent implements OnDestroy {
	//#region DECORATORS

	/** Se emite al pedir cerrar el panel sin elegir nada. */
	@Output() public closed: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite con el tipo elegido. */
	@Output() public typeChosen: EventEmitter<VisualizationPieceType> = new EventEmitter<VisualizationPieceType>();

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Texto del botón que cierra el panel. */
	public readonly CLOSE_TEXT: string = LanguageManager.GetText('VPP_CLOSE');

	/** Título del panel. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('VPP_TITLE');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono del botón de cerrar. */
	public CloseIcon: string = IconsUtils.GetUrl(IconName.CLOSE);

	/** Tipos de pieza entre los que se elige. */
	public Types: VisualizationPieceTypeInfo[] = VisualizationPieceTypes.GetAll();

	//#endregion PUBLIC PROPERTIES

	//#region EMITTERS

	private emitClosed(): void {
		this.closed.emit();
	}

	private emitTypeChosen(type: VisualizationPieceType): void {
		this.typeChosen.emit(type);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this.closed.complete();
		this.typeChosen.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnCloseClicked(): void {
		this.emitClosed();
	}

	@HostListener('document:keydown.escape')
	public OnEscapePressed(): void {
		this.emitClosed();
	}

	public OnTypeClicked(type: VisualizationPieceType): void {
		this.emitTypeChosen(type);
	}

	//#endregion SUBSCRIBERS
}
