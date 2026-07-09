/** Override fungsi2 bawaan Array */
import { Break, iterate } from './Iteration.ts'
import { sameWith } from './Comparison.ts'
import { isObject, MLObject } from './Object.ts'
import { And, Ascending, Descending, Or } from './Type.ts'
import { log } from './Dynamic.ts'
import { isString } from './String.ts'

export const isArray = Array.isArray
type MLArrayOptions = { flatting?: boolean, deleteNull?: boolean, unique?: boolean, withLog?: boolean }
export type callbackFunction<T, U> = (value: T, no: number, array: MLArray<T>) => U
export type OrderBy = typeof Ascending | typeof Descending
export type Logic = typeof And | typeof Or

export class MLArray<T> extends Array<T> {
  batchSize = 50000
  withLog = true

  // 1. Overload untuk tipe data Iterable (Array, Set, Map, dll.)
  static override from<T>(iterable: Iterable<T> | Array<T>): MLArray<T>

// 2. Overload untuk tipe data ArrayLike (Objek dengan properti .length, contoh: { length: 5 })
  static override from<T>(arrayLike: ArrayLike<T>): MLArray<T>

// 3. Overload untuk mendukung fungsi map bawaan JavaScript asli
  static override from<T, U>(arrayLike: ArrayLike<T> | Iterable<T>, mapfn: (v: T, k: number) => U, thisArg?: any): MLArray<U>

// 4. IMPLEMENTASI UTAMA: Gabungkan semua tipe di atas menggunakan union secara presisi
  static override from(arrayLikeOrIterable: any, mapfn?: any, thisArg?: any): MLArray<any> {
    // Gunakan 'as any' di internal return agar lolos dari strict check constructor kustom Anda
    return super.from(arrayLikeOrIterable, mapfn, thisArg) as any
  }


  static repeat<T>(valueOrFunction: T | ((value: T, no: number) => MLArray<T>), count = 1) {
    return super.from({ length: count }, typeof valueOrFunction === 'function' ? valueOrFunction as (value: T, no: number) => T : (_: T, __: number) => valueOrFunction)
  }

  static init<const T>(array: T | Array<T | {
    [s: string]: T
  }> = [], options: MLArrayOptions = {}): MLArray<T extends readonly any[] ? T[number] : T> {
    const { flatting = false, deleteNull = false, unique = false, withLog = true } = options
    let result  = this.from(lazyWrap(array)) as MLArray<T>
    if (flatting)
      result.lazyFlat()
    if (deleteNull)
      result.deleteNull()
    if (unique)
      result.unique()
    result.withLog = withLog
    return result as any
  }

  findIndexInOrder(valueOrFunc: callbackFunction<T, boolean | T>, order = 1) {
    const isFunction = typeof valueOrFunc === 'function'
    let currentOrder = 0, result
    this.iterate((value: T, no: number, array: MLArray<T>) => {
      if (isFunction ? valueOrFunc(value, no, array) : value === valueOrFunc) {
        currentOrder++
        if (currentOrder === order) {
          result = no
          return Break
        }
      }
    })
    return result
  }

  override map<U>(callbackFunc: callbackFunction<T, U>): MLArray<U>

  override map(callbackFunc: (arg0: any, arg1: any, arg2: any) => any, thisArg?: any): any

  // Jembatan Tipe untuk IntelliSense (IDE)
  override map<U>(callbackFn: callbackFunction<T, U>): MLArray<U> {
    return (super.map as any)(callbackFn) as unknown as MLArray<U>
  }

  mapToObject(callbackFn: (value: T, no: number, array: MLArray<T>) => unknown) {
    return (this.map as any)(callbackFn).toObject()
  }

  castToString() {
    return this.map(data => typeof data !== 'string' ? (data as any).toString() : data) as unknown as MLArray<string>
  }

  /**
   * Mengubah array yang ada di dalam MLArray biasa menjadi MLArray
   */
  mapCast(callbackFunc: callbackFunction<T, any>) {
    return this.map((data, no, array) => callbackFunc((isArray(data) ? initArray(data) : data) as any, no, array))
  }

  /**
   * Fungsi alternatif dari indexOf() dengan sistem one-based index
   */
  locationOf(value: T) {
    return super.indexOf(value) + 1
  }

  override slice(start: number, end: number | null): MLArray<T>

  override slice(start?: number, end?: number): T[]

  override slice(start: number, end: number | null = null): MLArray<T> | T[] {
    if (sameWith(0, start, end, { logic: Or, withLog: this.withLog }))
      throw Error('Start / end tidak boleh 0')
    if (start >= 1)
      start = start - 1
    return (end != null ? super.slice(start, end) : super.slice(start))
  }

  /**
   * Mengabungkan array dengan pemisah (default: 'dan') di akhir untuk keterbacaan
   */
  readableJoin(options: { and?: string; separator?: string; } = {}): string {
    switch (this.length) {
      case 0:
        return ''
      case 1:
        return String(this[0])
    }
    const { and = 'dan', separator = ', ' } = options
    return `${this.slice(1, -1).join(separator)} ${and} ${this.at(-1)}`
  }

  override push(...values: T[] | [{ many: boolean }]): MLArray<T>

  override push(...values: T[]): number

  override push(...values: T[] | [{ many: boolean }]): MLArray<T> | number {
    const { many = false } = getOptions(values),
      process = (value: T) => this.batch(values.length, (_, i) => super.push(...(values as T[]).slice(i, i + this.batchSize)))
    if (many)
      this.forEach((_, no) => values[no] && process(values[no] as T))
    else
      process(values.lazyFlat() as T)
    return this
  }

  override filter(predicate: callbackFunction<T, boolean>): MLArray<T>

  override filter(predicate: (arg0: any, arg1: any, arg2: any) => boolean): T[]

  override filter(predicate: callbackFunction<T, boolean>): MLArray<T> | T[] {
    let writeIndex = 0
    this.iterate((data: T, no: number) => {
      if (predicate(data, no, this))
        this[writeIndex++] = data
    })
    this.length = writeIndex
    return this
  }

  immutableFilter(predicate: callbackFunction<T, boolean>): MLArray<T> {
    return (super.filter as any)(predicate)
  }

  batch<U>(length: number, callbackFunction: callbackFunction<T, U>, from = 0) {
    iterate((i: number) => callbackFunction(this[i] as T, i, this), { until: length, addition: this.batchSize, from })
  }

  override lazyFlat(): MLArray<T>

  override lazyFlat(): Array<T>

  override lazyFlat(): MLArray<T> | Array<T> {
    if (this.some(isArray)) {
      const flattened = (this.flat(Infinity) as Array<T>).asMLArray() as MLArray<T>
      this.length = 0
      flattened.iterate((data: T, i: number) => this[i] = data)
    }
    return this
  }

  get(...at: number[]): T | MLArray<T | undefined> | undefined {
    const { defaultIndex = false } = getOptions(at),
      flattenAt = initArray(at, { flatting: true })

    const process = (index: number): undefined | T => index === 0
      ? undefined
      : index > 0
        ? this[index - +!defaultIndex]
        : this.at(index)
    return flattenAt.length > 2 ? flattenAt.map(process) : process(flattenAt[0] as number)
  }

  addAfter(at: number, ...data: T[]) {
    data = data.lazyFlat()
    this.batch(data.length, (_, i) => this.splice(at + i, 0, ...data.slice(i, i + this.batchSize)))
    return this
  }

  deleteNull(): MLArray<T> {
    return this.filter(data => !!data)
  }

  search(search: string | string[] | ((value: string) => boolean), options: {
    plus?: number
  } = {}): number[] | number[][] {
    const { plus = 0 } = options
    let rows: Array<Array<number>> = [], firstRow: number | null = null, currentRow: number = 0
    if (this.withLog) {
      log(`Function Name: getIndexes`)
      log(`Search Value: ${JSON.stringify(search)}`)
      log(`Values: ${this}`)
      log(`Index Plus: ${plus}`)
    }
    if (typeof search !== 'function')
      search = lazyWrap(search)
    this.iterate((data, index, array) => {
      let value = data
      if (typeof value === 'string')
        value = value.trim() as T
      const isSame = typeof search === 'function'
        ? search(value as string)
        : search.includes(value as string)
      if (isSame || firstRow != null)
        currentRow = plus + index
      if (firstRow != null && !isSame) {
        rows.push([firstRow, currentRow - 1])
        firstRow = null
      } else if (isSame && firstRow == null)
        firstRow = currentRow
    })
    if (firstRow) rows.push([firstRow, currentRow])
    return rows
  }

  getValueWhere(key: string, val: T) {
    return this.find(k => (k as Record<string, T>)[key] === val)
  }

  getValuesExcept(key: string, val: T) {
    return this.filter(k => (k as Record<string, T>)[key] !== val)
  }

  wrap(dimension = 1) {
    return MLArray.from(wrap(this, dimension))
  }

  wrapInside(dimension: number = 1) {
    return this.map(value => wrap(value, dimension))
  }

  /**
   * Pembersihan data duplikat di array
   */
  unique(): MLArray<T> {
    this.lazyFlat().deleteNull()
    const uniqueCollection = MLArray.init([...new Set(this)])
    this.length = 0
    uniqueCollection.iterate((data: T, no: number) => this[no] = data)
    return this
  }

  toParam() {
    let result: MLArray<MLArray<T>> = initArray([])
    for (let i = 0; i < (this[0] as Array<T>).length; i++)
      result[i] = this.map((content: MLArray<T>) => content[i])
    return result
  }

  /**
   * Extract 2d array by index
   */
  extract(...at: number[] | [{ useWrap?: number; isZeroBasedIndex?: boolean }]) {
    const { useWrap = 0, isZeroBasedIndex = false } = getOptions(at),
      /**
       * @param {MLArray} content
       * @param {number} at
       * @return {MLArray|*}
       */
      process = (content: MLArray<T>, at: number) => {
        const result = content.get(at + isZeroBasedIndex)
        return useWrap ? wrap(result, useWrap).asMLArray() : result
      },
      result = initArray(at as number[], { flatting: true }).mapCast(at => this.mapCast(content => process(content as MLArray<T>, at)))
    return result.length > 1 ? result : result[0]
  }

  override sort(orderBy?: OrderBy | ((a: T, b: T) => number)) {
    if (!orderBy)
      orderBy = Ascending
    return super.sort((a, b) => {
      if (orderBy === Descending)
        [a, b] = [b, a]
      if (typeof orderBy === 'function')
        return orderBy(a, b)
      if (initArray([a, b]).isTypeOf('number'))
        return (a as number) - (b as number)
      else
        return (a as string).localeCompare(b as string)
    })
  }

  toObject() {
    if (this.every(isArray))
      return MLObject.fromEntries(this as any) as MLObject<T>
    return MLObject.assign(this)
  }

  iterate(callbackFunc: callbackFunction<T, void>) {
    iterate(i => callbackFunc(this[i] as T, i, this), { from: 0, until: this.length, untilBefore: true })
  }

  sum() {
    let decimalNum = 0,
      numbers: MLArray<T> = this
    if (numbers.isTypeOf('string')) {
      decimalNum = this.map((val: string) => val.split('.')[1]?.length).unique()[0] ?? 0
      numbers = numbers.map((val: string) => val.replace('.', ''))
    }
    const result = numbers.reduce((total, num) => total + (typeof num === 'number' ? num : Number(num)), 0)
    return result / (10 ** decimalNum)
  }

  subtract(options: { positive?: boolean } = {}) {
    const { positive = true } = options,
      flattenedArr = this.lazyFlat()
    if (!flattenedArr.length) return 0
    const result = flattenedArr.reduce((total, num) => total - (typeof num === 'number' ? num : Number(num)), 0) + ((flattenedArr[0] as number) * 2)
    return positive ? Math.abs(result) : result
  }

  max() {
    return Math.max(...(this as MLArray<number>))
  }

  min() {
    return Math.min(...(this as MLArray<number>))
  }

  minMax() {
    return [this.min(), this.max()]
  }

  /**
   * Mengecek tipe data menggunakan "typeof" bawaan JavaScript untuk banyak variabel sekaligus
   */
  isTypeOf(type: ReturnType<typeof typeof_dummy>, options: { logic?: Logic } = {}) {
    const { logic = And } = options
    return logic === And
      ? this.every(val => type === 'string' ? isString(val) : typeof val === type)
      : this.some(val => type === 'string' ? isString(val) : typeof val === type)
  }
}

const typeof_dummy = () => typeof ''

Array.prototype.asMLArray = function () {
  return initArray(this)
}

Array.prototype.lazyFlat = function () {
  return flat(this)
}

export function initArray<const T>(array: Array<T | Record<string, T>> | T = [], options: MLArrayOptions = {}): MLArray<T extends readonly any[] ? T[number] : T> {
  return MLArray.init(array, options)
}

export function flat<T>(array: T[]): any[] {
  return array.some(isArray) ? array.flat(Infinity) : array
}

export function getOptions(array: any[]): Record<string, any> {
  return isObject(array.at(-1)) ? array.pop() : {}
}

type SwitchDimension<T, Dimension extends number> = {
  1: T[];
  2: T[][];
  3: T[][][];
  4: T[][][][];
  5: T[][][][][];
}[Dimension extends keyof 1 | 2 | 3 | 4 | 5 ? Dimension : never]

type NestedArray<T, Dimension extends number> =
  Dimension extends 1 | 2 | 3 | 4 | 5  ? SwitchDimension<T, Dimension> : any[]

export function wrap<T, Dimension extends number = 1>(value: T, dimension: Dimension = 1 as Dimension): NestedArray<T, Dimension> {
  iterate(() => value = [value] as T, { until: dimension })
  return value as any
}

export function lazyWrap<T>(value: T | T[]) {
  if (typeof value !== 'string' && !(value instanceof String) && isIterable(value)) return value as T[]
  return wrap(value) as T[]
}

export function isAllArray(...arg: any[]) {
  return arg.length > 1 ? arg.every(isArray) : isArray(arg[0])
}

export function isIterable(value: any) {
  return typeof value?.[Symbol.iterator] === 'function'
}