import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';
import { BrokenRule } from 'src/app/validators/common/brokenRule/brokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

/** Regla rota: un fichero no tiene la extensión esperada. El mensaje dice qué fichero era y qué extensión se esperaba. */
export class FileExtensionBrokenRule extends BrokenRule {
	//#region PUBLIC PROPERTIES

	/** Extensión que se esperaba, con el punto (por ejemplo, `.ifc`). */
	public Extension: string;

	/** Nombre del fichero rechazado. */
	public FileName: string;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param field Identificador del campo del formulario al que afecta.
	 * @param fileName Nombre del fichero rechazado.
	 * @param extension Extensión que se esperaba, con el punto.
	 */
	constructor(field: string, fileName: string, extension: string) {
		// El mensaje habla del fichero, no del campo: no necesita el nombre del campo
		super(BrokenRuleType.FILE_EXTENSION, field, STRING_UNDEFINED);

		this.Extension = extension;
		this.FileName = fileName;
	}

	//#endregion CONSTRUCTOR

	//#region PUBLIC METHODS

	public GetMessage(): string {
		return StringUtils.Format(LanguageManager.GetText('VALIDATION_FILE_EXTENSION'), [this.FileName, this.Extension]);
	}

	//#endregion PUBLIC METHODS
}
