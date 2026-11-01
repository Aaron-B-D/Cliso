//#region TYPES

/** Datos que recibe el diálogo de confirmación. */
type ConfirmDialogData = {
	/** `true` si lo que se confirma es destructivo: el botón de aceptar se pinta como de peligro. */
	IsDanger: boolean;
	/** Pregunta que se hace al usuario. */
	Message: string;
};

//#endregion TYPES

export { type ConfirmDialogData };
