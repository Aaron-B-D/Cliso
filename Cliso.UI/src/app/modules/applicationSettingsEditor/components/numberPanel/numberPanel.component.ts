import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { InvalidDirective } from 'src/app/shared/directives/invalid.directive';
import { ReadOnlyDirective } from 'src/app/shared/directives/readOnly.directive';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Panel con el que se edita el valor de un parámetro numérico: un campo que solo admite números entre unos límites. */
@Component({
	selector: 'app-application-settings-editor-number-panel',
	imports: [FormsModule, InvalidDirective, MatFormFieldModule, MatInputModule, ReadOnlyDirective],
	templateUrl: './numberPanel.component.html',
	styleUrl: './numberPanel.component.scss'
})
export class ApplicationSettingsEditorNumberPanelComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** `true` si el valor tiene una regla rota y debe verse en rojo. */
	@Input() public IsInvalid: boolean = false;

	/** `true` si el valor solo se puede leer. */
	@Input() public IsReadOnly: boolean = true;

	/** Etiqueta del campo. */
	@Input() public Label: string = STRING_UNDEFINED;

	/** Valor máximo admitido; `null` si no tiene. */
	@Input() public Max: number | null = null;

	/** Valor mínimo admitido. */
	@Input() public Min: number = 1;

	/** Valor actual, como texto. */
	@Input() public Value: string = STRING_UNDEFINED;

	/** Se emite con el texto del campo cada vez que cambia. */
	@Output() public valueChanged: EventEmitter<string> = new EventEmitter<string>();

	//#endregion DECORATORS

	//#region PRIVATE PROPERTIES

	/** Texto del campo, tal y como lo ha dejado la última edición. */
	private _Text: string = STRING_UNDEFINED;

	//#endregion PRIVATE PROPERTIES

	//#region EMITTERS

	private emitValueChanged(value: string): void {
		this.valueChanged.emit(value);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		this._Text = this.Value;
	}

	public ngOnDestroy(): void {
		this.valueChanged.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	/** Al salir del campo, lleva al límite más cercano un número que se salga de ellos. */
	public OnBlurred(): void {
		const value: number = Number(this._Text);

		if (this._Text !== STRING_UNDEFINED && Number.isFinite(value)) {
			const limited: number = this.limitValue(value);

			if (limited !== value) {
				this._Text = String(limited);
				this.emitValueChanged(this._Text);
			} else {
				// Ya está dentro de los límites
			}
		} else {
			// Vacío o no es un número: lo avisa la comprobación al guardar
		}
	}

	public OnValueChanged(value: number | null): void {
		this._Text = CheckUtils.IsNull(value) ? STRING_UNDEFINED : String(value);
		this.emitValueChanged(this._Text);
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Lleva un número al límite más cercano si se sale de ellos.
	 * @param value Número escrito.
	 * @returns El número, o el mínimo o el máximo si se sale por debajo o por encima.
	 */
	private limitValue(value: number): number {
		let result: number = value;

		if (value < this.Min) {
			result = this.Min;
		} else if (!CheckUtils.IsNull(this.Max) && value > this.Max) {
			result = this.Max;
		} else {
			// Está dentro de los límites
		}

		return result;
	}

	//#endregion PRIVATE METHODS
}
