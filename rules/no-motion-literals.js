// Regla 14 de UX (movimiento por tokens): nada de milisegundos ni curvas escritos a
// mano fuera de `motion.ts`. Marca:
//   · strings y template literals con `\d+ms`, `cubic-bezier(` o segundos de animación
//     ('1.1s ease-in-out', '0.3s')
//     ('200ms', `transform ${x} 150ms`, { transition: 'opacity 0.2ms' }, style={{…}});
//   · en React Native, donde las duraciones son números: `Easing.bezier(…)` y una
//     duración o retardo numérico en `withTiming`, `withDelay`, `Animated.timing`,
//     `LayoutAnimation` o en las animaciones de layout de Reanimated
//     (`FadeIn.duration(300)`, `.delay(80)`).
// El archivo de tokens (`motion.ts`) queda fuera desde la configuración.

const MS = /(?<![\w.$])\d*\.?\d+ms\b/;
const BEZIER = /cubic-bezier\(/;
// Segundos ('1.1s ease-in-out', '0.3s'): mismo problema con otra unidad. Solo cuentan
// si el texto entero es una duración o lleva una palabra de animación al lado, para no
// confundirlos con '2s' de otros contextos.
const SECONDS = /(?<![\w.$])\d*\.?\d+s\b/;
const SECONDS_ALONE = /^\s*\d*\.?\d+s\s*$/;
const ANIM_WORD = /\b(ease(-in-out|-in|-out)?|linear|infinite|alternate|steps\(|forwards|backwards)\b/;

// Llamadas cuyo objeto de opciones lleva la duración de una animación.
const TIMING_CALLS = new Set(['withTiming', 'timing', 'decay', 'configureNext', 'create']);
const TIMING_KEYS = new Set(['duration', 'delay']);
// Métodos encadenados de Reanimated: FadeIn.duration(300).delay(80).
const CHAIN_METHODS = new Set(['duration', 'delay']);

const calleeName = (callee) => {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
    return callee.property.name;
  }
  return null;
};

const isNumber = (node) =>
  (node?.type === 'Literal' && typeof node.value === 'number') ||
  (node?.type === 'UnaryExpression' && node.argument.type === 'Literal' && typeof node.argument.value === 'number');

const keyName = (prop) => {
  if (prop.type !== 'Property' || prop.computed) return null;
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'Literal') return String(prop.key.value);
  return null;
};

export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'Duraciones y curvas de animación solo desde los tokens de motion.ts (regla 14 de UX).' },
    schema: [],
    messages: {
      ms: 'Milisegundos escritos a mano ({{value}}): usa motion.duration.* de motion.ts.',
      seconds: 'Segundos escritos a mano ({{value}}): usa motion.duration.* de motion.ts.',
      bezier: 'Curva escrita a mano: usa motion.easing.* de motion.ts.',
      rnBezier: 'Easing.bezier fuera de motion.ts: usa motion.easing.*.',
      rnDuration: '{{key}} numérica en una animación: usa motion.duration.* (o useMotion()).',
    },
  },
  create(context) {
    const checkText = (node, text) => {
      if (BEZIER.test(text)) context.report({ node, messageId: 'bezier' });
      const ms = text.match(MS);
      if (ms) context.report({ node, messageId: 'ms', data: { value: ms[0] } });
      const sec = text.match(SECONDS);
      if (sec && (SECONDS_ALONE.test(text) || ANIM_WORD.test(text))) {
        context.report({ node, messageId: 'seconds', data: { value: sec[0] } });
      }
    };

    // Objetos de opciones de una animación: { duration: 300, delay: 50 }.
    const checkOptions = (obj) => {
      if (obj?.type !== 'ObjectExpression') return;
      for (const prop of obj.properties) {
        const key = keyName(prop);
        if (key && TIMING_KEYS.has(key) && isNumber(prop.value)) {
          context.report({ node: prop.value, messageId: 'rnDuration', data: { key } });
        }
      }
    };

    return {
      Literal(node) {
        if (typeof node.value === 'string') checkText(node, node.value);
      },
      TemplateElement(node) {
        checkText(node, node.value.raw);
      },
      CallExpression(node) {
        const name = calleeName(node.callee);
        if (!name) return;
        const { callee, arguments: args } = node;

        if (name === 'bezier' && callee.type === 'MemberExpression' && callee.object.type === 'Identifier' && callee.object.name === 'Easing') {
          context.report({ node, messageId: 'rnBezier' });
          return;
        }
        if (name === 'withDelay' && isNumber(args[0])) {
          context.report({ node: args[0], messageId: 'rnDuration', data: { key: 'delay' } });
          return;
        }
        if (TIMING_CALLS.has(name)) {
          // `create` y `configureNext` solo cuentan en LayoutAnimation; `timing` y
          // `decay` en Animated. withTiming es global de Reanimated.
          if ((name === 'create' || name === 'configureNext') && !(callee.type === 'MemberExpression' && callee.object.name === 'LayoutAnimation')) return;
          if ((name === 'timing' || name === 'decay') && !(callee.type === 'MemberExpression' && callee.object.name === 'Animated')) return;
          if (name === 'create' && isNumber(args[0])) {
            context.report({ node: args[0], messageId: 'rnDuration', data: { key: 'duration' } });
          }
          args.forEach(checkOptions);
          return;
        }
        if (CHAIN_METHODS.has(name) && callee.type === 'MemberExpression' && isNumber(args[0])) {
          context.report({ node: args[0], messageId: 'rnDuration', data: { key: name } });
        }
      },
    };
  },
};
