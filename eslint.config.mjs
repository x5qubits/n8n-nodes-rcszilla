import { configs } from '@n8n/eslint-plugin-community-nodes';

export default [
	configs.recommended,
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
];
