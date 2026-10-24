// Preset para el backend (Node + TypeScript, ESM).
//   import davidyero from 'eslint-config-davidyero/node';
//   export default davidyero();
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { ignores, noBarrels, tsRules } from './shared.js';

export default function davidyero({ extraIgnores = [] } = {}) {
  return tseslint.config(
    { ignores: [...ignores, ...extraIgnores] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      files: ['**/*.ts'],
      languageOptions: { globals: globals.node },
      rules: {
        ...tsRules,
        '@typescript-eslint/consistent-type-imports': 'off',
        // Los saneadores de texto libre quitan caracteres de control a propósito.
        'no-control-regex': 'off',
      },
    },
    noBarrels,
  );
}
