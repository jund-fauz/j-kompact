type StringBoolean = 'TRUE' | 'FALSE'
const stringBoolean = ['TRUE', 'FALSE'],
  reservedBoolean = ['FALSE', 'TRUE']

/**
 * Melakukan negasi pada primitif boolean atau boolean pada string.
 * Contoh: 'TRUE' -> 'FALSE'
 */
export function reverseBoolean(value: StringBoolean | boolean) {
  switch (typeof value) {
    case 'boolean':
      return !value
    case 'string':
      if (!stringBoolean.includes(value))
        throw Error('Value tidak valid.')
      return reservedBoolean[stringBoolean.indexOf(value)]
  }
}

export function ifTrue<T>(condition: boolean, value: T) {
  return condition ? value : ''
}