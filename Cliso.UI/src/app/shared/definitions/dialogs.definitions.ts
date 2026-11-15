//#region ENUMS

/** Tipo de diálogo de confirmación: decide los botones que tiene y cómo se pintan. Solo puede ser uno. */
enum ConfirmDialogType {
	/** Pregunta cuya aceptación es destructiva (por ejemplo, un borrado): cancelar o aceptar, con el aceptar de peligro. */
	DANGER = 'DANGER',
	/** Mensaje que solo informa: no hay nada que decidir y solo tiene el botón de aceptar. */
	INFORMATION = 'INFORMATION',
	/** Pregunta normal: cancelar o aceptar. */
	QUESTION = 'QUESTION'
}

//#endregion ENUMS

//#region TYPES

/** Datos que recibe el diálogo de confirmación. */
type ConfirmDialogData = {
	/** Mensaje o pregunta que se muestra al usuario. */
	Message: string;
	/** Tipo de diálogo. */
	Type: ConfirmDialogType;
};

//#endregion TYPES

export { type ConfirmDialogData, ConfirmDialogType };
