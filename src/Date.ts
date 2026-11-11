import { initString, type MLString } from './String.ts'
import { initArray, type MLArray } from './Array.ts'
import { isObject } from './Object.ts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import tz from 'dayjs/plugin/timezone.js'

declare var Utilities: any

type ShortMonth = 'JAN' | 'FEB' | 'MAR' | 'APR' | 'MEI' | 'JUN' | 'JUL' | 'AGS' | 'SEP' | 'OKT' | 'NOV' | 'DES'
type LongMonth = 'JANUARI' | 'FEBRUARI' | 'MARET' | 'APRIL' | 'MEI' | 'JUNI' | 'JULI' | 'AGUSTUS' | 'SEPTEMBER' | 'OKTOBER' | 'NOVEMBER' | 'DESEMBER'

const shortMonths: MLArray<ShortMonth> = initArray([
    'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN',
    'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'
  ]),
  longMonths: MLArray<LongMonth> = initArray([
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ])

/**
 * A `Date` subclass with easier getters/setters (one-based month, Indonesian month
 * names), chainable methods, and a timezone-aware `format`.
 * Create an instance with `initDate`.
 */
export class MLDate extends Date {
  constructor(...values: number[] | [string | Date | MLDate | DateObject]) {
    super(...(values as [any, any?, any?]))
  }

  /** Getter */

  get miliseconds(): number {
    return super.getMilliseconds()
  }

  get seconds(): number {
    return super.getSeconds()
  }

  get minutes(): number {
    return super.getMinutes()
  }

  get hours(): number {
    return super.getHours()
  }

  get date(): number {
    return super.getDate()
  }

  get lastDate(): number {
    return new Date(this.year, this.month, 0).getDate()
  }

  get month(): number {
    return this.getMonth() + 1
  }

  get shortMonth(): MLString {
    return initString(shortMonths.get(this.month))
  }

  get longMonth(): MLString {
    return initString(longMonths.get(this.month))
  }

  get year(): number {
    return this.getFullYear()
  }

  /** Setter */

  set date(date: number) {
    super.setDate(date)
  }

  set month(month: number | string) {
    let param: number
    if (typeof month === 'string')
      param = month.length === 3
        ? shortMonths.locationOf(month as typeof shortMonths[number])
        : longMonths.locationOf(month as typeof longMonths[number])
    else
      param = month
    super.setMonth(param - 1)
  }

  set year(year: number) {
    super.setFullYear(year)
  }

  /** Override */

  override setHours(hours: number, min?: number, sec?: number, ms?: number): MLDate

  override setHours(hours: number, min?: number, sec?: number, ms?: number): number

  override setHours(hours: number, min?: number, sec?: number, ms?: number): MLDate | number {
    const parameters = [hours, min, sec, ms].filter(value => value !== undefined) as [number]
    super.setHours(...parameters)
    return this
  }

  override setDate(date: number): MLDate

  override setDate(date: number): number

  override setDate(date: number): MLDate | number {
    this.date = date
    return this
  }

  override setMonth(month: number | string): MLDate

  override setMonth(month: number, date?: number): number

  override setMonth(month: number | string): MLDate | number {
    this.month = month
    return this
  }

  lastMonth(): MLDate {
    return new MLDate(this.getTime()).setDate(1).setMonth(this.month - 1)
  }

  nextMonth(): MLDate {
    return new MLDate(this.getTime()).setDate(1).setMonth(this.month + 1)
  }

  format(format: string, timezone = 'Asia/Jakarta'): string {
    if (typeof Utilities !== 'undefined' && typeof Utilities.formatDate === 'function')
      return Utilities.formatDate(this, timezone, format)
    dayjs.extend(utc)
    dayjs.extend(tz)
    return dayjs(this)
      .tz(timezone)
      .format(format.replaceAll('y', 'Y').replaceAll('d', 'D'))
  }
}

/**
 * Date object for `initDate`. Missing parts are filled from today.
 */
export type DateObject = { year?: number, month?: number | typeof longMonths[number] | typeof shortMonths[number], date?: number }

/**
 * Creates an `MLDate` from `new Date(...)` arguments, a `Date` / `MLDate`, or a `DateObject`.
 *
 * @example
 * ```ts
 * initDate({ year: 2026, month: 'JULI', date: 1 })
 * initDate(2026, 6, 1)
 * ```
 */
export function initDate(...value: number[] | [string | Date | MLDate | DateObject]): MLDate {
  switch (true) {
    case isObject(value[0]):
      const today = new MLDate(),
        { date = today.date, month = today.month, year = today.year } = value[0] as DateObject
      return new MLDate(
        year,
        +(typeof month === 'string'
          ? month.length === 3
            ? shortMonths.indexOf(month as typeof shortMonths[number])
            : longMonths.indexOf(month as typeof longMonths[number])
          : (month - 1)),
        date
      )
    case !!value.length:
      return new MLDate(...value)
    case value[0] instanceof MLDate:
        return value[0]
    case value[0] instanceof Date:
        return new MLDate(value[0])
    default:
      return new MLDate()
  }
}

/**
 * Checks whether a string or `Date` object is a valid date.
 */
export function isDate(value: any): boolean {
  if (value instanceof Date) return !isNaN(value.getTime())
  if (typeof value !== 'string' || /^[a-zA-Z]+[-_]\d+/.test(value)) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}