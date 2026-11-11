import { describe, expect, it } from 'vitest'
import { range } from '../src'

describe('range', () => {
  it.for([
    [1, 5, [1, 2, 3, 4, 5]],
    [0, 2, [0, 1, 2]],
    [3, 3, [3]],
    [-2, 1, [-2, -1, 0, 1]]
  ])('should return numbers from %i until %i (inclusive)', ([from, until, expected]) => {
    expect(range(from as number, until as number)).toEqual(expected)
  })

  it(`should throw if 'until' is lower than 'from'`, () => {
    expect(() => range(5, 1)).toThrow(`'until' should be greater than or equal to 'from'`)
  })
})
