import { initDate, isDate, type MLDate } from '../../Date.ts'
import { between } from '../../Comparison.ts'

/**
 * Converts a spreadsheet date serial number into an `MLDate`.
 */
export function toMLDate(value: number): MLDate {
  const date = initDate(Math.round((value - 25569) * 86400000))
  if (!isDate(date)) throw Error(`${value} is not a valid spreadsheet date number`)
  return date
}

/**
 * Checks whether a value is a valid year (1999 - 2099).
 */
export function isYear(value: any): boolean {
  value = Number(value)
  return !isNaN(value) && between(1999, value, 2099)
}