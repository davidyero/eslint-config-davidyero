// Reglas comunes a web y node.
export const tsRules = {
  // Regla dura 3: prohibido `any`.
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
  ],
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
};

// Regla dura 4: sin barrels. Complementa a `check-barrels` (que mira el archivo entero).
export const noBarrels = {
  files: ['**/index.ts', '**/index.tsx'],
  ignores: ['src/main.tsx'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ExportAllDeclaration',
        message: 'Sin barrels: importa directamente el archivo de origen.',
      },
    ],
  },
};

export const ignores = ['dist', 'dev-dist', 'build', 'coverage', 'node_modules', 'public', '**/._*', '**/generated/**'];
