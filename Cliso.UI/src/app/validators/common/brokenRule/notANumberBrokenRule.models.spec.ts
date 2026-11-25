import { NotANumberBrokenRule } from 'src/app/validators/common/brokenRule/notANumberBrokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

describe('NotANumberBrokenRule', () => {
	it('tiene el tipo NOT_A_NUMBER', () => {
		const rule: NotANumberBrokenRule = new NotANumberBrokenRule('age', 'Edad');

		expect(rule.Type).toBe(BrokenRuleType.NOT_A_NUMBER);
	});

	it('genera el mensaje de número entero esperado en castellano', () => {
		const rule: NotANumberBrokenRule = new NotANumberBrokenRule('age', 'Edad');

		expect(rule.GetMessage()).toBe('Edad: se esperaba un número entero');
	});
});
