// Preset para webs React del ecosistema (Vite o Next).
//
//   // eslint.config.js
//   import davidyero from 'eslint-config-davidyero/web';
//   export default davidyero();
//   // o, para endurecer o relajar algo:  export default davidyero({ strict: true });
//
// `strict: false` (por defecto) deja como aviso las reglas nuevas del ecosistema
// (texto crudo, textos sin i18n, colores literales) para poder adoptarlo en un repo
// con deuda sin tumbar el CI; `strict: true` las convierte en error.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import i18next from 'eslint-plugin-i18next';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { ignores, noBarrels, tsRules } from './shared.js';

// Etiquetas de texto que deben ser <SuperTypography>.
const RAW_TEXT_TAGS = ['p', 'span', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'small', 'strong', 'em'];

// Archivos donde un color literal es legítimo: la definición de los tokens.
const THEME_FILES = [
  '**/styles/**',
  '**/theme/**',
  '**/themes/**',
  '**/tokens*',
  '**/colors*',
  '**/palette*',
];

const HEX_OR_RGB = String.raw`/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/`;

// Componentes del design system: pueden usar etiquetas HTML (son quienes las envuelven).
const SUPER = ['**/Super*'];
const SUPER_FILES = ['**/Super*.tsx'];

const rawText = [
  {
    selector: `JSXOpeningElement[name.name=/^(${RAW_TEXT_TAGS.join('|')})$/]`,
    message: 'Texto crudo: usa <SuperTypography variant="…"> en vez de la etiqueta HTML.',
  },
  { selector: 'JSXOpeningElement[name.name="li"]', message: 'Viñetas ad-hoc: usa SuperBulletList.' },
];
const colors = [
  { selector: `Literal[value=${HEX_OR_RGB}]`, message: 'Color literal: usa un token del tema.' },
  { selector: `TemplateElement[value.raw=${HEX_OR_RGB}]`, message: 'Color literal: usa un token del tema.' },
];

export default function davidyero({ strict = false, extraIgnores = [] } = {}) {
  const level = strict ? 'error' : 'warn';
  return tseslint.config(
    { ignores: [...ignores, ...extraIgnores] },
    {
      files: ['**/*.{ts,tsx}'],
      extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat.recommended, prettier],
      plugins: { 'react-refresh': reactRefresh, i18next },
      languageOptions: { globals: globals.browser },
      rules: {
        ...tsRules,
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        // Regla dura 2: todo texto visible sale de i18n.
        'i18next/no-literal-string': [level, { mode: 'jsx-text-only' }],
      },
    },
    // `no-restricted-syntax` no se acumula entre bloques (el último gana), así que
    // cada grupo de archivos recibe en un solo bloque todas las prohibiciones que
    // le tocan.
    { files: ['**/*.tsx'], ignores: [...SUPER.map((s) => `${s}/**`), ...SUPER_FILES, ...THEME_FILES], rules: { 'no-restricted-syntax': [level, ...rawText, ...colors] } },
    { files: [...SUPER.map((s) => `${s}/*.tsx`), ...SUPER_FILES], ignores: THEME_FILES, rules: { 'no-restricted-syntax': [level, ...colors] } },
    { files: ['**/*.ts'], ignores: THEME_FILES, rules: { 'no-restricted-syntax': [level, ...colors] } },
    noBarrels,
  );
}
