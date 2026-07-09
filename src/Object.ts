import { getOptions, initArray, isAllArray, isArray, type MLArray } from './Array.ts'
import { initString, MLString } from './String.ts'
import { mlArray, mlObject } from './Type.ts'
import { log } from './Dynamic.ts'

type mlObjectCallbackFunction<T, U> = (key: string, value: T) => U
type CustomMLClass = typeof mlObject | typeof mlArray

/**
 *  ML: MASTER LIBRARY
 */
export class MLObject<T> {
  [key: string]: any

  object: Record<string, T> = {}
  #entriesVersion: MLArray<Array<string | T>> | undefined
  #keysVersion: MLArray<string> = initArray()
  #valuesVersion: MLArray<T> = initArray()
  #reversedObject: Record<string, string> | undefined

  static fromEntries<T>(entries: Iterable<readonly [PropertyKey, any]>) {
    return new this(Object.fromEntries(entries))
  }

  static assign<T>(values: MLArray<Record<string, T>>): MLObject<T> {
    const result = {}
    values.iterate((data: Record<string, T>) => Object.assign(result, data))
    return new this(result)
  }

  constructor(object: Record<string, T>) {
    this.add(object)
  }

  get entries() {
    if (!this.#entriesVersion)
      this.#entriesVersion = initArray(Object.entries(this.object)) as MLArray<[string, T]>
    return this.#entriesVersion
  }

  get keys() {
    if (!this.#keysVersion?.length)
      this.#keysVersion = initArray(Object.keys(this.object))
    return this.#keysVersion
  }

  get values() {
    if (!this.#valuesVersion.length)
      this.#valuesVersion = initArray(Object.values(this.object))
    return this.#valuesVersion
  }

  /**
   * Membalikkan { key: value } di Object menjadi { value: key }
   */
  reverse() {
    if (!this.#reversedObject)
      this.#reversedObject = this.reEntries((key: string, value: T) => [value, key])
    return this.#reversedObject
  }

  reEntries<U>(callbackFunc: mlObjectCallbackFunction<T, U>): MLObject<U> {
    return MLObject.fromEntries(this.map(callbackFunc) as [string, T][]) as MLObject<U>
  }

  forEach<U>(func: mlObjectCallbackFunction<T, U>) {
    this.entries.forEach(([key, value]) => func(key as string, value as T))
  }

  map<U>(func: mlObjectCallbackFunction<T, U>) {
    return this.entries.map(([key, value]) => func(key as string, value as T))
  }

  filter(func: mlObjectCallbackFunction<T, boolean>) {
    return MLObject.fromEntries(this.entries.immutableFilter(([key, value]: any) => func(key, value)) as MLArray<[string, T]>)
  }

  /**
   * Mendapatkan nilai berdasarkan key (bisa banyak) dari suatu object
   */
  get(...keys: string[] | [...string[], { isDeleteNull: boolean }] | [string[], { isDeleteNull: boolean }]) {
    const { isDeleteNull = false } = getOptions(keys),
      mLArrayKeys = initArray(keys as string[], { flatting: true }),
      process = (key: string) => this[key] as T
    if (mLArrayKeys.length > 1) {
      const result = mLArrayKeys.map(process) as unknown as MLArray<T>
      return isDeleteNull
        ? result.deleteNull()
        : result
    }
    return process(mLArrayKeys[0]!)
  }

  getKeyByValue(...values: T[]) {
    const mlArrayValues = initArray(values, { flatting: true }),
      result = mlArrayValues.map(value => {
        let result: MLString | string | undefined = this.reverse()[value as string]
        if (typeof result === 'string')
          result = initString(result)
        return result
      })
    return result.length > 1 ? result : result[0]
  }

  delete(...keys: string[]) {
    initArray(keys, { flatting: true })
      .iterate((key: string) => {
        delete this.object[key]
        delete this[key]
      })
    return this.#reset()
  }

  #reset() {
    this.#entriesVersion = undefined
    this.#keysVersion = initArray()
    this.#valuesVersion = initArray()
    return this
  }

  set(keys: string | string[] | MLArray<string> | MLObject<T>, values: T | T[] | MLArray<T> | null = null) {
    if (isObject(keys))
      initObject(keys as Record<string, T>).forEach((key, value) => this.object[key] = this[key] = value)
    else {
      const [keysWrapped, valuesWrapped] = [initArray(keys), initArray(values)]
      keysWrapped.iterate((data, no) => this.object[data as string] = this[data as string] = valuesWrapped[no] as T)
    }
    return this.#reset()
  }

  convertValueAs(type: CustomMLClass) {
    switch (type) {
      case mlArray:
        return this.reEntries((key, value) => [key, initArray(value)])
      case mlObject:
        return this.reEntries((key, value) => [key, initObject(value as Record<string, T>)])
      default:
        log(`Tipe ${type} tidak valid`)
        return this
    }
  }

  add(otherObject: Record<string, T> | MLObject<T>) {
    if (otherObject instanceof MLObject)
      otherObject = otherObject.object
    this.object = otherObject
    this.#reset()
    this.forEach((key, value) => {
      if (!(key in this))
        this[key] = value
    })
  }
}

export function initObject<T>(object: Record<string, T> = {}) {
  return new MLObject(object) as MLObject<T>
}

/**
 * Cek apakah sebuah nilai merupakan objek plain / MLObject, bukan array dan bukan null
 */
export function isObject(...values: any[]) {
  return values.every(value => value && (value.constructor.toString().startsWith('function Object()') || value instanceof MLObject) && !isArray(value))
}

/**
 * Cek apakah sebuah objek kosong atau tidak
 */
export function isEmpty<T>(object: Record<string, T>) {
  return !(!!Object.keys(object).length)
}

/**
 * Parsing dari tipe data apapun ke dalam bentuk Object
 */
export function parse<T>(param: Record<string, T>[] | Iterable<readonly [PropertyKey, any]> | string): Record<string, T> {
  if (typeof param === 'string')
    return JSON.parse(param)
  if (isAllArray(...param))
    return Object.fromEntries(param as Iterable<readonly [PropertyKey, any]>)
  return Object.assign({}, ...param)
}

/**
 * Melakukan konversi MLObject ke Object native JavaScript
 */
export function toJSObject(value: any): Object {
  if (isArray(value)) return value.map(toJSObject)
  if (value instanceof MLObject) return value.object
  return value
}