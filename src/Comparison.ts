import { And } from './Type.ts'
import { isObject } from './Object.ts'
import { flat, getOptions, lazyWrap, type Logic, MLArray } from './Array.ts'
import { isString } from "./String.ts";
import { log } from './Dynamic.ts'

type CompareNumber = '<' | '<=' | '<=<' | '<<='
type CompareParam<T> = Array<T| { logic: Logic }>

/**
 * Checks whether all values are strictly equal (no different value).
 */
export function isSame(...arr: any[]): boolean {
  return new Set(flat(arr)).size === 1
}

/**
 * Checks whether `value` equals the other values, using `And` (default) or `Or` logic.
 * Objects are compared key by key.
 */
export function sameWith<T>(value: T, ...arr: T[] | [{ withLog?: boolean, logic?: Logic }]): boolean {
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

/**
 * Checks whether `value` differs from all the other values.
 */
export function notSameWith(value: any, ...arr: any): boolean {
  return !flat(arr).includes(value)
}

/**
 * Checks whether `value` is between `start` and `until`.
 * Supported comparisons: '<', '<=', '<=<', '<<='
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

/**
 * Checks whether `value` is lower than the other values, using `And` (default) or `Or` logic.
 */
export function lowerThan(value: number, ...comparations: CompareParam<number>): boolean {
  const { logic = And } = getOptions(comparations),
    isLowerThan = (comparation: number) => value < comparation
  return logic === And
    ? flat(comparations as number[]).every(isLowerThan)
    : flat(comparations as number[]).some(isLowerThan)
}

/**
 * Checks the `typeof` of many values at once, using `And` (default) or `Or` logic.
 */
export function isTypeOf(type: string, ...array: CompareParam<any>): boolean {
  const { logic = And } = getOptions(array)
  array = array.lazyFlat()
  return logic === And
    ? array.every((val: any) => type === 'string' ? isString(val) : typeof val === type)
    : array.some((val: any) => type === 'string' ? isString(val) : typeof val === type)
}