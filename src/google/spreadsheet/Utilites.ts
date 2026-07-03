import { initDate, isDate } from '../../Date.ts'
import { between } from '../../Comparison.ts'

/**
 * Convert tanggal dalam bentuk angka dari spreadsheet ke objek MLDate
 */
export function toMLDate(value: number) {
  const date = initDate(Math.round((value - 25569) * 86400000))
  if (!isDate(date)) throw Error(`${value} bukanlah angka tanggal yang valid`)
  return date
}

/**
 * Cek apakah nilai yang diberikan merupakan rentang tahun yang valid (1999 - 2099)
 */
export function isYear(value: any) {
  value = Number(value)
  return !isNaN(value) && between(1999, value, 2099)
}