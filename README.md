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

## Uso

```bash
npm i -D eslint@10 "eslint-config-davidyero@github:davidyero/eslint-config-davidyero#v0.2.0"   # eslint 9 también vale
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
