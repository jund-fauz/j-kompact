import { describe, expect, it } from 'vitest'
import { trim, initObject } from '../src'
import { value2 } from './Value.ts'

describe('trim', () => {
  const notYetTrimmedValue2 = ` ${value2} `
  it.for([
    [notYetTrimmedValue2, value2],
    [[notYetTrimmedValue2, [notYetTrimmedValue2], { notYetTrimmedValue2 }], [value2, [value2], initObject({ notYetTrimmedValue2: value2 })]],
    [{ notYetTrimmedValue2, duBistGenug: [notYetTrimmedValue2] }, initObject({
      notYetTrimmedValue2: value2,
      duBistGenug: [value2]
    })],
  ])('should trim all string even in an array or an object', ([value, expected]) => {
    expect(trim(value)).toEqual(expected)
  })
  it('should return a js object when needed', () => {
    expect(trim({
      notYetTrimmedValue2,
      duBistGenug: [notYetTrimmedValue2]
    }, { useJsObject: true })).toEqual({
      notYetTrimmedValue2: value2,
      duBistGenug: [value2]
    })
  })
})