import { describe, expect, it } from 'vitest'
import { between, isSame, isTypeOf, lowerThan, notSameWith, sameWith } from '../src/Comparison.ts'
import { value1, value2, value3 } from './Value.ts'
import { Or } from '../src/Type.ts'

describe('isSame', () => {
  it('should return true if there is no unique value in the given values', () => {
    expect(isSame(1, 1, 1, 1, 1, 1, 1)).toBe(true)
  })

  it('should return false if there is one or more value are different each other', () => {
    expect(isSame(1, 2, 1, 1, 1, 1, 1)).toBe(false)
    expect(isSame(1, '1')).toBe(false)
  })
})

describe('sameWith', () => {
  it('should return true if the given value (strict) same with the other values based on the given logic', () => {
    expect(sameWith(value1, value1, value1, value1, value1, value1, value1)).toBe(true)
    expect(sameWith(value1, value2, value1, value2, value1, value2, value1, { logic: Or })).toBe(true)
  })

  it('should return false if the given value (strict) not same with the other values based on the given logic', () => {
    expect(sameWith(value1, value2)).toBe(false)
  })
})

describe('notSameWith', () => {
  it('should return false if the given value (strict) same with one of the other values', () => {
    expect(notSameWith(value1, value1, value2)).toBe(false)
  })

  it('should return true if the given value (strict) not same with all of the other values', () => {
    expect(notSameWith(value1, value2, value3)).toBe(true)
  })
})

describe('between', () => {
  it(`should return true if the value is between 'start' and 'until' based on the given comparison logic`, () => {
    expect(between(1, 2, 3, '<')).toBe(true)
    expect(between(1, 1, 1, '<=')).toBe(true)
    expect(between(1, 1, 2, '<=<')).toBe(true)
    expect(between(1, 2, 2, '<<=')).toBe(true)
  })

  it(`should return false if the value is not between 'start' and 'until' based on the given comparison logic`, () => {
    expect(between(1, 1, 3, '<')).toBe(false)
    expect(between(1, 3, 2, '<=')).toBe(false)
    expect(between(1, 2, 2, '<=<')).toBe(false)
    expect(between(1, 1, 2, '<<=')).toBe(false)
  })
})

describe('lowerThan', () => {
  it('should return true if the given value is lower than the other values based on the given logic', () => {
    expect(lowerThan(1, 2, 3, 4, 5, 6, 7, 8)).toBe(true)
    expect(lowerThan(5, 2, 3, 4, 5, 6, 7, 8, { logic: Or })).toBe(true)
  })

  it('should return false if the given value is higher than or equal with the other values based on the given logic', () => {
    expect(lowerThan(5, 2, 3, 4, 5, 6, 7, 8)).toBe(false)
    expect(lowerThan(8, 2, 3, 4, 5, 6, 7, 8, { logic: Or })).toBe(false)
  })
})

describe('isTypeOf', () => {
  it('should return true if the given values is type of given type based on the given logic', () => {
    expect(isTypeOf('string', value1, value2, value3)).toBe(true)
    expect(isTypeOf('string', value1, 2, 3.5, { logic: Or })).toBe(true)
  })

  it('should return false if the given values is not type of given type based on the given logic', () => {
    expect(isTypeOf('number', value1, value2, value3)).toBe(false)
    expect(isTypeOf('boolean', value1, 2, 3.5, { logic: Or })).toBe(false)
  })
})