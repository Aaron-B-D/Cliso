import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { Visualization } from 'src/app/shared/models/visualization/visualization.models';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { VisualizationValidator } from 'src/app/validators/visualization/visualization.validator';

describe('VisualizationValidator', () => {
	const validator: VisualizationValidator = new VisualizationValidator();

	describe('Validate', () => {
		it('rompe el modelo BIM si no hay ninguno elegido', () => {
			const visualization: Visualization = new Visualization(
				ID_NUMERIC_UNDEFINED,
				ID_NUMERIC_UNDEFINED,
				ID_NUMERIC_UNDEFINED,
				'Visualización',
				'Descripción',
				'Observaciones',
				false,
				null
			);

			const result: ValidationResult = validator.Validate(visualization);

			expect(result.HasField(VisualizationValidator.MODEL)).toBeTrue();
			expect(result.HasField(VisualizationValidator.NAME)).toBeFalse();
		});

		it('rompe el nombre si está vacío', () => {
			const visualization: Visualization = new Visualization(
				ID_NUMERIC_UNDEFINED,
				ID_NUMERIC_UNDEFINED,
				1,
				STRING_UNDEFINED,
				'Descripción',
				'Observaciones',
				false,
				null
			);

			const result: ValidationResult = validator.Validate(visualization);

			expect(result.HasField(VisualizationValidator.NAME)).toBeTrue();
			expect(result.HasField(VisualizationValidator.MODEL)).toBeFalse();
		});

		it('rompe el nombre si son solo espacios', () => {
			const visualization: Visualization = new Visualization(
				ID_NUMERIC_UNDEFINED,
				ID_NUMERIC_UNDEFINED,
				1,
				'   ',
				'Descripción',
				'Observaciones',
				false,
				null
			);

			const result: ValidationResult = validator.Validate(visualization);

			expect(result.HasField(VisualizationValidator.NAME)).toBeTrue();
		});

		it('rompe las dos reglas si faltan el modelo y el nombre', () => {
			const visualization: Visualization = new Visualization(
				ID_NUMERIC_UNDEFINED,
				ID_NUMERIC_UNDEFINED,
				ID_NUMERIC_UNDEFINED,
				STRING_UNDEFINED,
				'Descripción',
				'Observaciones',
				false,
				null
			);

			const result: ValidationResult = validator.Validate(visualization);

			expect(result.BrokenRules.length).toBe(2);
		});

		it('no rompe reglas con modelo y nombre', () => {
			const visualization: Visualization = new Visualization(
				ID_NUMERIC_UNDEFINED,
				ID_NUMERIC_UNDEFINED,
				1,
				'Visualización',
				'Descripción',
				'Observaciones',
				false,
				null
			);

			const result: ValidationResult = validator.Validate(visualization);

			expect(result.IsValid()).toBeTrue();
		});
	});
});
