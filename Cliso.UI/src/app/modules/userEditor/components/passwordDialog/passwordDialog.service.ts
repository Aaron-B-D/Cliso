import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { UserEditorPasswordDialogComponent } from 'src/app/modules/userEditor/components/passwordDialog/passwordDialog.component';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Abre el submodal de la contraseña y espera a que se cierre. */
@Injectable({ providedIn: 'root' })
export class UserEditorPasswordDialogService {
	//#region PRIVATE CONSTANTS

	/** Ancho del submodal: el diálogo lo limita en pantallas estrechas. */
	private static readonly _WIDTH: string = '24rem';

	//#endregion PRIVATE CONSTANTS

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
	 * Abre el submodal y espera la contraseña nueva.
	 * @returns La contraseña, o `null` si se cancela o se cierra sin aceptar.
	 */
	public async Show(): Promise<string | null> {
		// El título del submodal (`mat-dialog-title`) le da su nombre accesible
		const dialogRef: MatDialogRef<UserEditorPasswordDialogComponent, string> = this._Dialog.open(
			UserEditorPasswordDialogComponent,
			{ width: UserEditorPasswordDialogService._WIDTH }
		);

		// Si se cierra sin aceptar (cancelar, Escape, clic fuera), no llega ningún valor
		const password: string | undefined = await firstValueFrom(dialogRef.afterClosed(), { defaultValue: undefined });

		return CheckUtils.IsUndefined(password) ? null : password;
	}

	//#endregion PUBLIC METHODS
}
