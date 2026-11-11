import { describe, expect, it } from 'vitest'
import { ifTrue, reverseBoolean, type StringBoolean } from '../src'
import { value2 } from './Value.ts'

describe('reverseBoolean', () => {
  it.for([
    ['TRUE', 'FALSE'],
    ['FALSE', 'TRUE'],
    [true, false],
    [false, true]
  ])('should return a primitive boolean or boolean in string to reversed value based on type', ([param, expected]) => {
    expect(reverseBoolean(param as StringBoolean)).toBe(expected)
  })

  it('should throw if the given string is not a valid boolean string', () => {
    expect(() => reverseBoolean('true' as StringBoolean)).toThrow("Invalid boolean string: true. Expected 'TRUE' or 'FALSE'")
  })
})

describe('ifTrue', () => {
  it.for([
    [[true, value2], value2],
    [[false, value2], '']
  ])('should return the given value only if meet the given condition and return an empty string if not', ([param, expected]) => {
    expect(ifTrue(...(param as [boolean, string]))).toBe(expected)
  })
})