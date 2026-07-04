import { describe, expect, it } from 'vitest'
import { ifTrue, reverseBoolean } from '../src/Boolean.ts'
import { value1 } from './Value.ts'

describe('reverseBoolean', () => {
  it('should return a primitive boolean or boolean in string to reversed value based on type', () => {
    expect(reverseBoolean('TRUE')).toBe('FALSE')
    expect(reverseBoolean('FALSE')).toBe('TRUE')
  })
})

describe('ifTrue', () => {
  it('should return the given value only if meet the given condition and return an empty string if not', () => {
    expect(ifTrue(true, value1)).toBe(value1)
    expect(ifTrue(false, value1)).toBe('')
  })
})