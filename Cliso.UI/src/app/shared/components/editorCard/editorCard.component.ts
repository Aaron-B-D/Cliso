import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';

/** Ficha de la lista de un editor: un icono a la izquierda, un título y un subtítulo. Avisa cuando se pulsa. */
@Component({
	selector: 'app-editor-card',
	imports: [MatTooltipModule],
	templateUrl: './editorCard.component.html',
	styleUrl: './editorCard.component.scss'
})
export class EditorCardComponent implements OnDestroy {
	//#region DECORATORS

	/** Se emite al pulsar la ficha. */
	@Output() public clicked: EventEmitter<void> = new EventEmitter<void>();

	/** Texto del icono, que se muestra como ayuda y lo leen los lectores de pantalla. Vacío si el icono es solo decorativo. */
	@Input() public IconText: string = STRING_UNDEFINED;

	/** Dirección del icono de la izquierda. */
	@Input() public IconUrl: string = STRING_UNDEFINED;

	/** `true` si es la ficha seleccionada de la lista. */
	@Input() public IsSelected: boolean = false;

	/** Texto secundario, bajo el título. */
	@Input() public Subtitle: string = STRING_UNDEFINED;

	/** Texto principal de la ficha. */
	@Input() public Title: string = STRING_UNDEFINED;

	//#endregion DECORATORS

	//#region PUBLIC PROPERTIES

	/** Flecha que indica en móvil que la ficha se abre. */
	public ArrowIcon: string = IconsUtils.GetUrl(IconName.CHEVRON_RIGHT);

	//#endregion PUBLIC PROPERTIES

	//#region EMITTERS

	private emitClicked(): void {
		this.clicked.emit();
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this.clicked.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnClicked(): void {
		this.emitClicked();
	}

	//#endregion SUBSCRIBERS
}
