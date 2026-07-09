import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { type DateObject, initDate, isDate, MLDate } from '../src/Date.ts'
import { value2 } from './Value.ts'

describe('MLDate', () => {
  let mockMLDate: MLDate
  beforeEach(() => {
    mockMLDate = initDate('1 Jul 2026')
  })

  describe('setter', () => {
    it('should set date correctly', () => {
      mockMLDate.date = 5
      expect(mockMLDate.date).toBe(5)
    })

    it('should set month correctly based on input', () => {
      mockMLDate.month = 5
      expect(mockMLDate.month).toBe(5)

      mockMLDate.month = 'JAN'
      expect(mockMLDate.month).toBe(1)

      mockMLDate.month = 'FEBRUARI'
      expect(mockMLDate.month).toBe(2)
    })

    it('should set year correctly', () => {
      mockMLDate.year = 2025
      expect(mockMLDate.year).toBe(2025)
    })

    it('should can be called by chain (setDate & setMonth) and setted correctly', () => {
      mockMLDate
        .setDate(20)
        .setMonth('SEPTEMBER')
      expect(mockMLDate.date).toBe(20)
      expect(mockMLDate.month).toBe(9)
    })
  })

  describe('nextMonth', () => {
    it('should return new MLDate with nextMonth configuration at first date', () => {
      const nextMonth = mockMLDate.nextMonth()
      expect(nextMonth).toBeInstanceOf(MLDate)
      expect(nextMonth.date).toBe(1)
      expect(nextMonth.month).toBe(8)
      expect(nextMonth.year).toBe(2026)
      expect(nextMonth.lastDate).toBe(31)
    })
  })

  describe('lastMonth', () => {
    it('should return new MLDate with lastMonth configuration at first date', () => {
      const lastMonth = mockMLDate.lastMonth()
      expect(lastMonth).toBeInstanceOf(MLDate)
      expect(lastMonth.date).toBe(1)
      expect(lastMonth.month).toBe(6)
      expect(lastMonth.year).toBe(2026)
      expect(lastMonth.lastDate).toBe(30)
    })
  })

  describe('format', () => {
    it.for([
      ['dd MM yyyy', '01 07 2026'],
      ['d MMM yy', '1 Jul 26'],
      ['MMMM', 'July']
    ])('should formatDate the date correctly (non-GAS)', ([param, expected]) => {
      expect(mockMLDate.format(param as string)).toBe(expected)
    })
  })
})

describe('initDate', () => {
  it.for([
    [2026, 6, 1],
    ['1 Jul 2026'],
    [new Date(2026, 6, 1)],
    [initDate(2026, 6, 1)],
    [{ year: 2026, month: 'JUL', date: 1 }],
    [{ year: 2026, month: 'JULI', date: 1 }],
    [{ year: 2026, month: 7, date: 1 }]
  ])('should return an instance of MLDate and give correct value', (param) => {
    const date = initDate(...(param as number[] | [string | Date | MLDate | DateObject]))
    expect(date).toBeInstanceOf(MLDate)
    expect(date.year).toBe(2026)
    expect(date.month).toBe(7)
    expect(date.shortMonth.toString()).toBe('JUL')
    expect(date.longMonth.toString()).toBe('JULI')
    expect(date.date).toBe(1)
    expect(date.lastDate).toBe(31)
  })
})

describe('isDate', () => {
  it.for([
    [new Date(), new Date(value2)],
    ['1 Jul 26', 'GL-1235']
  ])('should check whether the given parameter is a valid Date', ([trueParam, falseParam]) => {
    expect(isDate(trueParam)).toBe(true)
    expect(isDate(falseParam)).toBe(false)
  })
})