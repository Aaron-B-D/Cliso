import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { UserEditorPasswordFieldComponent } from 'src/app/modules/userEditor/components/passwordField/passwordField.component';
import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { UserFormValidator } from 'src/app/validators/user/userForm.validator';

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

	/** Etiqueta del campo que repite la contraseña. */
	public readonly PASSWORD_REPEAT_TEXT: string = LanguageManager.GetText('WEB_PASSWORD_REPEAT');

	/** Etiqueta de la contraseña. */
	public readonly PASSWORD_TEXT: string = LanguageManager.GetText('WEB_PASSWORD');

	/** Título del submodal. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('UEPD_TITLE');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Mensajes de las reglas rotas en la última validación. */
	public ErrorMessages: string[] = [];

	/** `true` si la última validación ha roto alguna regla. */
	public HasErrors: boolean = false;

	/** Contraseña escrita. */
	public Password: string = STRING_UNDEFINED;

	/** `true` si la contraseña tiene una regla rota y debe verse en rojo. */
	public PasswordInvalid: boolean = false;

	/** Repetición de la contraseña, que debe coincidir con ella para poder aceptar. */
	public PasswordRepeat: string = STRING_UNDEFINED;

	/** `true` si la repetición tiene una regla rota y debe verse en rojo. */
	public PasswordRepeatInvalid: boolean = false;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Referencia al submodal, para cerrarlo con la contraseña. */
	private readonly _DialogRef: MatDialogRef<UserEditorPasswordDialogComponent, string>;

	/** Valida la contraseña y su repetición. */
	private readonly _Validator: UserFormValidator = new UserFormValidator();

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
			// Hay reglas rotas: se muestran en el submodal y no se cierra
		}
	}

	public OnCancelClicked(): void {
		this._DialogRef.close();
	}

	public OnPasswordChanged(value: string): void {
		this.Password = value;
		this.applyValidation(new ValidationResult());
	}

	public OnPasswordRepeatChanged(value: string): void {
		this.PasswordRepeat = value;
		this.applyValidation(new ValidationResult());
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Comprueba que hay contraseña y que la repetición coincide, y muestra y marca lo que falla.
	 * @returns `true` si se puede aceptar.
	 */
	private validate(): boolean {
		const validation: ValidationResult = this._Validator.ValidatePassword(this.Password, this.PasswordRepeat);

		this.applyValidation(validation);

		return validation.IsValid();
	}

	/**
	 * Muestra el resultado de una validación: mensajes y campos marcados.
	 * @param validation Resultado a mostrar.
	 */
	private applyValidation(validation: ValidationResult): void {
		this.ErrorMessages = validation.GetMessages();
		this.HasErrors = !validation.IsValid();
		this.PasswordInvalid = validation.HasField(UserFormValidator.PASSWORD);
		this.PasswordRepeatInvalid = validation.HasField(UserFormValidator.PASSWORD_REPEAT);
	}

	//#endregion PRIVATE METHODS
}
