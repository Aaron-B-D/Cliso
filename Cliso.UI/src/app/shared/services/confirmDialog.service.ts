import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { ConfirmDialogComponent } from 'src/app/shared/components/confirmDialog/confirmDialog.component';

/** Hace una pregunta al usuario con un diálogo de aceptar o cancelar. */
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
	 * Pregunta al usuario y espera su respuesta.
	 * @param message Pregunta que se hace.
	 * @param isDanger `true` si lo que se confirma es destructivo (por ejemplo, un borrado).
	 * @returns `true` si el usuario acepta; `false` si cancela o cierra el diálogo.
	 */
	public async Ask(message: string, isDanger: boolean): Promise<boolean> {
		const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> = this._Dialog.open(ConfirmDialogComponent, {
			data: { IsDanger: isDanger, Message: message }
		});

		// Si se cierra sin responder (Escape, clic fuera), no llega ningún valor: cuenta como cancelar
		const answer: boolean | undefined = await firstValueFrom(dialogRef.afterClosed(), { defaultValue: false });

		return answer === true;
	}

	//#endregion PUBLIC METHODS
}
