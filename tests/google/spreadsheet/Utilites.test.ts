import { describe, expect, it } from 'vitest'
import { isYear, MLDate, toMLDate } from '../../../src'
import { value1 } from '../../Value'

describe('isYear', () => {
  it.for([
    [2005, true],
    ['2009', true],
    ['015', false],
    [192, false],
    [114798429, false],
    [value1, false]
  ])('should check year correctly', ([data, result]) => {
    expect(isYear(data)).toBe(result)
  })
})

describe('toMLDate', () => {
  it.for([
    [25569, '1970-01-01T00:00:00.000Z'],
    [45000, '2023-03-15T00:00:00.000Z'],
    [46204.5, '2026-07-01T12:00:00.000Z']
  ])('should convert spreadsheet serial number %d into MLDate', ([serial, expected]) => {
    const date = toMLDate(serial as number)
    expect(date).toBeInstanceOf(MLDate)
    expect(date.toISOString()).toBe(expected)
  })

  it.for([NaN, value1])('should throw if the given value (%s) is not a valid date number', (param) => {
    expect(() => toMLDate(param as number)).toThrow(`${param} bukanlah angka tanggal yang valid`)
  })
})
