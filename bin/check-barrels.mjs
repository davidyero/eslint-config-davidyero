#!/usr/bin/env node
// Regla 4 del ecosistema: sin barrel exports. Falla si algún index.ts / index.tsx
// solo reexporta (`export * from` / `export { … } from`) en vez de definir código.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'src';
const skip = new Set(['node_modules', 'generated', 'dist']);
const offenders = [];

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/^index\.tsx?$/.test(name)) {
      const code = readFileSync(path, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      if (code.length > 0 && code.every((s) => /^export\s+(\*|type\s*\{|\{)[\s\S]*\bfrom\b/.test(s))) {
        offenders.push(path);
      }
    }
  }
};

walk(root);
if (offenders.length > 0) {
  console.error('✗ check-barrels: estos index solo reexportan (prohibido, importa el archivo directo):');
  for (const o of offenders) console.error(`  - ${o}`);
  process.exit(1);
}
console.log('✓ check-barrels: sin barrels');
