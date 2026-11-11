# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Versioning was restarted from `0.1.0`. The previously published `1.0.x` releases
> are superseded by this line and should be considered pre-release history.

## [Unreleased]

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
- Test suite covering every module (274 tests).
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

[Unreleased]: https://github.com/jund-fauz/j-kompact/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jund-fauz/j-kompact/releases/tag/v0.1.0
