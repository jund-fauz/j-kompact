import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { type DateObject, initDate, isDate, MLDate } from '../src'
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

  describe('getter', () => {
    it('should return each part of the date', () => {
      const date = initDate(2026, 6, 1, 13, 45, 30, 250)
      expect(date.miliseconds).toBe(250)
      expect(date.seconds).toBe(30)
      expect(date.minutes).toBe(45)
      expect(date.hours).toBe(13)
      expect(date.date).toBe(1)
      expect(date.month).toBe(7)
      expect(date.year).toBe(2026)
    })

    it.for([
      [[2024, 1, 10], 29],
      [[2025, 1, 10], 28],
      [[2026, 3, 10], 30],
      [[2026, 11, 10], 31]
    ])('should return the last date of the month %o', ([param, expected]) => {
      expect(initDate(...(param as number[])).lastDate).toBe(expected)
    })
  })

  describe('setHours', () => {
    it('should set the time and return the MLDate itself for chaining', () => {
      const result = mockMLDate.setHours(10, 20, 30, 40)
      expect(result).toBe(mockMLDate)
      expect([result.hours, result.minutes, result.seconds, result.miliseconds]).toEqual([10, 20, 30, 40])
    })

    it('should keep the other parts of the time if not given', () => {
      const date = initDate(2026, 6, 1, 5, 6, 7)
      date.setHours(9)
      expect([date.hours, date.minutes, date.seconds]).toEqual([9, 6, 7])
    })
  })

  describe('nextMonth', () => {
    it('should move to the next year from December', () => {
      const nextMonth = initDate(2026, 11, 15).nextMonth()
      expect([nextMonth.year, nextMonth.month, nextMonth.date]).toEqual([2027, 1, 1])
    })

    it('should not mutate the original date', () => {
      mockMLDate.nextMonth()
      expect(mockMLDate.month).toBe(7)
    })

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
    it('should move to the previous year from January', () => {
      const lastMonth = initDate(2026, 0, 15).lastMonth()
      expect([lastMonth.year, lastMonth.month, lastMonth.date]).toEqual([2025, 12, 1])
    })

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

    it.for([
      ['UTC', '2026-07-01 00:00'],
      ['Asia/Jakarta', '2026-07-01 07:00'],
      ['America/New_York', '2026-06-30 20:00']
    ])('should format the date based on the given timezone (%s)', ([timezone, expected]) => {
      expect(new MLDate(Date.UTC(2026, 6, 1)).format('yyyy-MM-dd HH:mm', timezone)).toBe(expected)
    })

    describe('GAS environment', () => {
      afterEach(() => {
        vi.unstubAllGlobals()
      })

      it('should use Utilities.formatDate if available', () => {
        const formatDate: Mock = vi.fn().mockReturnValue(value2)
        vi.stubGlobal('Utilities', { formatDate })
        expect(mockMLDate.format('dd MM yyyy', 'UTC')).toBe(value2)
        expect(formatDate).toHaveBeenCalledWith(mockMLDate, 'UTC', 'dd MM yyyy')
      })
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

  it('should return the current date if no parameter is given', () => {
    const date = initDate()
    expect(date).toBeInstanceOf(MLDate)
    expect(Math.abs(date.getTime() - Date.now())).toBeLessThan(1000)
  })

  it('should fill the missing parts of DateObject with today', () => {
    const today = new Date(),
      date = initDate({ month: 2, date: 10 })
    expect([date.year, date.month, date.date]).toEqual([today.getFullYear(), 2, 10])
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