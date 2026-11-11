import { describe, expect, it, vi } from 'vitest'
import {
  Descending,
  flat,
  getOptions,
  initArray,
  isAllArray,
  isArray,
  isIterable,
  lazyWrap,
  MLArray,
  MLObject,
  Or,
  wrap
} from '../src'
import { value1, value2, value3 } from './Value.ts'

const quiet = { withLog: false }
/** Mengubah MLArray (termasuk yang bersarang) menjadi array native agar bisa dibandingkan dengan toEqual */
const plain = (value: unknown) => JSON.parse(JSON.stringify(value))

describe('MLArray', () => {
  describe('static', () => {
    describe('init', () => {
      it.for([
        [[1, 2, 3], [1, 2, 3]],
        [5, [5]],
        [value1, [value1]],
        [undefined, []]
      ])('should wrap the given value into an MLArray', ([param, expected]) => {
        const result = initArray(param as unknown[])
        expect(result).toBeInstanceOf(MLArray)
        expect([...result]).toEqual(expected)
      })

      it.for([
        [{ flatting: true }, [1, [2, [3]]], [1, 2, 3]],
        [{ deleteNull: true }, [1, null, 0, 2, undefined, ''], [1, 2]],
        [{ unique: true }, [1, 1, 2, [2, 3]], [1, 2, 3]]
      ])('should apply the given option %o', ([options, param, expected]) => {
        expect([...initArray(param as unknown[], options as object)]).toEqual(expected)
      })

      it('should store the withLog option', () => {
        expect(initArray([], quiet).withLog).toBe(false)
        expect(initArray([]).withLog).toBe(true)
      })
    })

    describe('from', () => {
      it('should return an MLArray from an iterable or array-like value', () => {
        expect(MLArray.from(new Set([1, 2]))).toBeInstanceOf(MLArray)
        expect([...MLArray.from({ length: 2 }, (_, i) => i)]).toEqual([0, 1])
      })
    })

    describe('repeat', () => {
      it('should repeat a value x times', () => {
        expect([...MLArray.repeat(value1, 3)]).toEqual([value1, value1, value1])
      })

      it('should fill the values based on the given function', () => {
        expect([...MLArray.repeat((_: unknown, no: number) => no * 2 as any, 3)]).toEqual([0, 2, 4])
      })
    })
  })

  describe('instance', () => {
    describe('findIndexInOrder', () => {
      it.for([
        [1, 1, 0],
        [1, 2, 2],
        [1, 3, 4],
        [9, 1, undefined]
      ])('should return the zero-based index of value %s at occurrence %s', ([value, order, expected]) => {
        expect(initArray<number>([1, 2, 1, 3, 1]).findIndexInOrder(value as any, order as number)).toBe(expected)
      })

      it('should accept a predicate function', () => {
        expect(initArray([1, 2, 1, 3, 1]).findIndexInOrder(value => value > 1, 2)).toBe(3)
      })
    })

    describe('map', () => {
      it('should return an MLArray', () => {
        const result = initArray([1, 2]).map(value => value * 2)
        expect(result).toBeInstanceOf(MLArray)
        expect([...result]).toEqual([2, 4])
      })
    })

    describe('mapToObject', () => {
      it('should map the values into entries then convert it into an MLObject', () => {
        const result = initArray([1, 2]).mapToObject(value => [`k${value}`, value])
        expect(result).toBeInstanceOf(MLObject)
        expect(result.object).toEqual({ k1: 1, k2: 2 })
      })
    })

    describe('castToString', () => {
      it('should convert all values to string', () => {
        expect([...initArray<any>([1, value1, true]).castToString()]).toEqual(['1', value1, 'true'])
      })
    })

    describe('mapCast', () => {
      it('should cast nested arrays into MLArray before passing them to the callback', () => {
        expect([...initArray<any>([[1, 2], [3]]).mapCast(value => value instanceof MLArray)]).toEqual([true, true])
      })
    })

    describe('locationOf', () => {
      it.for([
        [value1, 1],
        [value2, 2],
        [value3, 0]
      ])('should return the one-based index of %s', ([value, expected]) => {
        expect(initArray<string>([value1, value2]).locationOf(value as string)).toBe(expected)
      })
    })

    describe('slice', () => {
      it.for([
        [[2], [2, 3, 4]],
        [[2, 3], [2, 3]],
        [[-2], [3, 4]]
      ])('should slice with one-based start index %o', ([param, expected]) => {
        expect([...initArray([1, 2, 3, 4], quiet).slice(...(param as [number, number]))]).toEqual(expected)
      })

      it('should throw if start or end is 0', () => {
        expect(() => initArray([1, 2, 3], quiet).slice(0)).toThrow('Start / end tidak boleh 0')
        expect(() => initArray([1, 2, 3], quiet).slice(1, 0)).toThrow('Start / end tidak boleh 0')
      })
    })

    describe('readableJoin', () => {
      it.for([
        [[], {}, ''],
        [['a'], {}, 'a'],
        [['a', 'b', 'c'], {}, 'a, b dan c'],
        [['a', 'b', 'c'], { and: 'and', separator: ' / ' }, 'a / b and c']
      ])('should join %o readably', ([array, options, expected]) => {
        expect(initArray(array as string[], quiet).readableJoin(options as object)).toBe(expected)
      })
    })

    describe('push', () => {
      it('should behave like the native push and return the new length', () => {
        const array = initArray<any>([1])
        expect(array.push(2, [3])).toBe(3)
        expect([...array]).toEqual([1, 2, [3]])
      })
    })

    describe('flatPush', () => {
      it('should push values and return the MLArray itself for chaining', () => {
        const array = initArray<number>([1])
        const result = array.flatPush(2, 3)
        expect(result).toBe(array)
        expect([...array]).toEqual([1, 2, 3])
      })

      it('should flatten the nested values before pushing', () => {
        expect([...initArray<any>([1]).flatPush([2, [3]], 4)]).toEqual([1, 2, 3, 4])
      })
    })

    describe('filter', () => {
      it('should return a new MLArray and keep the original untouched (immutable)', () => {
        const array = initArray([1, 2, 3, 4])
        const result = array.filter(value => value % 2 === 0)
        expect(result).toBeInstanceOf(MLArray)
        expect(result).not.toBe(array)
        expect([...result]).toEqual([2, 4])
        expect([...array]).toEqual([1, 2, 3, 4])
      })
    })

    describe('change', () => {
      it('should filter in-place (mutable) and return the MLArray itself', () => {
        const array = initArray([1, 2, 3, 4])
        const result = array.change(value => value % 2 === 0)
        expect(result).toBe(array)
        expect([...array]).toEqual([2, 4])
      })
    })

    describe('batch', () => {
      it('should call the function per batch size', () => {
        const array = initArray([1, 2, 3, 4, 5])
        array.batchSize = 2
        const mock = vi.fn()
        array.batch(array.length, mock)
        expect(mock.mock.calls.map(([, i]) => i)).toEqual([0, 2, 4])
      })
    })

    describe('lazyFlat', () => {
      it('should flatten nested arrays in-place', () => {
        const array = initArray<any>([1, [2, [3]]])
        expect(array.lazyFlat()).toBe(array)
        expect([...array]).toEqual([1, 2, 3])
      })
    })

    describe('get', () => {
      it.for([
        [[1], 'a'],
        [[3], 'c'],
        [[-1], 'c'],
        [[0], undefined]
      ])('should return a value by one-based index %o', ([param, expected]) => {
        expect(initArray(['a', 'b', 'c']).get(...(param as number[]))).toBe(expected)
      })

      it.for([
        [[1, 3], ['a', 'c']],
        [[1, 2, 3], ['a', 'b', 'c']],
        [[[1, 2]], ['a', 'b']]
      ])('should return an MLArray if given many indexes %o', ([param, expected]) => {
        const result = initArray(['a', 'b', 'c']).get(...(param as number[]))
        expect(result).toBeInstanceOf(MLArray)
        expect([...(result as MLArray<string>)]).toEqual(expected)
      })

      it('should use zero-based index when defaultIndex is true', () => {
        expect(initArray(['a', 'b', 'c']).get(1, { defaultIndex: true } as any)).toBe('b')
      })
    })

    describe('addAfter', () => {
      it('should insert values after the given index', () => {
        expect([...initArray<number>([1, 4]).addAfter(1, 2, 3)]).toEqual([1, 2, 3, 4])
      })
    })

    describe('deleteNull', () => {
      it('should remove falsy values', () => {
        expect([...initArray([1, null, undefined, 2]).deleteNull()]).toEqual([1, 2])
      })
    })

    describe('search', () => {
      it.for([
        [['x', 'a', 'a', 'y', 'a'], 'a', {}, [[1, 2], [4, 4]]],
        [['x', 'a', 'a', 'y', 'a'], ['a'], { plus: 1 }, [[2, 3], [5, 5]]],
        [['a', 'a', 'x'], 'a', {}, [[0, 1]]],
        [['a', 'a'], 'a', {}, [[0, 1]]],
        [[' a ', 'b'], 'a', {}, [[0, 0]]],
        [['x', 'y'], 'a', {}, []]
      ])('should return ranges of consecutive matched indexes (%o, %o)', ([array, search, options, expected]) => {
        expect(initArray(array as string[], quiet).search(search as string, options as object)).toEqual(expected)
      })

      it('should accept a predicate function', () => {
        expect(initArray(['a', 'x', 'a'], quiet).search(value => value === 'a')).toEqual([[0, 0], [2, 2]])
      })
    })

    describe('getValueWhere / getValuesExcept', () => {
      const data = [{ id: 1, name: value1 }, { id: 2, name: value2 }]

      it('should find the first object which has the given key-value', () => {
        expect(initArray<any>(data).getValueWhere('id', 2)).toEqual(data[1])
      })

      it('should return objects except the ones which have the given key-value', () => {
        expect([...initArray<any>(data).getValuesExcept('id', 2)]).toEqual([data[0]])
      })
    })

    describe('wrap / wrapInside', () => {
      it('should wrap the whole array based on dimension', () => {
        expect(plain(initArray([1, 2]).wrap())).toEqual([[1, 2]])
        expect(plain(initArray([1, 2]).wrap(2))).toEqual([[[1, 2]]])
      })

      it('should wrap each value', () => {
        expect([...initArray([1, 2]).wrapInside()]).toEqual([[1], [2]])
      })
    })

    describe('unique', () => {
      it('should remove duplicates and falsy values in-place', () => {
        const array = initArray([1, 1, 2, null, 2, 3])
        expect(array.unique()).toBe(array)
        expect([...array]).toEqual([1, 2, 3])
      })
    })

    describe('toParam', () => {
      it('should transpose a 2d array', () => {
        expect(plain(initArray<any>([[1, 2], [3, 4], [5, 6]]).toParam())).toEqual([[1, 3, 5], [2, 4, 6]])
      })
    })

    describe('extract', () => {
      const array = () => initArray<any>([[1, 2], [3, 4]])

      it.for([
        [[1], [1, 3]],
        [[2], [2, 4]],
        [[1, 2], [[1, 3], [2, 4]]],
        [[0, { isZeroBasedIndex: true }], [1, 3]],
        [[2, { useWrap: 1 }], [[2], [4]]]
      ])('should extract the column(s) of a 2d array %o', ([param, expected]) => {
        expect(plain(array().extract(...(param as number[])))).toEqual(expected)
      })
    })

    describe('sort', () => {
      it.for([
        [[3, 1, 2], undefined, [1, 2, 3]],
        [[3, 1, 2], Descending, [3, 2, 1]],
        [['b', 'c', 'a'], undefined, ['a', 'b', 'c']],
        [['b', 'c', 'a'], Descending, ['c', 'b', 'a']]
      ])('should sort %o by %s', ([array, orderBy, expected]) => {
        expect([...initArray(array as any[]).sort(orderBy as any)]).toEqual(expected)
      })

      it('should accept a compare function', () => {
        expect([...initArray([3, 1, 2]).sort((a, b) => b - a)]).toEqual([3, 2, 1])
      })
    })

    describe('toObject', () => {
      it.for([
        [[['a', 1], ['b', 2]]],
        [[{ a: 1 }, { b: 2 }]]
      ])('should convert entries or array of objects into an MLObject', ([param]) => {
        const result = initArray<any>(param).toObject()
        expect(result).toBeInstanceOf(MLObject)
        expect(result.object).toEqual({ a: 1, b: 2 })
      })
    })

    describe('iterate', () => {
      it('should loop through each value with zero-based index', () => {
        const mock = vi.fn()
        initArray([value1, value2]).iterate(mock)
        expect(mock).toHaveBeenCalledTimes(2)
        expect(mock).toHaveBeenLastCalledWith(value2, 1, expect.any(MLArray))
      })

      it('should not call the function on an empty array', () => {
        const mock = vi.fn()
        initArray([]).iterate(mock)
        expect(mock).not.toHaveBeenCalled()
      })
    })

    describe('sum', () => {
      it.for([
        [[1, 2, 3], 6],
        [['1', '2'], 3],
        [['1.5', '2.5'], 4],
        [['0.1', '0.2'], 0.3],
        [['1.5', '2.25'], 3.75],
        [[], 0]
      ])('should sum %o', ([param, expected]) => {
        expect(initArray(param as any[]).sum()).toBe(expected)
      })
    })

    describe('subtract', () => {
      it.for([
        [[10, 3, 2], {}, 5],
        [[1, 3, 2], {}, 4],
        [[1, 3, 2], { positive: false }, -4],
        [[], {}, 0]
      ])('should subtract %o', ([array, options, expected]) => {
        expect(initArray(array as number[]).subtract(options as object)).toBe(expected)
      })
    })

    describe('max / min / minMax', () => {
      it('should return the max, min, and [min, max] value', () => {
        const array = initArray([1, 5, 3])
        expect(array.max()).toBe(5)
        expect(array.min()).toBe(1)
        expect(array.minMax()).toEqual([1, 5])
      })
    })

    describe('isTypeOf', () => {
      it.for([
        [[1, 2], 'number', {}, true],
        [[1, value1], 'string', {}, false],
        [[1, value1], 'string', { logic: Or }, true]
      ])('should check the type of all values %o', ([array, type, options, expected]) => {
        expect(initArray(array as any[]).isTypeOf(type as 'string', options as object)).toBe(expected)
      })
    })
  })
})

describe('Array.prototype', () => {
  it('asMLArray should convert a native array into MLArray', () => {
    expect([1, 2].asMLArray()).toBeInstanceOf(MLArray)
  })

  it('lazyFlat should flatten a native array', () => {
    expect([1, [2, [3]]].lazyFlat()).toEqual([1, 2, 3])
  })
})

describe('initArray', () => {
  it('should return MLArray type', () => {
    expect(initArray([])).toBeInstanceOf(MLArray)
  })
})

describe('flat', () => {
  it('should flatten deeply nested arrays and return the same array if there is no nested one', () => {
    const notNested = [1, 2]
    expect(flat([1, [2, [3]]])).toEqual([1, 2, 3])
    expect(flat(notNested)).toBe(notNested)
  })
})

describe('getOptions', () => {
  it('should pop the options object from the end of an array', () => {
    const array: any[] = [1, { logic: Or }]
    expect(getOptions(array)).toEqual({ logic: Or })
    expect(array).toEqual([1])
    expect(getOptions([1])).toEqual({})
  })
})

describe('wrap', () => {
  it.for([
    [1, 1, [1]],
    [1, 3, [[[1]]]],
    [1, 0, 1]
  ])('should wrap %o into %i dimension array', ([value, dimension, expected]) => {
    expect(wrap(value, dimension as number)).toEqual(expected)
  })
})

describe('lazyWrap', () => {
  it('should only wrap non-iterable values and strings', () => {
    const set = new Set([1])
    expect(lazyWrap(value1)).toEqual([value1])
    expect(lazyWrap(1)).toEqual([1])
    expect(lazyWrap([1])).toEqual([1])
    expect(lazyWrap(set)).toBe(set)
  })
})

describe('isArray / isAllArray', () => {
  it('should check whether all the given values are arrays', () => {
    expect(isArray([])).toBe(true)
    expect(isAllArray([1], [2])).toBe(true)
    expect(isAllArray([1])).toBe(true)
    expect(isAllArray([1], 2)).toBe(false)
    expect(isAllArray(1)).toBe(false)
  })
})

describe('isIterable', () => {
  it.for([
    [[], true],
    [value1, true],
    [new Map(), true],
    [1, false],
    [null, false],
    [{}, false]
  ])('should check whether %o is iterable', ([value, expected]) => {
    expect(isIterable(value)).toBe(expected)
  })
})
