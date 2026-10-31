// @ts-check
// Linter del front. Formato (sangría, comillas, punto y coma, espacios) lo resuelve Prettier, no ESLint.
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
	{
		ignores: ['dist/**', '.angular/**', 'node_modules/**']
	},
	{
		files: ['**/*.ts'],
		extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
		processor: angular.processInlineTemplates,
		rules: {
			// Normas del proyecto sobre el tipado y la visibilidad (ver .ai/directrices-front.md)
			'@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
			'@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit', overrides: { constructors: 'no-public' } }],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/parameter-properties': 'error',
			// La inyección se hace por parámetros del constructor, no con inject()
			'@angular-eslint/prefer-inject': 'off',
			'@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
			'@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
			// Control de flujo y buenas prácticas
			'@typescript-eslint/no-empty-function': 'warn',
			'@typescript-eslint/no-shadow': 'warn',
			'@typescript-eslint/no-use-before-define': ['warn', { functions: false, variables: false }],
			'array-callback-return': 'warn',
			'block-scoped-var': 'warn',
			'consistent-return': 'warn',
			curly: 'warn',
			eqeqeq: 'error',
			'init-declarations': ['error', 'always'],
			'no-console': ['warn', { allow: ['warn'] }],
			'no-empty': ['error', { allowEmptyCatch: true }],
			'no-floating-decimal': 'warn',
			'no-implied-eval': 'warn',
			'no-lone-blocks': 'warn',
			'no-lonely-if': 'warn',
			'no-new': 'warn',
			'no-param-reassign': 'warn',
			'no-restricted-properties': ['warn', { property: 'lenght', message: 'Use length instead of lenght (notice the position of the h)' }],
			'no-return-assign': 'warn',
			'no-sequences': 'warn',
			'no-unmodified-loop-condition': 'warn',
			'no-useless-concat': 'warn',
			'no-useless-return': 'warn',
			yoda: 'warn'
		}
	},
	{
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {
			// La plantilla no llama a funciones: solo lee propiedades y constantes ya calculadas
			'@angular-eslint/template/no-call-expression': 'error'
		}
	}
]);
