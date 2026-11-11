/**
 * A boolean as a string, like a checkbox value in a spreadsheet.
 */
export type StringBoolean = 'TRUE' | 'FALSE'
const stringBoolean = ['TRUE', 'FALSE'],
  reservedBoolean = ['FALSE', 'TRUE']

/**
 * Negates a primitive boolean or a string boolean.
 * Example: 'TRUE' -> 'FALSE'
 */
export function reverseBoolean(value: StringBoolean | boolean): string | boolean | undefined {
  switch (typeof value) {
    case 'boolean':
      return !value
    case 'string':
      if (!stringBoolean.includes(value))
        throw Error(`Invalid boolean string: ${value}. Expected 'TRUE' or 'FALSE'`)
      return reservedBoolean[stringBoolean.indexOf(value)]
  }
}

/**
 * Returns `value` if `condition` is `true`, otherwise an empty string.
 */
export function ifTrue<T>(condition: boolean, value: T): T | '' {
  return condition ? value : ''
}