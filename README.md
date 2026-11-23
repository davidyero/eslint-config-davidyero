# eslint-config-davidyero

Las reglas del ecosistema super-davidyero que una máquina puede vigilar, para no
depender de que alguien (persona o IA) se acuerde.

| Regla del ecosistema | Cómo se vigila |
|---|---|
| 3 · Prohibido `any` | `@typescript-eslint/no-explicit-any` (error) |
| 4 · Sin barrels | `no-restricted-syntax` en `index.ts(x)` + el binario `check-barrels` |
| 2 · Todo texto por i18n | `i18next/no-literal-string` (solo texto JSX) |
| UX 7 · Texto por `SuperTypography` | prohíbe `<p>`, `<span>`, `<label>`, `<h1..h6>`… fuera de los `Super*` |
| 6 · Viñetas con `SuperBulletList` | prohíbe `<li>` fuera de los `Super*` |
| 10 · Colores por tokens | prohíbe `#hex`, `rgb()` y `hsl()` fuera de `styles/`, `theme/`, `tokens*`, `colors*` |
| UX 14 · Movimiento por tokens | `davidyero/no-motion-literals` (**siempre aviso**): `\d+ms`, `cubic-bezier(` y segundos de animación (`1.1s ease`) en strings, template literals y objetos de estilo; en RN, `Easing.bezier(…)` y duraciones numéricas en `withTiming`, `withDelay`, `Animated.timing`, `LayoutAnimation` y `FadeIn.duration(…)`. Fuera de `motion.ts` |

## Uso

```bash
npm i -D eslint@10 "eslint-config-davidyero@github:davidyero/eslint-config-davidyero#v0.4.0"   # desde v0.3.0 exige eslint 10 (con eslint 9, quédate en v0.2.0)
```

```js
// eslint.config.js de una web
import davidyero from 'eslint-config-davidyero/web';
export default davidyero();            // reglas nuevas como aviso
// export default davidyero({ strict: true });  // todas como error
```

```js
// eslint.config.mjs del backend
import davidyero from 'eslint-config-davidyero/node';
export default davidyero();
```

```json
// package.json
"scripts": { "check:barrels": "check-barrels src" }
```

`strict: false` (por defecto) deja como **aviso** las reglas de texto, i18n y color para
poder adoptarlo en un repo con deuda sin tumbar el CI. Cuando el repo llegue a cero
avisos, pásalo a `strict: true` para que no vuelvan.

### Movimiento en una app React Native

El preset web ya trae la regla de movimiento. Una app RN (que no usa el preset web) la
añade sola:

```js
// eslint.config.js
import motion from 'eslint-config-davidyero/motion';
export default [...tuConfig, ...motion()];
```

`npm test` corre los tests de la regla.
