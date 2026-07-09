import { describe, expect, it } from 'vitest'
import { between, isSame, isTypeOf, lowerThan, notSameWith, sameWith } from '../src/Comparison.ts'
import { value1, value2, value3 } from './Value.ts'
import { Or } from '../src/Type.ts'
import type { Logic } from '../src/Array.ts'

describe('isSame', () => {
  it('should return true if there is no unique value in the given values', () => {
    expect(isSame(1, 1, 1, 1, 1, 1, 1)).toBe(true)
  })

  it.for([
    [1, 2, 1, 1, 1, 1, 1],
    [1, '1']
  ])('should return false if there is one or more value are different each other', (param) => {
    expect(isSame(...param)).toBe(false)
  })
})

describe('sameWith', () => {
  it.for([
    [value2, value2, value2, value2, value2, value2, value2],
    [value1, value2, value1, value2, value1, value2, value1, { logic: Or }]
  ])('should return true if the given value (strict) same with the other values based on the given logic', (param) => {
    expect(sameWith(...(param as [string, Logic]))).toBe(true)
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
  it.for([
    [1, 2, 3, '<'],
    [1, 1, 1, '<='],
    [1, 1, 2, '<=<'],
    [1, 2, 2, '<<='],
  ])(`should return true if the value is between 'start' and 'until' based on the given comparison logic`, (param) => {
    expect(between(...(param as [number, number, number]))).toBe(true)
  })

  it.for([
    [1, 1, 3, '<'],
    [1, 3, 2, '<='],
    [1, 2, 2, '<=<'],
    [1, 1, 2, '<<='],
  ])(`should return false if the value is not between 'start' and 'until' based on the given comparison logic`, (param) => {
    expect(between(...(param as [number, number, number]))).toBe(false)
  })
})

describe('lowerThan', () => {
  it.for([
    [1, 2, 3, 4, 5, 6, 7, 8],
    [5, 2, 3, 4, 5, 6, 7, 8, { logic: Or }]
  ])('should return true if the given value is lower than the other values based on the given logic', (param) => {
    expect(lowerThan(...(param as [number]))).toBe(true)
  })

  it.for([
    [5, 2, 3, 4, 5, 6, 7, 8],
    [8, 2, 3, 4, 5, 6, 7, 8, { logic: Or }],
  ])('should return false if the given value is higher than or equal with the other values based on the given logic', (param) => {
    expect(lowerThan(...(param as [number]))).toBe(false)
  })
})

describe('isTypeOf', () => {
  it.for([
    [value1, value2, value3],
    [value1, 2, 3.5, { logic: Or }],
  ])('should return true if the given values is type of given type based on the given logic', (param) => {
    expect(isTypeOf('string', ...param)).toBe(true)
  })

  it.for([
    ['number', value1, value2, value3],
    ['boolean', value1, 2, 3.5, { logic: Or }]
  ])('should return false if the given values is not type of given type based on the given logic', (param) => {
    expect(isTypeOf(...(param as [string]))).toBe(false)
  })
})