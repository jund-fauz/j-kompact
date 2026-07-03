import { And, Logic } from './Type'
import { isObject } from './Object.ts'
import { flat, getOptions, lazyWrap, MLArray } from './Array.ts'
import { isString } from "./String.ts";
import { log } from './Dynamic.ts'

export function isSame(...arr: any[]) {
  return new Set(flat(arr)).size === 1
}

export function sameWith<T>(value: T, ...arr: T[] | [{ withLog?: boolean, logic?: Logic }]) {
  const { withLog = true, logic = And } = getOptions(arr),
    flattenArr = arr.lazyFlat() as T[]
  if (withLog) {
    log(`Value: ${JSON.stringify(value)}`)
    log(`Compare With: ${JSON.stringify(flattenArr)}`)
  }
  const compare = (val: T) =>
    isObject(value) && isObject(val)
      ? Object.keys(val as Object).every(key => (val as any)[key] === (value as any)[key])
      : val === value
  return logic === And
    ? flattenArr.every(compare)
    : flattenArr.some(compare)
}

export function notSameWith(value: any, ...arr: any) {
  return !flat(arr).includes(value)
}

/**
 * Membandingkan 3 value dengan prinsip "Between And"
 */
export function between(start: number, value: number | number[], until: number, compare: string | string[] = '<'): boolean {
  [start, until] = [start ?? 0, until ?? 0]
  let values = lazyWrap(value).map((value?: number) => value ?? 0)
  const compares = lazyWrap(compare)
  if (values.length !== compare.length && values.length === 1)
    values = MLArray.repeat(values[0], compare.length) as number[]
  return compares.every((compare: string, no: number) => {
    const number = values[no] as number
    switch (compare) {
      case '<':
        return (start < number) && (number < until)
      case '<=':
        return (start <= number) && (number <= until)
      case '<=<':
        return (start <= number) && (number < until)
      case '<<=':
        return (start < number) && (number <= until)
    }
  })
}

export function lowerThan(value: number, ...comparations: number[]) {
  const { logic = And } = getOptions(comparations),
    isLowerThan = (comparation: number) => value < comparation
  return logic === And
    ? flat(comparations).every(isLowerThan)
    : flat(comparations).some(isLowerThan)
}

/**
 * Mengecek tipe data menggunakan "typeof" bawaan JavaScript untuk banyak variabel sekaligus
 */
export function isTypeOf(type: string, ...array: any): boolean {
  const { logic = And } = getOptions(array)
  array = array.lazyFlat()
  return logic === And
    ? array.every((val: any) => type === 'string' ? isString(val) : typeof val === type)
    : array.some((val: any) => type === 'string' ? isString(val) : typeof val === type)
}

/**
 * @deprecated Use native '!!' JavaScript mark instead
 */
export function isTruthy(...array: any[] | [{ logic: Logic }]) {
  const { logic = And } = getOptions(array)
  array = array.lazyFlat()
  return logic === And
    ? array.filter(data => data).length === array.length
    : array.some(data => data)
}

/**
 * @deprecated Use native '!!' JavaScript mark instead
 */
export function isFalsy(...array: any[] | [{ logic: Logic }]) {
  const { logic = And } = getOptions(array)
  array = array.lazyFlat()
  return logic === And
    ? array.filter(data => !data).length === array.length
    : array.some(data => !data)
}