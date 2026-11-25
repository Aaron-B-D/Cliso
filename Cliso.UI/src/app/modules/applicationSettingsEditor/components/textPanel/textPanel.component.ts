import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { InvalidDirective } from 'src/app/shared/directives/invalid.directive';
import { ReadOnlyDirective } from 'src/app/shared/directives/readOnly.directive';

/** Panel con el que se edita el valor de un parámetro de texto libre; quien lo usa valida el contenido. */
@Component({
	selector: 'app-application-settings-editor-text-panel',
	imports: [FormsModule, InvalidDirective, MatFormFieldModule, MatInputModule, ReadOnlyDirective],
	templateUrl: './textPanel.component.html',
	styleUrl: './textPanel.component.scss'
})
export class ApplicationSettingsEditorTextPanelComponent implements OnDestroy {
	//#region DECORATORS

	/** `true` si el valor tiene una regla rota y debe verse en rojo. */
	@Input() public IsInvalid: boolean = false;

	/** `true` si el valor solo se puede leer. */
	@Input() public IsReadOnly: boolean = true;

	/** Etiqueta del campo. */
	@Input() public Label: string = STRING_UNDEFINED;

	/** Valor actual, como texto. */
	@Input() public Value: string = STRING_UNDEFINED;

	/** Se emite con el texto del campo cada vez que cambia. */
	@Output() public valueChanged: EventEmitter<string> = new EventEmitter<string>();

	//#endregion DECORATORS

	//#region EMITTERS

	private emitValueChanged(value: string): void {
		this.valueChanged.emit(value);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this.valueChanged.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnValueChanged(value: string): void {
		this.emitValueChanged(value);
	}

	//#endregion SUBSCRIBERS
}
