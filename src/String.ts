import { And, Or } from './Type.ts'
import { getOptions } from './Array.ts'

const
  Capitalize = 'capitalize',
  LowerCase = 'lowercase',
  UpperCase = 'uppercase'

type NormalizeMode = typeof Capitalize | typeof LowerCase | typeof UpperCase
type Logic = typeof And | typeof Or

export class MLString<T extends string = string> extends String {
  readonly _literalType!: T

  toJSON() {
    return this.toString()
  }

  toCamelCase() {
    return initString(
      this
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, (char) => char.toLowerCase())
        .replace(/\W+/, '')
    )
  }

  normalizeFromCamelCase(mode: NormalizeMode = Capitalize) {
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

  capitalize() {
    return this.length ? initString(this[0]!.toUpperCase() + this.slice(1).toLowerCase()) : ''
  }

  /**
   * Mengecek apakah suatu teks ada di dalam teks-teks lain
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

  endWith(...searchValues: string[] | [{ logic?: Logic, caseInsensitive?: boolean }]) {
    const { logic = And, caseInsensitive = false } = getOptions(searchValues),
      process = (searchValue: string) => caseInsensitive ? this.toLowerCase().endsWith(searchValue.toLowerCase()) : this.endsWith(searchValue)
    const flattenSearchValues = searchValues.lazyFlat() as string[]
    return logic === And
      ? flattenSearchValues.every(process)
      : flattenSearchValues.some(process)
  }

  formatNumber(digitCount: number = 2) {
    return this.padStart(digitCount, '0')
  }
}

export function initString<const T = string>(value: T): MLString<T extends string ? T : string> {
  return new MLString(value)
}

export const toString = JSON.stringify

export function isString(value: any) {
  return typeof value === 'string' || value instanceof String
}

export function formatNumber(number: number, digitCount: number = 2) {
  return initString(number).formatNumber(digitCount)
}