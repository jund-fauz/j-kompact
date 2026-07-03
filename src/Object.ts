import { getOptions, initArray, isAllArray, isArray, type MLArray } from './Array.ts'
import { initString } from './String.ts'
import { mlArray, mlObject } from './Type.ts'

type mlObjectCallbackFunction<T, U> = (key: string, value: T) => U
type CustomMLClass = typeof mlObject | typeof mlArray

/**
 *  ML: MASTER LIBRARY
 */
export class MLObject<T> {
  [key: string]: any

  object: Record<string, T> = {}
  entriesVersion: MLArray<Array<string | T>> | undefined
  keysVersion: MLArray<string> = initArray()
  valuesVersion: MLArray<T> = initArray()

  static fromEntries<T>(entries: Iterable<readonly [PropertyKey, any]>) {
    return new this(Object.fromEntries(entries))
  }

  static assign<T>(values: MLArray<T>): MLObject<T> {
    const result = {}
    values.iterate((data: T) => Object.assign(result, data))
    return new this(result)
  }

  constructor(object: Record<string, T>) {
    this.add(object)
  }

  /**
   * Membalikkan { key: value } di Object menjadi { value: key }
   */
  reverse() {
    return this.reEntries((key: string, value: T) => [value, key])
  }

  entries() {
    if (!this.entriesVersion)
      this.entriesVersion = initArray(Object.entries(this.object)) as MLArray<[string, T]>
    return this.entriesVersion
  }

  reEntries<U>(callbackFunc: mlObjectCallbackFunction<T, U>): MLObject<U> {
    return MLObject.fromEntries(this.map(callbackFunc) as [string, T][]) as MLObject<U>
  }

  forEach<U>(func: mlObjectCallbackFunction<T, U>) {
    this.entries().forEach(([key, value]) => func(key as string, value as T))
  }

  map<U>(func: mlObjectCallbackFunction<T, U>) {
    return this.entries().map(([key, value]) => func(key as string, value as T))
  }

  filter(func: mlObjectCallbackFunction<T, boolean>) {
    return MLObject.fromEntries(this.entries().immutableFilter(([key, value]: any) => func(key, value)) as MLArray<[string, T]>)
  }

  /**
   * Mendapatkan nilai berdasarkan key (bisa banyak) dari suatu object
   */
  get(...keys: string[] | [{ isDeleteNull: boolean }]) {
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

  keys() {
    if (!this.keysVersion?.length)
      this.keysVersion = initArray(Object.keys(this.object))
    return this.keysVersion
  }

  values() {
    if (!this.valuesVersion.length)
      this.valuesVersion = initArray(Object.values(this.object))
    return this.valuesVersion
  }

  getKeyByValue(...values: T[]) {
    values = values.lazyFlat()
    const result = this.filter((key, value) => values.includes(value)).map(key => initString(key))
    return result.length > 1 ? result : result[0]
  }

  delete(...keys: string[]) {
    initArray(keys, { flatting: true })
      .iterate((key: string) => {
        delete this.object[key]
        delete this[key]
      })
    return this.reset()
  }

  reset() {
    this.entriesVersion = undefined
    this.keysVersion = initArray()
    this.valuesVersion = initArray()
    return this
  }

  set(keys: string | string[] | MLArray<string> | MLObject<T>, values: T | T[] | MLArray<T> | null = null) {
    if (keys instanceof MLObject)
      keys.forEach((key, value) => this.object[key] = this[key] = value)
    else {
      const [keysWrapped, valuesWrapped] = [initArray(keys), initArray(values)]
      keysWrapped.iterate((data: string, no: number) => this.object[data] = this[data] = valuesWrapped[no] as T)
    }
    return this.reset()
  }

  convertValueAs(type: CustomMLClass) {
    switch (type) {
      case mlArray:
        return this.reEntries((key, value) => [key, initArray(value)])
    }
  }

  add(otherObject: Record<string, T> | MLObject<T>) {
    if (otherObject instanceof MLObject)
      otherObject = otherObject.object
    this.object = otherObject
    this.reset()
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
  return values.every(value => value && (typeof value === 'object' || value instanceof MLObject) && !isArray(value))
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
 * Melakukan konversi MLObject ke Object native JavaScrit
 */
export function toJSObject(value: any): Object {
  if (isArray(value)) return value.map(toJSObject)
  if (value instanceof MLObject) return value.object
  return value
}