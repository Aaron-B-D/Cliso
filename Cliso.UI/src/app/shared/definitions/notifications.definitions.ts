//#region ENUMS

/** Nivel de un aviso: cada valor es el sufijo de la clase CSS (`toast-<valor>`) que le da su color. */
enum NotificationLevel {
	SUCCESS = 'success',
	INFO = 'info',
	WARNING = 'warning',
	DANGER = 'danger'
}

//#endregion ENUMS

//#region CONSTANTS

/** Tiempo, en milisegundos, que un aviso permanece en pantalla. */
const NOTIFICATION_DURATION_MS: number = 3000;

/** Clase CSS base de los avisos (ver `styles/_notifications.scss`). */
const NOTIFICATION_PANEL_CLASS: string = 'toast';

//#endregion CONSTANTS

export { NOTIFICATION_DURATION_MS, NOTIFICATION_PANEL_CLASS, NotificationLevel };
