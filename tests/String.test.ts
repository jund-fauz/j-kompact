import { describe, expect, it } from 'vitest'
import { value1 } from './Value.ts'
import { formatNumber, initString, isString, MLString, Or, toString } from '../src'

describe('MLString', () => {
  describe('toJSON', () => {
    it('should be serialized as a primitive string', () => {
      expect(JSON.stringify({ value1: initString(value1) })).toBe(JSON.stringify({ value1 }))
    })
  })

  describe('toCamelCase', () => {
    it.for([
      ['hello world-foo_bar', 'helloWorldFooBar'],
      ['Nama Lengkap', 'namaLengkap'],
      ['NAMA', 'nama']
    ])('should convert "%s" to "%s"', ([param, expected]) => {
      const result = initString(param).toCamelCase()
      expect(result).toBeInstanceOf(MLString)
      expect(result.toString()).toBe(expected)
    })
  })

  describe('normalizeFromCamelCase', () => {
    it.for([
      [undefined, 'Nama lengkap saya'],
      ['capitalize', 'Nama lengkap saya'],
      ['lowercase', 'nama lengkap saya'],
      ['uppercase', 'NAMA LENGKAP SAYA']
    ])('should split camelCase into words with mode %s', ([mode, expected]) => {
      expect(initString('namaLengkapSaya').normalizeFromCamelCase(mode as any)!.toString()).toBe(expected)
    })
  })

  describe('capitalize', () => {
    it.for([
      ['hELLO', 'Hello'],
      ['h', 'H'],
      ['', '']
    ])('should capitalize "%s"', ([param, expected]) => {
      expect(initString(param).capitalize().toString()).toBe(expected)
    })
  })

  describe('includes', () => {
    it.for([
      [['never', 'say'], true],
      [['never', 'xyz'], false],
      [['never', 'xyz', { logic: Or }], true],
      [['abc', 'xyz', { logic: Or }], false],
      [[['never', 'say']], true]
    ])('should check whether the text includes %o', ([param, expected]) => {
      expect(initString(value1).includes(...(param as string[]))).toBe(expected)
    })
  })

  describe('endWith', () => {
    it.for([
      ['file.TXT', ['.TXT'], true],
      ['file.TXT', ['.txt'], false],
      ['file.TXT', ['.txt', { caseInsensitive: true }], true],
      ['file.txt', ['.csv', '.txt'], false],
      ['file.txt', ['.csv', '.txt', { logic: Or }], true]
    ])('should check whether "%s" ends with %o', ([value, param, expected]) => {
      expect(initString(value as string).endWith(...(param as string[]))).toBe(expected)
    })
  })

  describe('formatNumber', () => {
    it.for([
      ['5', undefined, '05'],
      ['5', 3, '005'],
      ['123', 2, '123']
    ])('should pad "%s" with zero to %s digits', ([value, digitCount, expected]) => {
      expect(initString(value as string).formatNumber(digitCount as number)).toBe(expected)
    })
  })
})

describe('initString', () => {
  it('should return MLString', () => {
    expect(initString(value1)).toBeInstanceOf(MLString)
    expect(initString(value1).toString()).toBe(value1)
  })

  it('should convert a non-string value into MLString', () => {
    expect(initString(5).toString()).toBe('5')
  })
})

describe('toString', () => {
  it('should stringify a value as JSON', () => {
    expect(toString({ value1 })).toBe(`{"value1":"${value1}"}`)
  })
})

describe('isString', () => {
  it.for([
    [value1, true],
    [initString(value1), true],
    [new String(value1), true],
    [1, false],
    [null, false]
  ])('should check whether %o is a string', ([param, expected]) => {
    expect(isString(param)).toBe(expected)
  })
})

describe('formatNumber', () => {
  it.for([
    [7, undefined, '07'],
    [7, 3, '007'],
    [123, 2, '123']
  ])('should format number %i with %s digits', ([number, digitCount, expected]) => {
    expect(formatNumber(number as number, digitCount as number)).toBe(expected)
  })
})
