import { OutOfRangeBrokenRule } from 'src/app/validators/common/brokenRule/outOfRangeBrokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

describe('OutOfRangeBrokenRule', () => {
	it('tiene el tipo OUT_OF_RANGE', () => {
		const rule: OutOfRangeBrokenRule = new OutOfRangeBrokenRule('height', 'Altura', 1, 10, 15);

		expect(rule.Type).toBe(BrokenRuleType.OUT_OF_RANGE);
	});

	it('genera el mensaje con el rango y el valor introducido en castellano', () => {
		const rule: OutOfRangeBrokenRule = new OutOfRangeBrokenRule('height', 'Altura', 1, 10, 15);

		expect(rule.GetMessage()).toBe('Altura: se esperaba un valor entre 1 y 10 y se ha introducido 15');
	});
});
