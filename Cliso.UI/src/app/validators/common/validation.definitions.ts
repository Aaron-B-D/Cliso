//#region ENUMS

/** Tipo de regla de validación que se ha roto. Cada clase de `BrokenRule` lleva el suyo. */
enum BrokenRuleType {
	FILE_EXTENSION = 'FILE_EXTENSION',
	MISMATCH = 'MISMATCH',
	NOT_A_NUMBER = 'NOT_A_NUMBER',
	OUT_OF_RANGE = 'OUT_OF_RANGE',
	REQUIRED = 'REQUIRED'
}

//#endregion ENUMS

export { BrokenRuleType };
