// Regla 14 de UX: movimiento por tokens. Bloque de configuración listo para
// cualquier eslint.config (web, React Native o lo que venga). El preset web ya lo
// incluye; en una app RN:
//
//   import motion from 'eslint-config-davidyero/motion';
//   export default [...tuConfig, ...motion()];
//
// Siempre en aviso: sirve para medir y migrar sin tumbar el CI.
import noMotionLiterals from './rules/no-motion-literals.js';

export const plugin = {
  meta: { name: 'eslint-plugin-davidyero' },
  rules: { 'no-motion-literals': noMotionLiterals },
};

// El único sitio donde se escriben milisegundos y curvas.
export const MOTION_FILES = ['**/motion.ts', '**/motion.tsx', '**/motion.js', '**/motion.mjs'];

export default function motion({ level = 'warn', files = ['**/*.{ts,tsx,js,jsx,mjs}'] } = {}) {
  return [
    {
      files,
      ignores: MOTION_FILES,
      plugins: { davidyero: plugin },
      rules: { 'davidyero/no-motion-literals': level },
    },
  ];
}
