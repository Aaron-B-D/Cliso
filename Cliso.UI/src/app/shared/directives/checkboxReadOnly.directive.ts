import { Directive, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';

/**
 * Pone en solo lectura una casilla (`mat-checkbox`) o un interruptor (`mat-slide-toggle`): se ve como el resto de campos,
 * con el cursor de acción no permitida, pero ni el ratón ni el teclado cambian su valor.
 */
@Directive({
	selector: '[appCheckboxReadOnly]'
})
export class CheckboxReadOnlyDirective implements OnDestroy {
	//#region DECORATORS

	/** `true` si la casilla solo se puede leer: activa la clase global que bloquea el ratón y pone el cursor. */
	@HostBinding('class.checkboxReadOnlyDir')
	public IsFieldReadOnly: boolean = false;

	/** `true` para que la casilla solo se pueda leer. */
	@Input('appCheckboxReadOnly')
	public set IsReadOnly(isReadOnly: boolean) {
		this.IsFieldReadOnly = isReadOnly;
	}

	//#endregion DECORATORS

	//#region PRIVATE CONSTANTS

	/** Tecla que sí se deja pasar en solo lectura, para poder salir del campo. */
	private static readonly _ALLOWED_KEY: string = 'Tab';

	//#endregion PRIVATE CONSTANTS

	//#region PRIVATE PROPERTIES

	/** Elemento de la casilla. */
	private readonly _Element: HTMLElement;

	/**
	 * Para las teclas que cambiarían el valor mientras la casilla solo se puede leer. Es una función flecha para conservar
	 * `this` cuando la llama el navegador y para que sea la misma referencia al quitarla del elemento.
	 * @param event Tecla pulsada.
	 */
	private readonly _OnKeyDown = (event: KeyboardEvent): void => {
		if (this.IsFieldReadOnly && event.key !== CheckboxReadOnlyDirective._ALLOWED_KEY) {
			event.preventDefault();
			event.stopPropagation();
		} else {
			// Se puede editar, o es la tecla para salir del campo: sigue su curso
		}
	};

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param elementRef Elemento de la casilla.
	 */
	constructor(elementRef: ElementRef<HTMLElement>) {
		this._Element = elementRef.nativeElement;
		// En fase de captura: la casilla recibe la tecla antes que el control que contiene, y así puede pararla
		this._Element.addEventListener('keydown', this._OnKeyDown, true);
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this._Element.removeEventListener('keydown', this._OnKeyDown, true);
	}

	//#endregion ANGULAR LIFECYCLE
}
