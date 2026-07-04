import { initString } from './String.ts'
import { initArray } from './Array.ts'
import { isObject } from './Object.ts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { between } from './Comparison.ts'

const shortMonths = initArray([
    'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN',
    'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'
  ]),
  longMonths = initArray([
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ])

export class MLDate extends Date {
  constructor(...values: any[]) {
    super(...(values as [any, any?, any?]))
  }

  /** Getter & Setter */

  get date() {
    return super.getDate()
  }

  get lastDate() {
    return new Date(this.year, this.month - 1, 0).getDate()
  }

  get month(): number {
    return this.getMonth() + 1
  }

  get shortMonth() {
    return initString(shortMonths.get(this.month))
  }

  get longMonth() {
    return initString(longMonths.get(this.month))
  }

  get year() {
    return this.getFullYear()
  }

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

  lastMonth() {
    return new MLDate(this.getTime()).setDate(1).setMonth(this.getMonth() - 1)
  }

  nextMonth() {
    return new MLDate(this.getTime()).setDate(1).setMonth(this.getMonth() + 1)
  }

  format(format: string, timezone = 'Asia/Jakarta') {
    dayjs.extend(utc)
    dayjs.extend(tz)
    return dayjs(this)
      .tz(timezone)
      .format(format.replaceAll('y', 'Y').replaceAll('d', 'D'))
  }
}

type DateObject = { year?: number; month?: number | typeof longMonths[number]; date?: number }

export function initDate(...value: [number | string | Date | MLDate | DateObject]) {
  switch (true) {
    case isObject(value[0]):
      const today = new MLDate(),
        { date = today.date, month = today.month, year = today.year } = value[0] as DateObject
      return new MLDate(year, +(typeof month === 'string' ? longMonths.indexOf(month) : month) - 1, date)
    case !!value.length:
      return new MLDate(...value)
    default:
      return new MLDate()
  }
}

/**
 * Cek apakah string / objek Date adalah tanggal yang valid
 */
export function isDate(value: string | Date) {
  if (value instanceof Date) return !isNaN(value.getTime())
  if (typeof value !== 'string' || /^[a-zA-Z]+[-_]\d+/.test(value)) return false
  const date = new Date(value)
  return !isNaN(date.getTime()) && between(1999, date.getFullYear(), 2099)
}