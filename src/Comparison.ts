import { And } from './Type'
import { isObject } from './Object.ts'
import { flat, getOptions, lazyWrap, type Logic, MLArray } from './Array.ts'
import { isString } from "./String.ts";
import { log } from './Dynamic.ts'

type CompareNumber = '<' | '<=' | '<=<' | '<<='
type CompareParam<T> = Array<T| { logic: Logic }>

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
 * Mengecek apakah 'value' ada di antara 'start' sampai 'until'
 * Mendukung komparasi: '<', '<=', '<=<', '<<='
 */
export function between(start: number, value: number | number[], until: number, compare: CompareNumber | CompareNumber[] = '<'): boolean {
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

export function lowerThan(value: number, ...comparations: CompareParam<number>) {
  const { logic = And } = getOptions(comparations),
    isLowerThan = (comparation: number) => value < comparation
  return logic === And
    ? flat(comparations as number[]).every(isLowerThan)
    : flat(comparations as number[]).some(isLowerThan)
}

/**
 * Mengecek tipe data menggunakan "typeof" bawaan JavaScript untuk banyak variabel sekaligus
 */
export function isTypeOf(type: string, ...array: CompareParam<any>): boolean {
  const { logic = And } = getOptions(array)
  array = array.lazyFlat()
  return logic === And
    ? array.every((val: any) => type === 'string' ? isString(val) : typeof val === type)
    : array.some((val: any) => type === 'string' ? isString(val) : typeof val === type)
}