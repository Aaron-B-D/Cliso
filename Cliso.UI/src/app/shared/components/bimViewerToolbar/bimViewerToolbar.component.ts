import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BimViewerToolbarItem, BimViewerToolbarItemId } from 'src/app/shared/definitions/bimViewer.definitions';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Barra de herramientas del visor 3D: pinta los botones que recibe y avisa de cuál se pulsa. Lo que se coloque dentro va al final. */
@Component({
	selector: 'app-bim-viewer-toolbar',
	imports: [MatButtonModule, MatTooltipModule],
	templateUrl: './bimViewerToolbar.component.html',
	styleUrl: './bimViewerToolbar.component.scss'
})
export class BimViewerToolbarComponent implements OnDestroy {
	//#region DECORATORS

	/** Botones de la barra, en el orden en que se pintan. */
	@Input() public Items: BimViewerToolbarItem[] = [];

	/** Se emite con el identificador del botón que se pulsa. */
	@Output() public itemClicked: EventEmitter<BimViewerToolbarItemId> = new EventEmitter<BimViewerToolbarItemId>();

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Nombre accesible de la barra de herramientas. */
	public readonly TOOLBAR_TEXT: string = LanguageManager.GetText('BVT_TOOLBAR');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region EMITTERS

	private emitItemClicked(id: BimViewerToolbarItemId): void {
		this.itemClicked.emit(id);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this.itemClicked.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnItemClicked(item: BimViewerToolbarItem): void {
		this.emitItemClicked(item.Id);
	}

	//#endregion SUBSCRIBERS
}
