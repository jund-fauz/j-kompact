/** Override fungsi2 bawaan Array */
import { Break, iterate } from './Iteration.ts'
import { sameWith } from './Comparison.ts'
import { isObject } from './Object.ts'

export const isArray = Array.isArray
type MLArrayOptions = { flatting?: boolean, deleteNull?: boolean, unique?: boolean, withLog?: boolean }
export type callbackFunction<T, U> = (value: T, no: number, array: MLArray<T>) => U

export class MLArray<T> extends Array<T> {
    batchSize: number | undefined
    withLog: boolean | undefined

    static override from<T>(iterable: Iterable<T> | Array<T>): MLArray<T> {
        return super.from(iterable) as unknown as MLArray<T>
    }

    static init<T>(array: T | Array<T | { [s: string]: T }> | Set<T> = [], options: MLArrayOptions = {}): MLArray<T> {
        const { flatting = false, deleteNull = false, unique = false, withLog = false } = options
        let result: MLArray<T> = this.from(lazyWrap(array))
        result.batchSize = 50000
        if (flatting)
            result.lazyFlat()
        if (deleteNull)
            result.deleteNull()
        if (unique)
            result.unique()
        result.withLog = withLog
        return result
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

    // /**
    //  * Jembatan Tipe untuk IntelliSense (IDE)
    //  * @template T
    //  * @template U
    //  * @param {function(T, number, MLArray<T>): U} callbackFn
    //  * @param {any} [thisArg]
    //  * @return {MLArray<U>}
    //  */
    // map(callbackFn, thisArg) {
    //     return super.map(callbackFn, thisArg)
    // }

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
        return this.map((data, no, array) => callbackFunc(isArray(data) ? this.constructor.init(data) : data, no, array))
    }

    override slice(start: number, end: number | null): MLArray<T>

    override slice(start?: number, end?: number): T[]

    override slice(start: number, end: number | null = null): MLArray<T> | T[] {
        if (sameWith(0, start, end, { logic: Or, withLog: !!this.withLog }))
            throw Error('Start / end tidak boleh 0')
        if (start >= 1)
            start = start - 1
        return (end != null ? super.slice(start, end) : super.slice(start)) as unknown as MLArray<T>
    }

    readableJoin(options: { and?: string, separator?: string } = {}) {
        switch (this.length) {
            case 0:
                return ''
            case 1:
                return String(this[0])
        }
        const { and = 'dan', separator = ', ' } = options
        return `${this.slice(1, -1).join(separator)} ${and} ${this.at(-1)}`
    }

    /**
     * @param {T|{many: boolean}} values
     * @return {MLArray}
     */
    push(...values) {
        const { many = false } = getOptions(values),
            process = values => this.batch(values.length, i => super.push(...values.slice(i, i + this.batchSize)))
        if (many)
            this.forEach((_, no) => values[no] && process(values[no]))
        else
            process(values.lazyFlat())
        return this
    }

    /**
     * @param {function(T, number, MLArray): boolean} predicate
     * @return {MLArray<T>}
     */
    filter(predicate) {
        let writeIndex = 0
        this.iterate((data, index) => {
            if (predicate(data, index, this))
                this[writeIndex++] = data
        })
        this.length = writeIndex
        return this
    }

    /**
     * @param {function(T, number, MLArray<T>): boolean} predicate
     * @return {MLArray<T>}
     */
    immutableFilter(predicate) {
        return super.filter(predicate)
    }

    /**
     * @param {number} length
     * @param callbackFunction
     * @param from
     */
    batch(length, callbackFunction, from = 0) {
        iterate(i => callbackFunction(i), { until: length, addition: this.batchSize, from })
    }

    /**
     * @return {MLArray}
     */
    lazyFlat() {
        if (this.some(isArray)) {
            const flattened = this.flat(Infinity)
            this.length = 0
            flattened.iterate((data, i) => this[i] = data)
        }
        return this
    }

    /**
     * @param {number|string|{defaultIndex: boolean}} at
     * @return {T|T[]}
     */
    get(...at) {
        const { defaultIndex = false } = getOptions(at)
        at = at.lazyFlat()
        /**
         * @param {number} index
         * @return {undefined|*}
         */
        const process = index => index === 0
            ? undefined
            : index > 0
                ? this[index - !defaultIndex]
                : this.at(index)
        return at.length > 2 ? at.map(process) : process(at[0])
    }

    /**
     * @param {number} at 1-based index
     * @param {T} data
     */
    addAfter(at, ...data) {
        data = data.lazyFlat()
        this.batch(data.length, i => this.splice(at + i, 0, ...data.slice(i, i + this.batchSize)))
        return this
    }

    /**
     * @return {MLArray<T>}
     */
    deleteNull() {
        return this.filter(data => data)
    }

    /**
     * @param {any} search
     * @param {{plus?: number, withLog?: boolean}} options
     * @return {number[]|number[][]}
     */
    search(search, options = {}) {
        const { plus = 0 } = options
        let rows = [], firstRow = null, currentRow = null
        if (this.withLog) {
            console.log(`Function Name: getIndexes`)
            console.log(`Search Value: ${JSON.stringify(search)}`)
            console.log(`Values: ${this}`)
            console.log(`Index Plus: ${plus}`)
        }
        if (typeof search !== 'function')
            search = lazyWrap(search)
        this.iterate((data, index) => {
            let value = data
            if (typeof value === 'string')
                value = value.trim()
            const isSame = typeof search === 'function'
                ? search(value)
                : search.includes(value)
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

    /**
     * @param {string} key
     * @param {T} val
     */
    getValueWhere(key, val) {
        return this.find(k => k[key] === val)
    }

    /**
     * @param {string} key
     * @param {T} val
     */
    getValuesExcept(key, val) {
        return this.filter(k => k[key] !== val)
    }

    /**
     * @param {number} dimension
     */
    wrapInside(dimension = 1) {
        return this.map(value => wrap(value, dimension))
    }

    /**
     * Pembersihan data duplikat di array
     * @return {MLArray<T>}
     */
    unique() {
        this.lazyFlat().deleteNull()
        const uniqueCollection = MLArray.init([...new Set(this)])
        this.length = 0
        uniqueCollection.iterate((data, i) => this[i] = data)
        return this
    }

    /**
     * @return {MLArray<T>}
     */
    toParam() {
        let result = this.constructor.init([])
        for (let i = 0; i < this[0].length; i++)
            result[i] = this.map(content => content[i])
        return result
    }

    /**
     * Extract 2d array by index
     * @param {number|{useWrap?: number, isZeroBasedIndex?: boolean}} at
     */
    extract(...at) {
        const { useWrap = 0, isZeroBasedIndex = false } = getOptions(at),
            /**
             * @param {MLArray} content
             * @param {number} at
             * @return {MLArray|*}
             */
            process = (content, at) => {
                const result = content.get(at + isZeroBasedIndex)
                return useWrap ? wrap(result, useWrap).asMLArray() : result
            }
        const result = this.constructor.init(at).lazyFlat().mapCast(at => this.mapCast(content => process(content, at)))
        return result.length > 1 ? result : result[0]
    }

    /**
     * @param {Ascending|Descending|string} orderBy
     */
    sort(orderBy = Ascending) {
        return super.sort((a, b) => {
            if (orderBy === Descending)
                [a, b] = [b, a]
            if (isTypeOf('number', a, b))
                return a - b
            else
                return a.localeCompare(b)
        })
    }

    /**
     * @return {MLObject<T>}
     */
    toObject() {
        if (this.every(isArray))
            return MLObject.fromEntries(this)
        return MLObject.assign(this)
    }

    /**
     * @param {function(T, number, MLArray<T>)} callbackFunc
     */
    iterate(callbackFunc) {
        iterate(i => callbackFunc(this[i], i, this), { from: 0, until: this.length, untilBefore: true })
    }

    /**
     * @return {number}
     */
    sum() {
        let decimalNum = 0,
            numbers = this
        if (numbers.isTypeOf('string')) {
            decimalNum = this.map(val => val.split('.')[1]?.length).unique()[0] ?? 0
            numbers = numbers.map(val => val.replace('.', ''))
        }
        const result = numbers.reduce((total, num) => total + (typeof num === 'number' ? num : Number(num)), 0)
        return result / (10 ** decimalNum)
    }

    max() {
        return Math.max(...this)
    }

    min() {
        return Math.min(...this)
    }

    minMax() {
        return [this.min(), this.max()]
    }

    /**
     * Mengecek tipe data menggunakan "typeof" bawaan JavaScript untuk banyak variabel sekaligus
     * @param {string} type
     * @param {{logic?: And|Or|string}} options
     * @return {boolean}
     */
    isTypeOf(type, options = {}) {
        const { logic = And } = options
        return logic === And
            ? this.every(val => type === 'string' ? isString(val) : typeof val === type)
            : this.some(val => type === 'string' ? isString(val) : typeof val === type)
    }
}

Array.prototype.asMLArray = function () {
    return initArray(this)
}

Array.prototype.lazyFlat = function () {
    return flat(this)
}

/**
 * @template T
 * @param {Array<T|Object<string, T>>|Set<T>|T} array
 * @param {MLArrayOptions} options
 * @return {MLArray<T>}
 */
export function initArray(array = [], options = {}) {
    return MLArray.init(array, options)
}

/**
 * @template T
 * @param {T} valueOrFunction
 * @param {number} count
 * @return {T[]}
 */
export function repeat(valueOrFunction, count = 1) {
    return Array.from({ length: count }, typeof valueOrFunction === 'function' ? valueOrFunction : () => valueOrFunction)
}

/**
 * @template T
 * @param {T[]} array
 * @return {any[]}
 */
export function flat(array) {
    return array.some(isArray) ? array.flat(Infinity) : array
}

/**
 * Pembersihan data duplikat di sebuah array
 * @template T
 * @param {T[]} array
 * @return {T[]}
 */
export function unique(...array) {
    array = array.lazyFlat().filter(data => data)
    return [...new Set(array)]
}

/**
 * @param {any[]} array
 * @return {Object}
 */
export function getOptions(array) {
    return isObject(array.at(-1)) ? array.pop() : {}
}

/**
 * @template T
 * @param {T} value
 * @param {number} dimension
 * @return {Array<T>}
 */
export function wrap(value, dimension = 1) {
    iterate(() => value = [value], { until: dimension })
    return value
}

/**
 * @template T
 * @param {T|T[]} value
 * @return {T[]}
 */
export function lazyWrap(value) {
    if (typeof value !== 'string' && !(value instanceof String) && isIterable(value)) return value
    return wrap(value)
}

/**
 * @param {any} arg
 * @return {boolean}
 */
export function isAllArray(...arg) {
    return arg.length > 1 ? arg.every(isArray) : isArray(arg[0])
}

export function isIterable(value) {
    return typeof value?.[Symbol.iterator] === 'function'
}