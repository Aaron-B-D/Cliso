import { Directive, Input } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

/**
 * Marca un campo de texto (`matInput`, `input` o `textarea`) como no válido: Angular Material lo pinta en rojo y avisa a
 * los lectores de pantalla (`aria-invalid`). Se pone en el propio campo: `<input matInput [appInvalid]="NameInvalid" />`.
 *
 * Al crearse, se registra como el comprobador de errores del campo (la forma que tiene Material de preguntar «¿está mal?»).
 */
@Directive({
	selector: '[appInvalid]'
})
export class InvalidDirective implements ErrorStateMatcher {
	//#region DECORATORS

	/** `true` si el campo tiene una regla rota y debe verse en rojo. */
	@Input('appInvalid')
	public IsInvalid: boolean = false;

	//#endregion DECORATORS

	//#region CONSTRUCTOR

	/**
	 * @param input Campo de texto en el que se pone la directiva.
	 */
	constructor(input: MatInput) {
		input.errorStateMatcher = this;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Indica si el campo está en error. Angular Material llama a este método con este nombre y no necesita los parámetros.
	 * @returns `true` si el campo debe verse en rojo.
	 */
	public isErrorState(): boolean {
		return this.IsInvalid;
	}

	//#endregion PUBLIC METHODS
}
