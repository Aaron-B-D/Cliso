import { MismatchBrokenRule } from 'src/app/validators/common/brokenRule/mismatchBrokenRule.models';
import { BrokenRuleType } from 'src/app/validators/common/validation.definitions';

describe('MismatchBrokenRule', () => {
	it('tiene el tipo MISMATCH', () => {
		const rule: MismatchBrokenRule = new MismatchBrokenRule('repeat', 'Repetir contraseña', 'Contraseña');

		expect(rule.Type).toBe(BrokenRuleType.MISMATCH);
	});

	it('genera el mensaje con el campo con el que debería coincidir en castellano', () => {
		const rule: MismatchBrokenRule = new MismatchBrokenRule('repeat', 'Repetir contraseña', 'Contraseña');

		expect(rule.GetMessage()).toBe('Repetir contraseña: no coincide con «Contraseña»');
	});
});
