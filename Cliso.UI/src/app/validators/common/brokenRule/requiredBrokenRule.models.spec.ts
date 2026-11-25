import { RequiredBrokenRule } from 'src/app/validators/common/brokenRule/requiredBrokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

describe('RequiredBrokenRule', () => {
	it('tiene el tipo REQUIRED', () => {
		const rule: RequiredBrokenRule = new RequiredBrokenRule('name', 'Nombre');

		expect(rule.Type).toBe(BrokenRuleType.REQUIRED);
	});

	it('genera el mensaje de campo obligatorio en castellano', () => {
		const rule: RequiredBrokenRule = new RequiredBrokenRule('name', 'Nombre');

		expect(rule.GetMessage()).toBe('Nombre: el campo es obligatorio');
	});
});
