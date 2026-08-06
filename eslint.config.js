import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		// `.svelte.ts` modules (the rune-backed stores) are claimed by the Svelte
		// parser too, and it needs the TypeScript parser underneath it or every
		// type annotation is a syntax error.
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: { parser: ts.parser }
		},
		rules: {
			// The landing page's nav is same-page hash anchors, which have no route
			// for `resolve()` to resolve; every link to a real route goes through
			// `resolve()` explicitly. `goto()` is still checked — it is the call
			// that actually navigates.
			'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true }]
		}
	}
);
