import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Campo de contraseña con su propio botón para verla en claro u ocultarla. */
@Component({
	selector: 'app-user-editor-password-field',
	imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
	templateUrl: './passwordField.component.html',
	styleUrl: './passwordField.component.scss'
})
export class UserEditorPasswordFieldComponent implements OnDestroy {
	//#region DECORATORS

	/** Etiqueta del campo. */
	@Input() public Label: string = STRING_UNDEFINED;

	/** Contraseña escrita. */
	@Input() public Value: string = STRING_UNDEFINED;

	/** Se emite con la contraseña cada vez que cambia. */
	@Output() public valueChanged: EventEmitter<string> = new EventEmitter<string>();

	//#endregion DECORATORS

	//#region PRIVATE CONSTANTS

	/** Tipo del campo mientras la contraseña está oculta. */
	private readonly _PASSWORD_HIDDEN_TYPE: string = 'password';

	/** Tipo del campo mientras la contraseña se ve. */
	private readonly _PASSWORD_VISIBLE_TYPE: string = 'text';

	//#region LANGUAGE TEXTS

	/** Texto del botón que oculta la contraseña. */
	private readonly _HIDE_PASSWORD_TEXT: string = LanguageManager.GetText('UEPF_HIDE_PASSWORD');

	/** Texto del botón que muestra la contraseña. */
	private readonly _SHOW_PASSWORD_TEXT: string = LanguageManager.GetText('UEPF_SHOW_PASSWORD');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	// Empieza oculta (constante privada declarada arriba)
	/** Tipo del campo: `password` (oculta) o `text` (visible). */
	public InputType: string = this._PASSWORD_HIDDEN_TYPE;

	/** Icono del botón, según se vea o no la contraseña. */
	public ToggleIcon: string = IconsUtils.GetUrl(IconName.VISIBILITY);

	// Empieza con el texto de mostrar (constante privada declarada arriba)
	/** Texto del botón, según se vea o no la contraseña. */
	public ToggleText: string = this._SHOW_PASSWORD_TEXT;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** `true` si la contraseña se ve en claro. */
	private _IsVisible: boolean = false;

	//#endregion PRIVATE PROPERTIES

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

	public OnInput(event: Event): void {
		this.emitValueChanged((event.target as HTMLInputElement).value);
	}

	public OnVisibilityClicked(): void {
		this.setVisible(!this._IsVisible);
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Muestra u oculta la contraseña y deja listos el icono y el texto del botón.
	 * @param isVisible `true` para verla en claro.
	 */
	private setVisible(isVisible: boolean): void {
		this._IsVisible = isVisible;

		if (isVisible) {
			this.InputType = this._PASSWORD_VISIBLE_TYPE;
			this.ToggleIcon = IconsUtils.GetUrl(IconName.VISIBILITY_OFF);
			this.ToggleText = this._HIDE_PASSWORD_TEXT;
		} else {
			this.InputType = this._PASSWORD_HIDDEN_TYPE;
			this.ToggleIcon = IconsUtils.GetUrl(IconName.VISIBILITY);
			this.ToggleText = this._SHOW_PASSWORD_TEXT;
		}
	}

	//#endregion PRIVATE METHODS
}
