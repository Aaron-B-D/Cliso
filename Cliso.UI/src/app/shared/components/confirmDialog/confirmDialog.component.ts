import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialogData, ConfirmDialogType } from 'src/app/shared/definitions/dialogs.definitions';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Diálogo que hace una pregunta al usuario y devuelve `true` si acepta y `false` si cancela o lo cierra. */
@Component({
	selector: 'app-confirm-dialog',
	imports: [MatButtonModule, MatDialogModule],
	templateUrl: './confirmDialog.component.html',
	styleUrl: './confirmDialog.component.scss'
})
export class ConfirmDialogComponent {
	//#region PUBLIC CONSTANTS

	/** Tipo de diálogo para una pregunta destructiva. */
	public readonly TYPE_DANGER: ConfirmDialogType = ConfirmDialogType.DANGER;

	/** Tipo de diálogo para un mensaje que solo informa. */
	public readonly TYPE_INFORMATION: ConfirmDialogType = ConfirmDialogType.INFORMATION;

	/** Tipo de diálogo para una pregunta normal. */
	public readonly TYPE_QUESTION: ConfirmDialogType = ConfirmDialogType.QUESTION;

	//#region LANGUAGE TEXTS

	/** Texto del botón de aceptar. */
	public readonly ACCEPT_TEXT: string = LanguageManager.GetText('CD_ACCEPT');

	/** Texto del botón de cancelar. */
	public readonly CANCEL_TEXT: string = LanguageManager.GetText('WEB_CANCEL');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Mensaje o pregunta que se muestra al usuario. */
	public Message: string;

	/** Tipo de diálogo: decide sus botones. */
	public Type: ConfirmDialogType;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Referencia al diálogo, para cerrarlo con la respuesta. */
	private readonly _DialogRef: MatDialogRef<ConfirmDialogComponent, boolean>;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dialogRef Referencia al diálogo.
	 * @param data Pregunta y tipo de confirmación.
	 */
	constructor(dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>, @Inject(MAT_DIALOG_DATA) data: ConfirmDialogData) {
		this._DialogRef = dialogRef;
		this.Message = data.Message;
		this.Type = data.Type;
	}

	//#endregion CONSTRUCTOR

	//#region SUBSCRIBERS

	public OnAcceptClicked(): void {
		this._DialogRef.close(true);
	}

	public OnCancelClicked(): void {
		this._DialogRef.close(false);
	}

	//#endregion SUBSCRIBERS
}
