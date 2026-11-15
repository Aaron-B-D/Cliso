//#region ENUMS

/** Requisito mínimo que debe cumplir una contraseña. Los valores son los códigos que devuelve el API cuando no se cumple. */
enum PasswordRequirement {
	DIGIT = 'DIGIT',
	LOWERCASE = 'LOWERCASE',
	MIN_LENGTH = 'MIN_LENGTH',
	SYMBOL = 'SYMBOL',
	UPPERCASE = 'UPPERCASE'
}

/** Permiso para hacer una operación en la aplicación. Los valores son los que usa el API. */
enum Permission {
	APPLICATION_PARAMETERS_EDIT = 'APPLICATION_PARAMETERS_EDIT',
	BIM_MODELS_DELETE = 'BIM_MODELS_DELETE',
	BIM_MODELS_EDIT = 'BIM_MODELS_EDIT',
	BIM_MODELS_READ = 'BIM_MODELS_READ',
	USERS_MANAGE = 'USERS_MANAGE',
	VISUALIZATIONS_CREATE = 'VISUALIZATIONS_CREATE',
	VISUALIZATIONS_DELETE_ANY = 'VISUALIZATIONS_DELETE_ANY',
	VISUALIZATIONS_DELETE_OWN = 'VISUALIZATIONS_DELETE_OWN',
	VISUALIZATIONS_EDIT_ANY = 'VISUALIZATIONS_EDIT_ANY',
	VISUALIZATIONS_EDIT_OWN = 'VISUALIZATIONS_EDIT_OWN',
	VISUALIZATIONS_VIEW_ANY = 'VISUALIZATIONS_VIEW_ANY'
}

/** Rol de un usuario: define qué puede hacer en la aplicación. Los valores son los que usa el API. */
enum UserRole {
	ADMIN = 'ADMIN',
	OPERATOR = 'OPERATOR',
	VIEWER = 'VIEWER'
}

//#endregion ENUMS

//#region CONSTANTS

/** Nick del usuario protegido del API: no se puede borrar ni cambiar su rol. */
const PROTECTED_USER_NICK: string = 'admin';

//#endregion CONSTANTS

export { PasswordRequirement, Permission, PROTECTED_USER_NICK, UserRole };
