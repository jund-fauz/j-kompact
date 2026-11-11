/**
 * @module
 * j-kompact: a utility library for manipulating data in JavaScript / TypeScript,
 * running on Node.js / Bun / Deno and Google Apps Script.
 *
 * @example
 * ```ts
 * import { initArray, initObject, initDate } from '@jund-fauz/j-kompact'
 *
 * initArray([3, 1, [2]], { flatting: true }).sort() // MLArray [1, 2, 3]
 * initObject({ name: 'Jundi' }).get('name')          // 'Jundi'
 * initDate({ year: 2026, month: 'JULI', date: 1 }).format('dd MMMM yyyy')
 * ```
 */
export * from './Array.ts'
export * from './Boolean.ts'
export * from './Comparison.ts'
export * from './Date.ts'
export * from './Dynamic.ts'
export * from './Error.ts'
export * from './Iteration.ts'
export * from './Manipulation.ts'
export * from './Number.ts'
export * from './Object.ts'
export * from './String.ts'
export * from './Type.ts'
export * from './google/spreadsheet/Utilites.ts'