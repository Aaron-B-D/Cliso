import { Directive, HostBinding, Input } from '@angular/core';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';

/** Pone un campo de texto (`input` o `textarea`) en solo lectura y le da el cursor de acción no permitida. */
@Directive({
	selector: '[appReadOnly]'
})
export class ReadOnlyDirective {
	//#region DECORATORS

	/** Cursor del campo: el de acción no permitida en solo lectura; sin valor, el normal del campo. */
	@HostBinding('style.cursor')
	public Cursor: string = STRING_UNDEFINED;

	/** `true` para que el campo solo se pueda leer. */
	@Input('appReadOnly')
	public set IsReadOnly(isReadOnly: boolean) {
		this.ReadOnlyAttribute = isReadOnly ? STRING_UNDEFINED : null;
		this.Cursor = isReadOnly ? ReadOnlyDirective._CURSOR_NOT_ALLOWED : STRING_UNDEFINED;
	}

	/** Atributo `readonly` del campo: presente (vacío) en solo lectura y quitado (`null`) si se puede escribir. */
	@HostBinding('attr.readonly')
	public ReadOnlyAttribute: string | null = null;

	//#endregion DECORATORS

	//#region PRIVATE CONSTANTS

	/** Cursor de acción no permitida. */
	private static readonly _CURSOR_NOT_ALLOWED: string = 'not-allowed';

	//#endregion PRIVATE CONSTANTS
}
