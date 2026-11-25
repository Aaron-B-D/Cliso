import { Directive, Input, OnChanges } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

/**
 * Marca un selector (`mat-select`) como no válido: Angular Material lo pinta en rojo y avisa a los lectores de pantalla
 * (`aria-invalid`). Se pone en el propio selector: `<mat-select [appSelectInvalid]="RoleInvalid">`.
 *
 * Al crearse, se registra como el comprobador de errores del selector (la forma que tiene Material de preguntar «¿está mal?»).
 */
@Directive({
	selector: '[appSelectInvalid]'
})
export class SelectInvalidDirective implements ErrorStateMatcher, OnChanges {
	//#region DECORATORS

	/** `true` si el selector tiene una regla rota y debe verse en rojo. */
	@Input('appSelectInvalid')
	public IsInvalid: boolean = false;

	//#endregion DECORATORS

	//#region PRIVATE PROPERTIES

	/** Selector en el que se pone la directiva. */
	private _Select: MatSelect;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param select Selector en el que se pone la directiva.
	 */
	constructor(select: MatSelect) {
		this._Select = select;
		this._Select.errorStateMatcher = this;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		// Sin `ngModel` ni formulario, el selector no vuelve a preguntar solo: hay que pedirle que lo haga al cambiar el valor
		this._Select.updateErrorState();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region PUBLIC METHODS

	/**
	 * Indica si el selector está en error. Angular Material llama a este método con este nombre y no necesita los parámetros.
	 * @returns `true` si el selector debe verse en rojo.
	 */
	public isErrorState(): boolean {
		return this.IsInvalid;
	}

	//#endregion PUBLIC METHODS
}
