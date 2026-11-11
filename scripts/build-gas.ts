/**
 * Bundles j-kompact into a single Google Apps Script file.
 *
 * Apps Script has no module system: every file shares one global scope and
 * `import` / `export` are syntax errors. This script bundles `src/` (including
 * dependencies such as dayjs) into one file that exposes the whole library as
 * the global `JKompact` object.
 *
 * Usage: bun run build:gas  →  dist/gas/j-kompact.js
 */
import { build } from 'esbuild'
import pkg from '../package.json' with { type: 'json' }

const outfile = 'dist/gas/j-kompact.js'

// Small polyfills for methods the library uses, applied only when missing.
const polyfills = `
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    configurable: true, writable: true,
    value: function (n) { n = Math.trunc(n) || 0; if (n < 0) n += this.length; return this[n] }
  })
}
if (!String.prototype.replaceAll) {
  Object.defineProperty(String.prototype, 'replaceAll', {
    configurable: true, writable: true,
    value: function (search, replacement) { return this.split(search).join(replacement) }
  })
}`

await build({
  entryPoints: ['src/index.ts'],
  outfile,
  bundle: true,
  format: 'iife',
  globalName: 'JKompact',
  platform: 'neutral',
  mainFields: ['module', 'main'],
  // Apps Script runs on V8; lowering to ES2019 keeps syntax such as private
  // class fields and optional chaining safe on every Apps Script runtime.
  target: 'es2019',
  charset: 'utf8',
  legalComments: 'inline',
  banner: {
    js: `// j-kompact v${pkg.version} for Google Apps Script\n// https://github.com/jund-fauz/j-kompact (MPL-2.0)\n${polyfills}\n`,
  },
})

console.log(`Built ${outfile}`)
