/** Extended Array class and array helpers. */
import { Break, iterate } from './Iteration.ts'
import { sameWith } from './Comparison.ts'
import { isObject, MLObject } from './Object.ts'
import { And, Ascending, Descending, Or } from './Type.ts'
import { log } from './Dynamic.ts'
import { isString } from './String.ts'

/**
 * Checks whether a value is an array (alias of `Array.isArray`).
 */
export const isArray = Array.isArray
type MLArrayOptions = { flatting?: boolean, deleteNull?: boolean, unique?: boolean, withLog?: boolean }
/**
 * Callback for `MLArray` methods: receives the value, its index, and the array.
 */
export type callbackFunction<T, U> = (value: T, no: number, array: MLArray<T>) => U
/**
 * Sort direction for `MLArray.sort`: `Ascending` or `Descending`.
 */
export type OrderBy = typeof Ascending | typeof Descending
/**
 * Logic for comparing many values: `And` (all of them) or `Or` (any of them).
 */
export type Logic = typeof And | typeof Or

/**
 * An `Array` subclass with one-based index helpers (handy for spreadsheet data)
 * and chainable in-place operations (`change`, `unique`, `lazyFlat`, `flatPush`, ...).
 * Create an instance with `initArray`.
 *
 * @example
 * ```ts
 * const list = initArray([3, 1, 2])
 * list.get(1)   // 3
 * list.sort()   // MLArray [1, 2, 3]
 * ```
 */
export class MLArray<T> extends Array<T> {
    batchSize = 50000
    withLog = true

    // 1. Overload for iterables (Array, Set, Map, etc.)
    static override from<T>(iterable: Iterable<T> | Array<T>): MLArray<T>

    // 2. Overload for array-likes (objects with a .length property, e.g. { length: 5 })
    static override from<T>(arrayLike: ArrayLike<T>): MLArray<T>

    // 3. Overload that supports the native map function
    static override from<T, U>(arrayLike: ArrayLike<T> | Iterable<T>, mapfn: (v: T, k: number) => U, thisArg?: any): MLArray<U>

    // 4. Implementation: covers every overload above
    static override from(arrayLikeOrIterable: any, mapfn?: any, thisArg?: any): MLArray<any> {
        // 'as any' lets the return value pass the strict check of the custom constructor
        return super.from(arrayLikeOrIterable, mapfn, thisArg) as any
    }


    static repeat<T>(valueOrFunction: T | ((value: T, no: number) => MLArray<T>), count = 1): MLArray<T> {
        return super.from({ length: count }, typeof valueOrFunction === 'function' ? valueOrFunction as (value: T, no: number) => T : (_: T, __: number) => valueOrFunction) as MLArray<T>
    }

    static init<const T>(array: T | Array<T | {
        [s: string]: T
    }> = [], options: MLArrayOptions = {}): MLArray<T extends readonly any[] ? T[number] : T> {
        const { flatting = false, deleteNull = false, unique = false, withLog = true } = options
        let result = this.from(lazyWrap(array)) as MLArray<T>
        if (flatting)
            result.lazyFlat()
        if (deleteNull)
            result.deleteNull()
        if (unique)
            result.unique()
        result.withLog = withLog
        return result as any
    }

    findIndexInOrder(valueOrFunc: callbackFunction<T, boolean | T>, order = 1): number | undefined {
        const isFunction = typeof valueOrFunc === 'function'
        let currentOrder = 0, result: number | undefined
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

    // Type bridge for IntelliSense (IDE)
    override map<U>(callbackFn: callbackFunction<T, U>): MLArray<U> {
        return (super.map as any)(callbackFn) as unknown as MLArray<U>
    }

    mapToObject(callbackFn: (value: T, no: number, array: MLArray<T>) => unknown): MLObject<any> {
        return (this.map as any)(callbackFn).toObject()
    }

    castToString(): MLArray<string> {
        return this.map(data => typeof data !== 'string' ? (data as any).toString() : data) as unknown as MLArray<string>
    }

    /**
     * Maps the values, casting nested plain arrays into `MLArray` before passing them to the callback.
     */
    mapCast(callbackFunc: callbackFunction<T, any>): MLArray<any> {
        return this.map((data, no, array) => callbackFunc((isArray(data) ? initArray(data) : data) as any, no, array))
    }

    /**
     * One-based alternative to `indexOf()`. Returns `0` if the value is not found.
     */
    locationOf(value: T): number {
        return super.indexOf(value) + 1
    }

    override slice(start: number, end: number | null): MLArray<T>

    override slice(start?: number, end?: number): T[]

    override slice(start: number, end: number | null = null): MLArray<T> | T[] {
        if (sameWith(0, start, end, { logic: Or, withLog: this.withLog }))
            throw Error('Start / end must not be 0')
        if (start >= 1)
            start = start - 1
        return (end != null ? super.slice(start, end) : super.slice(start))
    }

    /**
     * Joins the values into a readable list, with a conjunction (default: `'dan'`) before the last item.
     */
    readableJoin(options: { and?: string; separator?: string; } = {}): string {
        switch (this.length) {
            case 0:
                return ''
            case 1:
                return String(this[0])
        }
        const { and = 'dan', separator = ', ' } = options
        if (this.length === 2)
            return `${this[0]} ${and} ${this[1]}`
        return `${this.slice(1, -1).join(separator)}${separator}${and} ${this.at(-1)}`
    }

    flatPush(...values: T[] | [{ many: boolean }]): MLArray<T> {
        const { many = false } = getOptions(values),
            process = (items: T[]) => this.batch(items.length, (_, i) => super.push(...items.slice(i, i + this.batchSize)))
        if (many)
            this.forEach((_, no) => values[no] && process(values as T[]))
        else
            process(values.lazyFlat() as T[])
        return this
    }

    override filter(predicate: callbackFunction<T, boolean>): MLArray<T>

    override filter(predicate: (arg0: any, arg1: any, arg2: any) => boolean): T[]

    override filter(predicate: callbackFunction<T, boolean>): MLArray<T> | T[] {
        return super.filter(predicate as (value: T, index: number, array: T[]) => boolean)
    }

    change(predicate: callbackFunction<T, boolean>): MLArray<T> {
        let writeIndex = 0
        this.iterate((data: T, no: number) => {
            if (predicate(data, no, this))
                this[writeIndex++] = data
        })
        this.length = writeIndex
        return this
    }

    batch<U>(length: number, callbackFunction: callbackFunction<T, U>, from = 0) {
        iterate((i: number) => callbackFunction(this[i] as T, i, this), {
            until: length,
            addition: this.batchSize,
            from
        })
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
        return flattenAt.length > 1 ? flattenAt.map(process) : process(flattenAt[0] as number)
    }

    addAfter(at: number, ...data: T[]): this {
        data = data.lazyFlat()
        this.batch(data.length, (_, i) => this.splice(at + i, 0, ...data.slice(i, i + this.batchSize)))
        return this
    }

    deleteNull(): MLArray<T> {
        return this.change(data => !!data)
    }

    search(search: string | string[] | ((value: string) => boolean), options: {
        plus?: number
    } = {}): number[] | number[][] {
        const { plus = 0 } = options
        let rows: Array<Array<number>> = [], firstRow: number | null = null, currentRow: number = 0
        if (this.withLog) {
            log(`Function Name: search`)
            log(`Search Value: ${JSON.stringify(search)}`)
            log(`Values: ${this}`)
            log(`Index Plus: ${plus}`)
        }
        if (typeof search !== 'function')
            search = lazyWrap(search)
        this.iterate((data, index) => {
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
        if (firstRow != null) rows.push([firstRow, currentRow])
        return rows
    }

    getValueWhere(key: string, val: T): T | undefined {
        return this.find(k => (k as Record<string, T>)[key] === val)
    }

    getValuesExcept(key: string, val: T): MLArray<T> {
        return this.change(k => (k as Record<string, T>)[key] !== val)
    }

    wrap(dimension = 1): MLArray<any> {
        return MLArray.from(wrap(this, dimension))
    }

    wrapInside(dimension: number = 1): MLArray<any[]> {
        return this.map(value => wrap(value, dimension))
    }

    /**
     * Removes duplicates (and falsy values) in-place.
     */
    unique(): MLArray<T> {
        this.lazyFlat().deleteNull()
        const uniqueCollection = MLArray.init([...new Set(this)])
        this.length = 0
        uniqueCollection.iterate((data: T, no: number) => this[no] = data)
        return this
    }

    toParam(): MLArray<MLArray<T>> {
        let result: MLArray<MLArray<T>> = initArray([])
        for (let i = 0; i < (this[0] as Array<T>).length; i++)
            result[i] = this.map((content: MLArray<T>) => content[i])
        return result
    }

    /**
     * Extracts column(s) of a 2D array by one-based index.
     */
    extract(...at: number[] | [{ useWrap?: number; isZeroBasedIndex?: boolean }]): any {
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

    override sort(orderBy?: OrderBy | ((a: T, b: T) => number)): this {
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

    toObject(): MLObject<unknown> {
        if (this.every(isArray))
            return MLObject.fromEntries(this as any) as MLObject<T>
        return MLObject.assign(this as unknown as MLArray<Record<string, unknown>>)
    }

    iterate(callbackFunc: callbackFunction<T, void>) {
        iterate(i => callbackFunc(this[i] as T, i, this), { from: 0, until: this.length, untilBefore: true })
    }

    sum(): number {
        if (this.isTypeOf('string')) {
            // Sum as integers to avoid floating point errors (0.1 + 0.2)
            const strings = this as unknown as MLArray<string>,
                scale = 10 ** Math.max(0, ...strings.map(val => String(val).split('.')[1]?.length ?? 0))
            return strings.reduce((total, val) => total + Math.round(Number(val) * scale), 0) / scale
        }
        return this.reduce((total, num) => total + Number(num), 0)
    }

    subtract(options: { positive?: boolean } = {}): number {
        const { positive = true } = options,
            flattenedArr = this.lazyFlat()
        if (!flattenedArr.length) return 0
        const result = flattenedArr.reduce((total, num) => total - (typeof num === 'number' ? num : Number(num)), 0) + ((flattenedArr[0] as number) * 2)
        return positive ? Math.abs(result) : result
    }

    max(): number {
        return Math.max(...(this as MLArray<number>))
    }

    min(): number {
        return Math.min(...(this as MLArray<number>))
    }

    minMax(): number[] {
        return [this.min(), this.max()]
    }

    /**
     * Checks the `typeof` of all values at once, using `And` (default) or `Or` logic.
     */
    isTypeOf(type: ReturnType<typeof typeof_dummy>, options: { logic?: Logic } = {}): boolean {
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

/**
 * Creates an `MLArray` from an array or a single value.
 *
 * @param array The array, or a value to wrap into an array.
 * @param options `flatting`, `deleteNull`, `unique`, and `withLog` (default `true`).
 */
export function initArray<const T>(array: Array<T | Record<string, T>> | T = [], options: MLArrayOptions = {}): MLArray<T extends readonly any[] ? T[number] : T> {
    return MLArray.init(array, options) as MLArray<T extends readonly any[] ? T[number] : T>
}

/**
 * Flattens nested arrays of any depth. Returns the same array if nothing is nested.
 */
export function flat<T>(array: T[]): any[] {
    return array.some(isArray) ? array.flat(Infinity) : array
}

/**
 * Takes (and removes) the options object from the last element of an array. Returns `{}` if there is none.
 */
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
    Dimension extends 1 | 2 | 3 | 4 | 5 ? SwitchDimension<T, Dimension> : any[]

/**
 * Wraps a value in `dimension` levels of arrays.
 *
 * @example
 * ```ts
 * wrap(1, 3) // [[[1]]]
 * ```
 */
export function wrap<T, Dimension extends number = 1>(value: T, dimension: Dimension = 1 as Dimension): NestedArray<T, Dimension> {
    iterate(() => value = [value] as T, { until: dimension })
    return value as any
}

/**
 * Wraps a value into an array only if it is not iterable yet (strings are always wrapped).
 */
export function lazyWrap<T>(value: T | T[]): T[] {
    if (typeof value !== 'string' && !(value instanceof String) && isIterable(value)) return value as T[]
    return wrap(value) as T[]
}

/**
 * Checks whether all the given values are arrays.
 */
export function isAllArray(...arg: any[]): boolean {
    return arg.length > 1 ? arg.every(isArray) : isArray(arg[0])
}

/**
 * Checks whether a value is iterable (has `Symbol.iterator`).
 */
export function isIterable(value: any): boolean {
    return typeof value?.[Symbol.iterator] === 'function'
}