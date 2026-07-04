import { describe, expect, it, vi } from 'vitest'
import { Break, iterate, retry } from '../src/Iteration.ts'
import { internalServerErrorMessage, value2 } from './Value.ts'

describe('iterate', () => {
  it(`should run the function x times based on given 'from' and 'until' value`, () => {
    const mock = vi.fn()
    iterate(mock, { from: 1, until: 5 })
    expect(mock).toHaveBeenCalledTimes(5)
  })

  it(`should return value based on the function logic with x iteration times based on given 'from' and 'until' value`, () => {
    expect(iterate((no) => no, { from: 1, until: 5 })).toEqual([1, 2, 3, 4, 5])
  })

  it(`should stop the iteration if it return ${Break} value`, () => {
    let value = 1
    iterate((i) => {
      if (value !== 3)
        value = i
      else
        return Break
    }, { from: 1, until: 5 })
    expect(value).toBe(3)
  })
})

describe('retry', () => {
  it(`should retry until success based on given attempts 'value'`, () => {
    const mock = vi.fn()
      .mockThrowOnce(internalServerErrorMessage)
      .mockThrowOnce(internalServerErrorMessage)
    retry(mock)
    expect(mock).toHaveBeenCalledTimes(3)
  }, 7000)

  it(`should retry until success based on given attempts 'value' and return value when 'withReturnValue' is true`, () => {
    const mock = vi.fn()
      .mockThrowOnce(internalServerErrorMessage)
      .mockReturnValue(value2)
    expect(retry(mock, { withReturnValue: true })).toBe(value2)
  })
})