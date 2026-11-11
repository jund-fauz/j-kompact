# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Versioning was restarted from `0.1.0`. The previously published `1.0.x` releases
> are superseded by this line and should be considered pre-release history.

## [Unreleased]

### Changed

- Error and log messages are now in English:
  - `MLArray.slice`: `Start / end must not be 0`
  - `reverseBoolean`: `Invalid boolean string: <value>. Expected 'TRUE' or 'FALSE'`
  - `toMLDate`: `<value> is not a valid spreadsheet date number`
  - `MLObject.convertValueAs`: logs `Invalid type: <type>`
- The debug log of `MLArray.search` now shows `Function Name: search` (was `getIndexes`).

## [0.3.1] - 2026-11-12

### Added

- JSDoc for every exported symbol and a module doc with an example, so the
  documentation on JSR is complete.
- GitHub Actions workflow that tests and publishes to JSR on every `v*` tag,
  with provenance.

### Fixed

- All public APIs now have explicit types, so JSR no longer reports slow types.
  Node.js users installing from JSR now get `.d.ts` files, and type checking is
  faster.
- More accurate return types: `MLArray.repeat` returns `MLArray<T>` (was `T[]`),
  `MLArray.findIndexInOrder` returns `number | undefined` (was `undefined`),
  `MLDate.format` returns `string` (was `any`), and `MLArray.mapToObject` returns
  `MLObject<any>` (was `any`).

## [0.3.0] - 2026-11-12

### Added

- Published on JSR as [`@jund-fauz/j-kompact`](https://jsr.io/@jund-fauz/j-kompact)
  (`jsr.json`). Releases `0.1.0` and `0.2.0` were published there as well.

### Changed

- **Breaking:** `MLArray.readableJoin` now puts the separator before the last
  conjunction when there are three or more items (`'a, b, dan c'` instead of
  `'a, b dan c'`). Two items are still joined without a separator (`'a dan b'`).

## [0.2.0] - 2026-11-12

### Added

- **Number** — `range(from, until)` returns an inclusive sequence of numbers and
  throws if `until` is lower than `from`.
- `MLArray.flatPush` — flattens the given values, pushes them in batches, and
  returns the `MLArray` itself for chaining (the behavior `push` had in 0.1.0).
- `MLArray.change` — filters the array in-place and returns the same `MLArray`
  (the behavior `filter` had in 0.1.0).

### Changed

- **Breaking:** `MLArray.push` is no longer overridden. It behaves like the native
  `push` and returns the new length. Use `flatPush` for the old chainable,
  flattening behavior.
- **Breaking:** `MLArray.filter` now behaves like the native `filter`: it returns a
  new `MLArray` and leaves the original untouched. Use `change` to filter in-place.

### Removed

- **Breaking:** `MLArray.immutableFilter`. Use `filter` instead.

### Fixed

- `MLObject.filter` works again after the `immutableFilter` removal.
- `flatPush` now flattens nested values, so `flatPush([2, [3]], 4)` pushes
  `2, 3, 4`. Before this fix the nested arrays were pushed as they were.

## [0.1.0] - 2026-11-12

First release of the restarted version line.

### Added

- **Array** — `MLArray` (extends `Array`) with one-based helpers and chainable,
  in-place operations: `init`, `repeat`, `findIndexInOrder`, `mapToObject`,
  `castToString`, `mapCast`, `locationOf`, one-based `slice` and `get`,
  `readableJoin`, chainable `push`, in-place `filter` plus `immutableFilter`,
  `batch`, `lazyFlat`, `addAfter`, `deleteNull`, `search`, `getValueWhere`,
  `getValuesExcept`, `wrap`, `wrapInside`, `unique`, `toParam`, `extract`,
  `sort` (`Ascending` / `Descending` / compare function), `toObject`, `iterate`,
  `sum`, `subtract`, `max`, `min`, `minMax`, `isTypeOf`.
- Array helpers: `initArray`, `isArray`, `isAllArray`, `isIterable`, `flat`,
  `wrap`, `lazyWrap`, `getOptions`, and the `Array.prototype.asMLArray` /
  `Array.prototype.lazyFlat` extensions (typed through `global.d.ts`).
- **Object** — `MLObject` with cached `entries` / `keys` / `values`, `reverse`,
  `reEntries`, `forEach`, `map`, `filter`, multi-key `get`, `getKeyByValue`,
  `delete`, `set` (single key, key/value lists, or a record), `convertValueAs`,
  `add`; helpers `initObject`, `isObject`, `isEmpty`, `parse`, `toJSObject`.
- **String** — `MLString` with `toCamelCase`, `normalizeFromCamelCase`,
  `capitalize`, multi-value `includes`, `endWith` (logic and case-insensitive
  options), `formatNumber`, JSON-safe `toJSON`; helpers `initString`,
  `isString`, `toString`, `formatNumber`.
- **Date** — `MLDate` (extends `Date`) with getters (`miliseconds`, `seconds`,
  `minutes`, `hours`, `date`, `lastDate`, one-based `month`, `shortMonth`,
  `longMonth`, `year`), setters (`date`, `month` by number or Indonesian month
  name, `year`), chainable `setHours` / `setDate` / `setMonth`, `lastMonth`,
  `nextMonth`, and timezone-aware `format` (uses `Utilities.formatDate` in Google
  Apps Script, `dayjs` elsewhere); helpers `initDate`, `isDate`.
- **Comparison** — `isSame`, `sameWith`, `notSameWith`, `between`, `lowerThan`,
  `isTypeOf`, all supporting `And` / `Or` logic.
- **Boolean** — `reverseBoolean` (also for `'TRUE'` / `'FALSE'` strings), `ifTrue`.
- **Iteration** — `iterate` (a configurable `for` loop with `Break`), `retry`
  (attempts, delay, fallback).
- **Manipulation** — deep `trim` for strings, arrays, and objects.
- **Dynamic** — environment-aware `log` and `wait` for Node.js / Bun and
  Google Apps Script.
- **Error** — `templateLogError`.
- **Google Spreadsheet** — `toMLDate` (spreadsheet serial number to `MLDate`),
  `isYear`.
- Type constants: `Ascending`, `Descending`, `And`, `Or`, `mlArray`, `mlObject`,
  `array`, `object`.
- Test suite covering every module (274 tests at release time).
- English and Indonesian READMEs.

### Fixed

- `iterate` no longer calls the function once when the range is empty (for
  example `initArray([]).iterate(fn)`), no longer prepends `true` to the result
  when `withReturnValue: true`, no longer includes `Break` in the result, and
  collects return values even when the first one is falsy (such as `0`).
- `wrap(value, 0)` now returns the value unwrapped instead of wrapping it once.
- `MLArray.get` with exactly two indexes now returns both values instead of only
  the first one.
- `MLArray.search` now records a match range that starts at index `0` and runs
  to the end of the array.
- `MLArray.sum` on numeric strings with different decimal lengths (for example
  `['1.5', '2.25']`) now returns the correct total.

[Unreleased]: https://github.com/jund-fauz/j-kompact/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/jund-fauz/j-kompact/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/jund-fauz/j-kompact/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jund-fauz/j-kompact/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jund-fauz/j-kompact/releases/tag/v0.1.0
