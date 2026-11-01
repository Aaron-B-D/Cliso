import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/**
 * Estructura común de los editores: título con maximizar y cerrar, lista con buscador a la izquierda (plegable y con
 * ancho ajustable), detalle a la derecha y un pie con las operaciones. El contenido de la lista y del detalle lo
 * pone cada editor (`editorList` y `editorDetail`), que también decide qué hacer con cada evento.
 */
@Component({
	selector: 'app-editor-shell',
	imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
	templateUrl: './editorShell.component.html',
	styleUrl: './editorShell.component.scss'
})
export class EditorShellComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** Se emite al pulsar añadir. */
	@Output() public addClicked: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite al pulsar volver a la lista (en móvil). */
	@Output() public backClicked: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite al pedir cerrar el editor: quien lo contiene decide si se cierra. */
	@Output() public closeRequested: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite al pulsar borrar. */
	@Output() public deleteClicked: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite al pulsar descartar los cambios. */
	@Output() public discardClicked: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite al pulsar editar. */
	@Output() public editClicked: EventEmitter<void> = new EventEmitter<void>();

	/** `true` si hay un elemento seleccionado: solo entonces se puede editar o borrar. */
	@Input() public HasSelection: boolean = false;

	/** `true` si hay una operación en curso: se desactivan los botones del pie. */
	@Input() public IsBusy: boolean = false;

	/** `true` si se está editando (o añadiendo): el pie muestra guardar y descartar en vez de añadir, editar y borrar. */
	@Input() public IsEditing: boolean = false;

	/** Se emite al pulsar guardar. */
	@Output() public saveClicked: EventEmitter<void> = new EventEmitter<void>();

	/** Se emite con el texto del buscador cada vez que cambia. */
	@Output() public searchChanged: EventEmitter<string> = new EventEmitter<string>();

	/** Texto de ayuda del buscador. */
	@Input() public SearchLabel: string = '';

	/** `true` si, en móvil, hay que mostrar el detalle en vez de la lista. */
	@Input() public ShowDetail: boolean = false;

	/** Título del editor. */
	@Input() public Title: string = '';

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	/** Ancho máximo de la lista, en píxeles. */
	public readonly SELECTOR_MAX_WIDTH: number = 480;

	/** Ancho mínimo de la lista, en píxeles: por debajo no caben el buscador y los nombres. */
	public readonly SELECTOR_MIN_WIDTH: number = 160;

	//#region LANGUAGE TEXTS

	/** Texto del botón de añadir. */
	public readonly ADD_TEXT: string = LanguageManager.GetText('ES_ADD');

	/** Texto del botón de volver a la lista. */
	public readonly BACK_TEXT: string = LanguageManager.GetText('ES_BACK');

	/** Texto del botón de cerrar. */
	public readonly CLOSE_TEXT: string = LanguageManager.GetText('ES_CLOSE');

	/** Texto del botón de plegar la lista. */
	public readonly COLLAPSE_TEXT: string = LanguageManager.GetText('ES_COLLAPSE');

	/** Texto del botón de borrar. */
	public readonly DELETE_TEXT: string = LanguageManager.GetText('ES_DELETE');

	/** Texto del botón de descartar los cambios. */
	public readonly DISCARD_TEXT: string = LanguageManager.GetText('ES_DISCARD');

	/** Texto del botón de editar. */
	public readonly EDIT_TEXT: string = LanguageManager.GetText('ES_EDIT');

	/** Texto del botón de desplegar la lista. */
	public readonly EXPAND_TEXT: string = LanguageManager.GetText('ES_EXPAND');

	/** Texto del botón de maximizar. */
	public readonly MAXIMIZE_TEXT: string = LanguageManager.GetText('ES_MAXIMIZE');

	/** Nombre accesible de la barra que cambia el ancho de la lista. */
	public readonly RESIZE_TEXT: string = LanguageManager.GetText('ES_RESIZE');

	/** Texto del botón de restaurar el tamaño. */
	public readonly RESTORE_TEXT: string = LanguageManager.GetText('ES_RESTORE');

	/** Texto del botón de guardar. */
	public readonly SAVE_TEXT: string = LanguageManager.GetText('ES_SAVE');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Ancho inicial de la lista, en píxeles. */
	private readonly _DEFAULT_SELECTOR_WIDTH: number = 280;

	/** Píxeles que cambia el ancho de la lista con cada pulsación de las flechas del teclado. */
	private readonly _KEY_STEP: number = 16;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Icono de añadir. */
	public AddIcon: string = IconsUtils.GetUrl(IconName.ADD);

	/** Icono de volver a la lista. */
	public BackIcon: string = IconsUtils.GetUrl(IconName.ARROW_BACK);

	/** Icono de cerrar. */
	public CloseIcon: string = IconsUtils.GetUrl(IconName.CLOSE);

	/** Icono de plegar la lista. */
	public CollapseIcon: string = IconsUtils.GetUrl(IconName.CHEVRONS_LEFT);

	/** Icono de borrar. */
	public DeleteIcon: string = IconsUtils.GetUrl(IconName.DELETE);

	/** Icono de descartar los cambios. */
	public DiscardIcon: string = IconsUtils.GetUrl(IconName.UNDO);

	/** Icono de editar. */
	public EditIcon: string = IconsUtils.GetUrl(IconName.EDIT);

	/** Icono de desplegar la lista. */
	public ExpandIcon: string = IconsUtils.GetUrl(IconName.CHEVRONS_RIGHT);

	/** `true` si la lista está plegada a una franja. */
	public IsCollapsed: boolean = false;

	/** `true` si el editor ocupa toda la pantalla. */
	public IsMaximized: boolean = false;

	/** `true` si no se puede editar ni borrar: no hay nada seleccionado o hay una operación en curso. */
	public IsOperationDisabled: boolean = true;

	/** Icono del botón que maximiza o restaura, según el estado. */
	public MaximizeIcon: string = IconsUtils.GetUrl(IconName.MAXIMIZE);

	// Empieza con el texto de maximizar (declarado arriba)
	/** Texto del botón que maximiza o restaura, según el estado. */
	public MaximizeToggleText: string = this.MAXIMIZE_TEXT;

	/** Icono de guardar. */
	public SaveIcon: string = IconsUtils.GetUrl(IconName.SAVE);

	/** Icono del buscador. */
	public SearchIcon: string = IconsUtils.GetUrl(IconName.SEARCH);

	// Empieza con el ancho por defecto (constante privada declarada arriba)
	/** Ancho actual de la lista, en píxeles. */
	public SelectorWidth: number = this._DEFAULT_SELECTOR_WIDTH;

	/** Ancho actual de la lista, como valor CSS. */
	public SelectorWidthCss: string = this._DEFAULT_SELECTOR_WIDTH + 'px';

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Ancho de la lista al empezar a arrastrar la barra. */
	private _DragStartWidth: number = 0;

	/** Posición horizontal del puntero al empezar a arrastrar la barra. */
	private _DragStartX: number = 0;

	/** `true` mientras se arrastra la barra. */
	private _IsDragging: boolean = false;

	//#endregion PRIVATE PROPERTIES

	//#region EMITTERS

	private emitAddClicked(): void {
		this.addClicked.emit();
	}

	private emitBackClicked(): void {
		this.backClicked.emit();
	}

	private emitCloseRequested(): void {
		this.closeRequested.emit();
	}

	private emitDeleteClicked(): void {
		this.deleteClicked.emit();
	}

	private emitDiscardClicked(): void {
		this.discardClicked.emit();
	}

	private emitEditClicked(): void {
		this.editClicked.emit();
	}

	private emitSaveClicked(): void {
		this.saveClicked.emit();
	}

	private emitSearchChanged(text: string): void {
		this.searchChanged.emit(text);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		this.IsOperationDisabled = this.IsBusy || !this.HasSelection;
	}

	public ngOnDestroy(): void {
		this.addClicked.complete();
		this.backClicked.complete();
		this.closeRequested.complete();
		this.deleteClicked.complete();
		this.discardClicked.complete();
		this.editClicked.complete();
		this.saveClicked.complete();
		this.searchChanged.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnAddClicked(): void {
		this.emitAddClicked();
	}

	public OnBackClicked(): void {
		this.emitBackClicked();
	}

	public OnCloseClicked(): void {
		this.emitCloseRequested();
	}

	public OnCollapseClicked(): void {
		this.IsCollapsed = !this.IsCollapsed;
	}

	public OnDeleteClicked(): void {
		this.emitDeleteClicked();
	}

	public OnDiscardClicked(): void {
		this.emitDiscardClicked();
	}

	public OnEditClicked(): void {
		this.emitEditClicked();
	}

	public OnMaximizeClicked(): void {
		this.setMaximized(!this.IsMaximized);
	}

	public OnSaveClicked(): void {
		this.emitSaveClicked();
	}

	public OnSearchInput(event: Event): void {
		this.emitSearchChanged((event.target as HTMLInputElement).value);
	}

	public OnSplitterKeyDown(event: KeyboardEvent): void {
		if (event.key === 'ArrowLeft') {
			this.setSelectorWidth(this.SelectorWidth - this._KEY_STEP);
		} else if (event.key === 'ArrowRight') {
			this.setSelectorWidth(this.SelectorWidth + this._KEY_STEP);
		} else {
			// Otra tecla: no cambia el ancho
		}
	}

	public OnSplitterPointerDown(event: PointerEvent): void {
		// Con el puntero capturado, la barra sigue recibiendo el movimiento aunque salga de ella
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		this._DragStartWidth = this.SelectorWidth;
		this._DragStartX = event.clientX;
		this._IsDragging = true;
	}

	public OnSplitterPointerMove(event: PointerEvent): void {
		if (this._IsDragging) {
			this.setSelectorWidth(this._DragStartWidth + event.clientX - this._DragStartX);
		} else {
			// No se está arrastrando
		}
	}

	public OnSplitterPointerUp(): void {
		this._IsDragging = false;
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Cambia el estado de maximizado y deja listos el icono y el texto del botón.
	 * @param isMaximized `true` para maximizar, `false` para restaurar.
	 */
	private setMaximized(isMaximized: boolean): void {
		this.IsMaximized = isMaximized;

		if (isMaximized) {
			this.MaximizeIcon = IconsUtils.GetUrl(IconName.RESTORE);
			this.MaximizeToggleText = this.RESTORE_TEXT;
		} else {
			this.MaximizeIcon = IconsUtils.GetUrl(IconName.MAXIMIZE);
			this.MaximizeToggleText = this.MAXIMIZE_TEXT;
		}
	}

	/**
	 * Cambia el ancho de la lista, dentro de los límites.
	 * @param width Ancho deseado, en píxeles.
	 */
	private setSelectorWidth(width: number): void {
		this.SelectorWidth = Math.min(this.SELECTOR_MAX_WIDTH, Math.max(this.SELECTOR_MIN_WIDTH, width));
		this.SelectorWidthCss = this.SelectorWidth + 'px';
	}

	//#endregion PRIVATE METHODS
}
