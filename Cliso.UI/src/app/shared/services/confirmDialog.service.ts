import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialogComponent } from 'src/app/shared/components/confirmDialog/confirmDialog.component';
import { ConfirmDialogType } from 'src/app/shared/definitions/dialogs.definitions';

/** Muestra diálogos de confirmación: preguntas de aceptar o cancelar y mensajes informativos. */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
	//#region PRIVATE PROPERTIES

	/** Servicio de diálogos de Angular Material. */
	private readonly _Dialog: MatDialog;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dialog Servicio de diálogos de Angular Material.
	 */
	constructor(dialog: MatDialog) {
		this._Dialog = dialog;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Muestra un diálogo de confirmación del tipo indicado y espera la respuesta del usuario.
	 * @param message Pregunta o mensaje que se muestra.
	 * @param type Tipo de diálogo: decide sus botones.
	 * @returns `true` si el usuario acepta; `false` si cancela o cierra el diálogo.
	 */
	public async Show(message: string, type: ConfirmDialogType): Promise<boolean> {
		const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> = this._Dialog.open(ConfirmDialogComponent, {
			data: { Message: message, Type: type }
		});

		// Si se cierra sin responder (Escape, clic fuera), no llega ningún valor: cuenta como cancelar
		const answer: boolean | undefined = await firstValueFrom(dialogRef.afterClosed(), { defaultValue: false });

		return answer === true;
	}

	//#endregion PUBLIC METHODS
}
