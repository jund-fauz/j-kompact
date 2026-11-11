import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Break, iterate, retry } from '../src'
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

  it(`should collect the returned values even if the first one is falsy`, () => {
    expect(iterate((no) => no, { from: 0, until: 2 })).toEqual([0, 1, 2])
  })

  it(`should not return anything if the function doesn't return a value`, () => {
    expect(iterate(() => {}, { from: 1, until: 3 })).toBeUndefined()
  })

  it(`should return values without extra element when 'withReturnValue' is true`, () => {
    expect(iterate((no) => no * 2, { from: 1, until: 3, withReturnValue: true })).toEqual([2, 4, 6])
  })

  it(`should not return values when 'withReturnValue' is false`, () => {
    expect(iterate((no) => no, { from: 1, until: 3, withReturnValue: false })).toBeUndefined()
  })

  it(`should exclude 'until' when 'untilBefore' is true`, () => {
    expect(iterate((no) => no, { from: 0, until: 3, untilBefore: true })).toEqual([0, 1, 2])
  })

  it(`should step based on 'addition'`, () => {
    expect(iterate((no) => no, { from: 0, until: 10, addition: 5 })).toEqual([0, 5, 10])
  })

  it(`should run once when only 'from' is given`, () => {
    expect(iterate((no) => no, { from: 5 })).toEqual([5])
  })

  it(`should not run the function when the range is empty`, () => {
    const mock = vi.fn()
    iterate(mock, { from: 0, until: 0, untilBefore: true })
    iterate(mock, { from: 3, until: 2 })
    expect(mock).not.toHaveBeenCalled()
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

  it(`should not include ${Break} in the returned values`, () => {
    expect(iterate((i) => i === 3 ? Break : i, { from: 1, until: 5 })).toEqual([1, 2])
  })
})

describe('retry', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it(`should retry until success based on given attempts 'value'`, () => {
    const mock = vi.fn()
      .mockThrowOnce(internalServerErrorMessage)
      .mockThrowOnce(internalServerErrorMessage)
    retry(mock, { waitingInSec: 0 })
    expect(mock).toHaveBeenCalledTimes(3)
  })

  it(`should retry until success based on given attempts 'value' and return value when 'withReturnValue' is true`, () => {
    const mock = vi.fn()
      .mockThrowOnce(internalServerErrorMessage)
      .mockReturnValue(value2)
    expect(retry(mock, { withReturnValue: true, waitingInSec: 0 })).toBe(value2)
  })

  it(`should throw the last error after all attempts failed`, () => {
    const mock = vi.fn(() => {
      throw new Error(internalServerErrorMessage)
    })
    expect(() => retry(mock, { attempts: 2, waitingInSec: 0 })).toThrow(internalServerErrorMessage)
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it(`should return the fallback value after all attempts failed when 'withReturnValue' is true`, () => {
    const mock = vi.fn(() => {
      throw new Error(internalServerErrorMessage)
    })
    expect(retry(mock, { attempts: 2, waitingInSec: 0, withReturnValue: true, fallback: value2 })).toBe(value2)
    expect(retry(mock, { attempts: 2, waitingInSec: 0, withReturnValue: true, fallback: () => value2 })).toBe(value2)
  })

  it(`should call the fallback function then rethrow when 'withReturnValue' is false`, () => {
    const fallback = vi.fn()
    expect(() => retry(() => {
      throw new Error(internalServerErrorMessage)
    }, { attempts: 1, waitingInSec: 0, fallback })).toThrow(internalServerErrorMessage)
    expect(fallback).toHaveBeenCalledOnce()
  })
})
