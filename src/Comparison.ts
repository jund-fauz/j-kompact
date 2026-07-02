import { And, Logic } from './Type'
import { isObject } from './Object.ts'
import { flat, getOptions } from './Array.ts'

export function isSame(...arr: any[]) {
    return new Set(flat(arr)).size === 1
}

export function sameWith<T>(value: T, ...arr: T[]) {
    const { withLog = true, logic = And } = (
        isObject(arr.at(-1)) &&
        ('withLog' in arr.at(-1) || 'logic' in arr.at(-1))
    ) ? getOptions(arr) : {}
    arr = arr.lazyFlat()
    if (withLog) {
        console.log(`Value: ${JSON.stringify(value)}`)
        console.log(`Compare With: ${JSON.stringify(arr)}`)
    }
    const compare = val =>
        isObject(value) && isObject(val)
            ? Object.keys(val).every(key => val[key] === value[key])
            : val === value
    return logic === And
        ? arr.every(compare)
        : arr.some(compare)
}

/**
 * @param {any} value
 * @param {any} arr
 * @return {boolean}
 */
export function notSameWith(value, ...arr) {
    return !flat(arr).includes(value)
}

/**
 * Membandingkan 3 value dengan prinsip "Between And"
 * @param {number} start
 * @param {number|number[]} value
 * @param {number} until
 * @param {string|string[]} compare
 * @return {boolean}
 */
export function between(start, value, until, compare = '<') {
    [start, value, until] = [start ?? 0, lazyWrap(value).map(value => value ?? 0), until ?? 0]
    compare = lazyWrap(compare)
    if (value.length !== compare.length && value.length === 1)
        value = repeat(value[0], compare.length)
    return compare.every((compare, no) => {
        switch (compare) {
            case '<':
                return (start < value[no]) && (value[no] < until)
            case '<=':
                return (start <= value[no]) && (value[no] <= until)
            case '<=<':
                return (start <= value[no]) && (value[no] < until)
            case '<<=':
                return (start < value[no]) && (value[no] <= until)
        }
    })
}

/**
 * @param {number} value
 * @param {number} comparations
 */
export function lowerThan(value, ...comparations) {
    const { logic = And } = getOptions(comparations),
        isLowerThan = comparation => value < comparation
    return logic === And
        ? flat(comparations).every(isLowerThan)
        : flat(comparations).some(isLowerThan)
}

/**
 * Mengecek tipe data menggunakan "typeof" bawaan JavaScript untuk banyak variabel sekaligus
 * @param {string} type
 * @param {any} array
 * @return {boolean}
 */
export function isTypeOf(type, ...array) {
    const { logic = And } = getOptions(array)
    array = array.lazyFlat()
    return logic === And
        ? array.every(val => type === 'string' ? isString(val) : typeof val === type)
        : array.some(val => type === 'string' ? isString(val) : typeof val === type)
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