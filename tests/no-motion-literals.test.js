import { test } from 'node:test';
import { RuleTester, ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import rule from '../rules/no-motion-literals.js';

RuleTester.describe = (_n, fn) => fn();
RuleTester.it = (name, fn) => test(name, fn);
RuleTester.itOnly = RuleTester.it;

const tester = new RuleTester({
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

tester.run('no-motion-literals', rule, {
  valid: [
    // Tokens: ningún literal.
    "el.style.transition = `opacity ${motion.duration.fast}ms ${motion.easing.out}`;",
    "const s = { transition: `transform ${motion.duration.base}ms ${motion.easing.out}` };",
    "withTiming(1, { duration: motion.duration.base, easing: motion.easing.out });",
    "FadeIn.duration(motion.duration.fast);",
    "Animated.timing(v, { toValue: 1, duration: d, useNativeDriver: true });",
    // Textos que no son duraciones.
    "const unit = 'ms';",
    "const id = 'items200';",
    "const bundle = 'app.1500ms.js';",
    "const name = 'forms';",
    // duration fuera de una animación (p. ej. lo que dura un toast en pantalla) no es movimiento.
    "showToast({ message: m, duration: 4000 });",
    "setTimeout(fn, 300);",
    "const msg = 'Reintenta en 2s';",
    "dayjs.duration(n, 'minutes');",
  ],
  invalid: [
    // Strings.
    { code: "const t = '200ms';", errors: [{ messageId: 'ms' }] },
    { code: "const t = 'opacity 0.15ms linear';", errors: [{ messageId: 'ms' }] },
    { code: "const e = 'cubic-bezier(0.22, 1, 0.36, 1)';", errors: [{ messageId: 'bezier' }] },
    { code: "const t = 'all 150ms cubic-bezier(0.4, 0, 1, 1)';", errors: [{ messageId: 'bezier' }, { messageId: 'ms' }] },
    // Template literals.
    { code: "const t = `transform ${x} 280ms ease-out`;", errors: [{ messageId: 'ms' }] },
    { code: "const css = `transition: width 420ms cubic-bezier(.2,.8,.2,1);`;", errors: [{ messageId: 'bezier' }, { messageId: 'ms' }] },
    { code: "const t = `-150ms`;", errors: [{ messageId: 'ms' }] },
    // Segundos de animación.
    { code: "const a = `${dot} 1.1s ease-in-out infinite`;", errors: [{ messageId: 'seconds' }] },
    { code: "const s = { transitionDuration: '0.3s' };", errors: [{ messageId: 'seconds' }] },
    // Objetos de estilo y estilos inline (web).
    { code: "const s = { transition: 'opacity 120ms ease', animationDelay: '30ms' };", errors: [{ messageId: 'ms' }, { messageId: 'ms' }] },
    { code: "const C = () => <div style={{ transitionDuration: '360ms' }} />;", errors: [{ messageId: 'ms' }] },
    { code: "const C = () => <div className=\"x\" data-t='90ms' />;", errors: [{ messageId: 'ms' }] },
    { code: "const C = () => <div style={{ transitionTimingFunction: `cubic-bezier(0.65, 0, 0.35, 1)` }} />;", errors: [{ messageId: 'bezier' }] },
    // React Native: duraciones numéricas y curvas.
    { code: "withTiming(1, { duration: 300 });", errors: [{ messageId: 'rnDuration' }] },
    { code: "withTiming(1, { duration: 300, easing: Easing.bezier(0.22, 1, 0.36, 1) });", errors: [{ messageId: 'rnDuration' }, { messageId: 'rnBezier' }] },
    { code: "withDelay(80, withTiming(1, { duration: motion.duration.fast }));", errors: [{ messageId: 'rnDuration' }] },
    { code: "Animated.timing(v, { toValue: 1, duration: 250, delay: 40, useNativeDriver: true }).start();", errors: [{ messageId: 'rnDuration' }, { messageId: 'rnDuration' }] },
    { code: "LayoutAnimation.configureNext({ duration: 200 });", errors: [{ messageId: 'rnDuration' }] },
    { code: "LayoutAnimation.create(200, 'easeInEaseOut', 'opacity');", errors: [{ messageId: 'rnDuration' }] },
    { code: "const C = () => <Animated.View entering={FadeIn.duration(150).delay(30)} />;", errors: [{ messageId: 'rnDuration' }, { messageId: 'rnDuration' }] },
    { code: "const styles = StyleSheet.create({ box: { transitionDuration: '200ms' } });", errors: [{ messageId: 'ms' }] },
  ],
});

test('motion.ts queda fuera y el preset web la deja en aviso', async () => {
  const { default: web } = await import('../web.js');
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: web({ strict: true }), cwd: process.cwd() });
  const code = "export const t = '200ms';\n";
  const [inMotion] = await eslint.lintText(code, { filePath: 'src/styles/motion.ts' });
  const [outside] = await eslint.lintText(code, { filePath: 'src/features/x/view.ts' });
  const hit = (r) => r.messages.filter((m) => m.ruleId === 'davidyero/no-motion-literals');
  if (hit(inMotion).length !== 0) throw new Error('motion.ts no debería avisar');
  const out = hit(outside);
  if (out.length !== 1 || out[0].severity !== 1) throw new Error(`esperaba 1 aviso, hubo ${JSON.stringify(out)}`);
});
