type StringBoolean = 'TRUE' | 'FALSE'
const stringBoolean = ['TRUE', 'FALSE'],
  reservedBoolean = stringBoolean.reverse()

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