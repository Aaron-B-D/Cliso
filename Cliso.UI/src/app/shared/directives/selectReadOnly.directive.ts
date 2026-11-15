import { Directive, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';

/**
 * Pone en solo lectura el campo de un selector (`mat-form-field` con un `mat-select`): se ve como el resto de campos,
 * con el cursor de acción no permitida, pero ni el ratón ni el teclado abren la lista ni cambian el valor.
 */
@Directive({
	selector: '[appSelectReadOnly]'
})
export class SelectReadOnlyDirective implements OnDestroy {
	//#region DECORATORS

	/** `true` si el selector solo se puede leer: activa la clase global que bloquea el ratón y pone el cursor. */
	@HostBinding('class.selectReadOnlyDir')
	public IsFieldReadOnly: boolean = false;

	/** `true` para que el selector solo se pueda leer. */
	@Input('appSelectReadOnly')
	public set IsReadOnly(isReadOnly: boolean) {
		this.IsFieldReadOnly = isReadOnly;
	}

	//#endregion DECORATORS

	//#region PRIVATE CONSTANTS

	/** Tecla que sí se deja pasar en solo lectura, para poder salir del campo. */
	private static readonly _ALLOWED_KEY: string = 'Tab';

	//#endregion PRIVATE CONSTANTS

	//#region PRIVATE PROPERTIES

	/** Elemento del campo. */
	private readonly _Element: HTMLElement;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param elementRef Elemento del campo.
	 */
	constructor(elementRef: ElementRef<HTMLElement>) {
		this._Element = elementRef.nativeElement;
		// En fase de captura: el campo recibe la tecla antes que el selector que contiene, y así puede pararla
		this._Element.addEventListener('keydown', this.onKeyDown, true);
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this._Element.removeEventListener('keydown', this.onKeyDown, true);
	}

	//#endregion ANGULAR LIFECYCLE

	//#region PRIVATE METHODS

	// Función flecha: conserva `this` al llamarla el navegador y es la misma referencia para quitarla después
	/**
	 * Para las teclas que abrirían la lista o cambiarían el valor mientras el selector solo se puede leer.
	 * @param event Tecla pulsada.
	 */
	private readonly onKeyDown = (event: KeyboardEvent): void => {
		if (this.IsFieldReadOnly && event.key !== SelectReadOnlyDirective._ALLOWED_KEY) {
			event.preventDefault();
			event.stopPropagation();
		} else {
			// Se puede editar, o es la tecla para salir del campo: sigue su curso
		}
	};

	//#endregion PRIVATE METHODS
}
