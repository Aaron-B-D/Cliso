import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { UserEditorPasswordFieldComponent } from 'src/app/modules/userEditor/components/passwordField/passwordField.component';
import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Submodal que pide una contraseña nueva dos veces y la devuelve al aceptar. */
@Component({
	selector: 'app-user-editor-password-dialog',
	imports: [MatButtonModule, MatDialogModule, UserEditorPasswordFieldComponent],
	templateUrl: './passwordDialog.component.html',
	styleUrl: './passwordDialog.component.scss'
})
export class UserEditorPasswordDialogComponent {
	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Texto del botón de aceptar. */
	public readonly ACCEPT_TEXT: string = LanguageManager.GetText('WEB_ACCEPT');

	/** Texto del botón de cancelar. */
	public readonly CANCEL_TEXT: string = LanguageManager.GetText('WEB_CANCEL');

	/** Aviso de que un campo obligatorio está vacío. */
	public readonly FIELD_REQUIRED_TEXT: string = LanguageManager.GetText('WEB_FIELD_REQUIRED');

	/** Aviso de que la contraseña y su repetición no coinciden. */
	public readonly PASSWORD_MISMATCH_TEXT: string = LanguageManager.GetText('WEB_PASSWORD_MISMATCH');

	/** Etiqueta del campo que repite la contraseña. */
	public readonly PASSWORD_REPEAT_TEXT: string = LanguageManager.GetText('WEB_PASSWORD_REPEAT');

	/** Etiqueta de la contraseña. */
	public readonly PASSWORD_TEXT: string = LanguageManager.GetText('WEB_PASSWORD');

	/** Título del submodal. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('UEPD_TITLE');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Contraseña escrita. */
	public Password: string = STRING_UNDEFINED;

	/** `true` si hay que avisar de que falta la contraseña. */
	public PasswordError: boolean = false;

	/** `true` si hay que avisar de que la contraseña y su repetición no coinciden. */
	public PasswordMismatchError: boolean = false;

	/** Repetición de la contraseña, que debe coincidir con ella para poder aceptar. */
	public PasswordRepeat: string = STRING_UNDEFINED;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Referencia al submodal, para cerrarlo con la contraseña. */
	private readonly _DialogRef: MatDialogRef<UserEditorPasswordDialogComponent, string>;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dialogRef Referencia al submodal.
	 */
	constructor(dialogRef: MatDialogRef<UserEditorPasswordDialogComponent, string>) {
		this._DialogRef = dialogRef;
	}

	//#endregion CONSTRUCTOR

	//#region SUBSCRIBERS

	public OnAcceptClicked(): void {
		if (this.validate()) {
			this._DialogRef.close(this.Password);
		} else {
			// Faltan datos: los avisos ya se muestran junto a cada campo
		}
	}

	public OnCancelClicked(): void {
		this._DialogRef.close();
	}

	public OnPasswordChanged(value: string): void {
		this.Password = value;
		this.PasswordError = false;
		this.PasswordMismatchError = false;
	}

	public OnPasswordRepeatChanged(value: string): void {
		this.PasswordRepeat = value;
		this.PasswordMismatchError = false;
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Comprueba que hay contraseña y que la repetición coincide, y marca lo que falla.
	 * @returns `true` si se puede aceptar.
	 */
	private validate(): boolean {
		this.PasswordError = CheckUtils.IsEmptyString(this.Password);
		// Solo se avisa de la repetición cuando hay contraseña: si falta, ya se avisa de eso
		this.PasswordMismatchError = !this.PasswordError && this.Password !== this.PasswordRepeat;

		return !this.PasswordError && !this.PasswordMismatchError;
	}

	//#endregion PRIVATE METHODS
}
