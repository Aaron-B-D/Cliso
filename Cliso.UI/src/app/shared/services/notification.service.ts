import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import {
	NOTIFICATION_DURATION_MS,
	NOTIFICATION_PANEL_CLASS,
	NotificationLevel
} from 'src/app/shared/definitions/notifications.definitions';

/**
 * Avisa al usuario con un toast arriba y en el centro, de un color según su nivel. Un aviso nuevo sustituye al que
 * hubiera en pantalla.
 *
 * Uso: `this._Notification.Send('No se ha podido guardar', NotificationLevel.DANGER);`
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
	//#region PRIVATE PROPERTIES

	/** Servicio de avisos de Angular Material. */
	private readonly _SnackBar: MatSnackBar;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param snackBar Servicio de avisos de Angular Material.
	 */
	constructor(snackBar: MatSnackBar) {
		this._SnackBar = snackBar;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	/**
	 * Muestra un aviso.
	 * @param message Texto del aviso.
	 * @param level Nivel del aviso, que decide su color. Los de peligro se anuncian con prioridad a los lectores de pantalla.
	 */
	public Send(message: string, level: NotificationLevel): void {
		this._SnackBar.open(message, STRING_UNDEFINED, {
			duration: NOTIFICATION_DURATION_MS,
			horizontalPosition: 'center',
			panelClass: [NOTIFICATION_PANEL_CLASS, NOTIFICATION_PANEL_CLASS + '-' + level],
			politeness: level === NotificationLevel.DANGER ? 'assertive' : 'polite',
			verticalPosition: 'top'
		});
	}

	//#endregion PUBLIC METHODS
}
