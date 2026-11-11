# j-kompact

**English** | [Bahasa Indonesia](./README.id.md)

A utility library for manipulating data in JavaScript / TypeScript applications.
It adds richer `Array`, `Object`, `String`, and `Date` classes plus small helpers
for comparison, iteration, and logging, and it runs in both **Node.js / Bun** and
**Google Apps Script**.

- One-based indexing helpers (`get(1)` is the first item), which fit spreadsheet work.
- Chainable, in-place operations on `MLArray` (`change`, `unique`, `lazyFlat`, `flatPush`, ...).
- Environment-aware `log`, `wait`, and `MLDate.format`: they use `Logger`,
  `Utilities.sleep`, and `Utilities.formatDate` in Google Apps Script, and
  `console`, `Atomics.wait`, and `dayjs` elsewhere.
- Written in TypeScript and shipped with type declarations.

## Installation

The package is published on [JSR](https://jsr.io/@jund-fauz/j-kompact):

```bash
npx jsr add @jund-fauz/j-kompact   # npm
bunx jsr add @jund-fauz/j-kompact  # Bun
deno add jsr:@jund-fauz/j-kompact  # Deno
```

```ts
import { initArray, initObject, initString, initDate } from '@jund-fauz/j-kompact'
```

> The `j-kompact` package on npm is still at the old `1.0.x` line and does not
> have the `0.x` releases yet. Use JSR for now. The examples below import from
> `'j-kompact'`; replace it with `'@jund-fauz/j-kompact'` when installing from JSR.

The package is ESM-only.

Importing the package also adds two methods to `Array.prototype` at runtime:
`asMLArray()` and `lazyFlat()`. In TypeScript code, prefer `initArray(array)`,
which is fully typed.

## Usage

### Array (`MLArray`)

`MLArray` extends the native `Array`, so every native method still works.

```ts
import { initArray, MLArray, Descending } from 'j-kompact'

const list = initArray([3, 1, [2, [4]]], { flatting: true }) // MLArray [3, 1, 2, 4]

list.get(1)              // 3            (one-based)
list.get(-1)             // 4
list.get(1, 2)           // MLArray [3, 1]
list.locationOf(2)       // 3            (one-based indexOf, 0 if not found)
list.slice(2, 3)         // MLArray [1, 2] (one-based start)
list.sort(Descending)    // MLArray [4, 3, 2, 1]
list.sum()               // 10
list.minMax()            // [1, 4]

initArray(['a', 'b', 'c']).readableJoin()                // 'a, b, dan c'
initArray(['a', 'b', 'c']).readableJoin({ and: 'and' })  // 'a, b, and c'
initArray(['a', 'b']).readableJoin()                     // 'a dan b'

initArray([1, 1, 2, null]).unique()                      // MLArray [1, 2]
initArray([1, 2, 3, 4]).filter(n => n % 2 === 0)         // new MLArray: [2, 4] (native behavior)
initArray([1, 2, 3, 4]).change(n => n % 2 === 0)         // in-place: [2, 4]
initArray([1]).flatPush([2, [3]], 4)                     // in-place and chainable: [1, 2, 3, 4]
initArray(['0.1', '0.2']).sum()                          // 0.3

// 2D arrays (for example, spreadsheet values)
const rows = initArray([[1, 'a'], [2, 'b']])
rows.extract(1)    // MLArray [1, 2]   (first column)
rows.toParam()     // [[1, 2], ['a', 'b']] (transpose)
rows.toObject()    // MLObject { 1: 'a', 2: 'b' }

// Find ranges of consecutive matches (zero-based)
initArray(['x', 'a', 'a', 'y', 'a'], { withLog: false }).search('a') // [[1, 2], [4, 4]]

MLArray.repeat('-', 3)  // MLArray ['-', '-', '-']
;[1, 2].asMLArray()     // MLArray [1, 2]
```

`initArray` options: `flatting`, `deleteNull`, `unique`, `withLog` (default
`true`; set it to `false` to silence the debug logs of `search` and `slice`).

> Since 0.2.0, `push` and `filter` behave like the native methods. Use `flatPush`
> and `change` for the chainable, in-place versions. See the
> [CHANGELOG](./CHANGELOG.md#020---2026-11-12).

### Object (`MLObject`)

```ts
import { initObject, toJSObject, parse, isObject, isEmpty } from 'j-kompact'

const user = initObject({ name: 'Jundi', city: 'Bandung' })

user.name                       // 'Jundi' (keys are also exposed as properties)
user.get('name', 'city')        // MLArray ['Jundi', 'Bandung']
user.keys                       // MLArray ['name', 'city']
user.getKeyByValue('Bandung')   // MLString 'city'
user.reverse()                  // MLObject { Jundi: 'name', Bandung: 'city' }
user.filter((key, value) => key === 'city') // MLObject { city: 'Bandung' }
user.set('age', 25).delete('city')
user.object                     // { name: 'Jundi', age: 25 }

toJSObject(user)                // plain object
parse([['a', 1], ['b', 2]])     // { a: 1, b: 2 }
parse('{"a":1}')                // { a: 1 }
isObject({}), isEmpty({})       // true, true
```

### String (`MLString`)

```ts
import { initString, formatNumber, Or } from 'j-kompact'

initString('nama lengkap').toCamelCase()              // 'namaLengkap'
initString('namaLengkap').normalizeFromCamelCase()    // 'Nama lengkap'
initString('hELLO').capitalize()                      // 'Hello'
initString('report.XLSX').endWith('.xlsx', { caseInsensitive: true }) // true
initString('never say never').includes('say', 'xyz', { logic: Or })   // true
formatNumber(7)                                       // '07'
```

### Date (`MLDate`)

```ts
import { initDate, isDate } from 'j-kompact'

const date = initDate({ year: 2026, month: 'JULI', date: 1 }) // also 'JUL' or 7

date.month       // 7 (one-based)
date.longMonth   // 'JULI'
date.shortMonth  // 'JUL'
date.lastDate    // 31
date.nextMonth() // new MLDate, 1 August 2026
date.lastMonth() // new MLDate, 1 June 2026

date.setDate(20).setMonth('SEPTEMBER').setHours(8, 30) // chainable
date.format('dd MMMM yyyy HH:mm')                      // timezone defaults to 'Asia/Jakarta'
date.format('yyyy-MM-dd', 'UTC')

isDate('1 Jul 2026')  // true
```

`initDate` accepts the same arguments as `new Date(...)`, a `Date` / `MLDate`, or
a `{ year, month, date }` object whose missing parts are filled from today.

### Number

```ts
import { range } from 'j-kompact'

range(1, 5)   // [1, 2, 3, 4, 5] (inclusive)
range(-1, 1)  // [-1, 0, 1]
range(5, 1)   // throws: 'until' should be greater than or equal to 'from'
```

### Comparison

```ts
import { isSame, sameWith, notSameWith, between, lowerThan, isTypeOf, Or } from 'j-kompact'

isSame(1, 1, 1)                        // true
sameWith('a', 'a', 'b', { logic: Or }) // true
notSameWith('a', 'b', 'c')             // true
between(1, 2, 3)                       // true  (1 < 2 < 3)
between(1, 3, 3, '<<=')                // true  (1 < 3 <= 3); also '<=' and '<=<'
lowerThan(1, 2, 3)                     // true
isTypeOf('string', 'a', 1, { logic: Or }) // true
```

### Iteration

```ts
import { iterate, retry, Break } from 'j-kompact'

iterate(i => i * 2, { from: 1, until: 3 })   // [2, 4, 6]
iterate(i => (i === 3 ? Break : i), { until: 5 }) // [1, 2]

const data = retry(() => fetchSomething(), {
  attempts: 3,         // default 3
  waitingInSec: 2,     // waits attempt * waitingInSec seconds between tries
  withReturnValue: true,
  fallback: []         // a value or a function, used after the last failure
})
```

### Other helpers

```ts
import { trim, reverseBoolean, ifTrue, log, wait, templateLogError } from 'j-kompact'

trim({ name: ' Jundi ', tags: [' a '] }, { useJsObject: true }) // { name: 'Jundi', tags: ['a'] }
reverseBoolean('TRUE')   // 'FALSE'
ifTrue(false, 'shown')   // ''
log('message', { a: 1 }) // Logger.log in Apps Script, console.log elsewhere
wait(1)                  // blocks for 1 second

try {
  doWork()
} catch (e) {
  templateLogError(e as Error, 'doWork', { prefixMessage: 'Sync failed', withThrow: false })
}
```

### Google Spreadsheet

```ts
import { toMLDate, isYear } from 'j-kompact'

toMLDate(46204)  // MLDate for 2026-07-01 (UTC) from a spreadsheet serial number
isYear('2026')   // true (valid range: 1999 - 2099)
```

## Development

```bash
bun install
bun run test    # vitest
bun run build   # compile to dist/
```

See [CHANGELOG.md](./CHANGELOG.md) for the release history.

## AI assistance

This project is developed with the help of AI tools (for tests, documentation, and
some bug fixes). All changes are reviewed and maintained by the author.

## License

[MPL-2.0](./LICENSE)
