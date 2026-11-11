import { And, Or } from './Type.ts'
import { getOptions } from './Array.ts'

const
  Capitalize = 'capitalize',
  LowerCase = 'lowercase',
  UpperCase = 'uppercase'

type NormalizeMode = typeof Capitalize | typeof LowerCase | typeof UpperCase
type Logic = typeof And | typeof Or

/**
 * A `String` subclass with helpers such as `toCamelCase`, `capitalize`, and multi-value `includes`. Create an instance with `initString`.
 */
export class MLString<T extends string = string> extends String {
  readonly _literalType!: T

  toJSON(): string {
    return this.toString()
  }

  toCamelCase(): MLString {
    return initString(
      this
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, (char) => char.toLowerCase())
        .replace(/\W+/, '')
    )
  }

  normalizeFromCamelCase(mode: NormalizeMode = Capitalize): MLString | '' {
    const result = this.replace(/[A-Z]/g, ' $&')
    switch (mode) {
      case Capitalize:
        return initString(result).capitalize()
      case LowerCase:
        return initString(result.toLowerCase())
      case UpperCase:
        return initString(result.toUpperCase())
    }
  }

  capitalize(): MLString | '' {
    return this.length ? initString(this[0]!.toUpperCase() + this.slice(1).toLowerCase()) : ''
  }

  /**
   * Checks whether the text includes the given values, using `And` (default) or `Or` logic.
   */
  override includes(...searchValues: string[] | { logic?: Logic }[]): boolean

  override includes(string: string, position?: number): boolean

  override includes(...searchValues: any[]) {
    const { logic = And } = getOptions(searchValues),
      process = (searchValue: string) => super.includes(searchValue)
    searchValues = searchValues.lazyFlat()
    return logic === And
      ? searchValues.every(process)
      : searchValues.some(process)
  }

  endWith(...searchValues: string[] | [{ logic?: Logic, caseInsensitive?: boolean }]): boolean {
    const { logic = And, caseInsensitive = false } = getOptions(searchValues),
      process = (searchValue: string) => caseInsensitive ? this.toLowerCase().endsWith(searchValue.toLowerCase()) : this.endsWith(searchValue)
    const flattenSearchValues = searchValues.lazyFlat() as string[]
    return logic === And
      ? flattenSearchValues.every(process)
      : flattenSearchValues.some(process)
  }

  formatNumber(digitCount: number = 2): string {
    return this.padStart(digitCount, '0')
  }
}

/**
 * Creates an `MLString` from a string or any value.
 */
export function initString<const T = string>(value: T): MLString<T extends string ? T : string> {
  return new MLString(value)
}

/**
 * Converts a value into a JSON string (alias of `JSON.stringify`).
 */
export const toString = JSON.stringify

/**
 * Checks whether a value is a primitive string or a `String` / `MLString` object.
 */
export function isString(value: any): value is string | String {
  return typeof value === 'string' || value instanceof String
}

/**
 * Pads a number with leading zeros up to `digitCount` digits (default 2).
 *
 * @example
 * ```ts
 * formatNumber(7) // '07'
 * ```
 */
export function formatNumber(number: number, digitCount: number = 2): string {
  return initString(number).formatNumber(digitCount)
}