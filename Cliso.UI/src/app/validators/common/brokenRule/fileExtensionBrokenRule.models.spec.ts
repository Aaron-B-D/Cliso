import { FileExtensionBrokenRule } from 'src/app/validators/common/brokenRule/fileExtensionBrokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

describe('FileExtensionBrokenRule', () => {
	it('tiene el tipo FILE_EXTENSION', () => {
		const rule: FileExtensionBrokenRule = new FileExtensionBrokenRule('file', 'modelo.txt', '.ifc');

		expect(rule.Type).toBe(BrokenRuleType.FILE_EXTENSION);
	});

	it('genera el mensaje con el nombre del fichero y la extensión esperada en castellano', () => {
		const rule: FileExtensionBrokenRule = new FileExtensionBrokenRule('file', 'modelo.txt', '.ifc');

		expect(rule.GetMessage()).toBe('El fichero «modelo.txt» no es un fichero reconocido (se esperaba .ifc)');
	});
});
