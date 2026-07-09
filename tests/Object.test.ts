import { beforeEach, describe, expect, it, vi } from 'vitest'
import { value1, value2, value3 } from './Value'
import { initObject, isEmpty, isObject, MLObject, parse, toJSObject } from '../src/Object.ts'
import { initArray, MLArray } from '../src/Array.ts'
import { log } from '../src/Dynamic.ts'
import { initString } from '../src/String.ts'
import { mlArray, mlObject } from '../src/Type.ts'

describe('MLObject', () => {
  describe('static', () => {
    describe('fromEntries', () => {
      it('should return an MLObject based on array entries parameter', () => {
        expect(MLObject.fromEntries([['value1', value1], ['value2', value2]])).toEqual(initObject({ value1, value2 }))
      })
    })

    describe('assign', () => {
      it('should return an MLObject based on array of object parameter', () => {
        expect(MLObject.assign(initArray([{ value1 }, { value2 }]) as any)).toEqual(initObject({ value1, value2 }))
      })
    })
  })

  describe('instance', () => {
    let mockMlObject: MLObject<any>
    beforeEach(() => {
      mockMlObject = initObject({ value2, value1 })
    })

    describe('reverse', () => {
      it('should reverse keys and values', () => {
        expect(mockMlObject.reverse()).toEqual(initObject({ [value2]: 'value2', [value1]: 'value1' }))
      })
    })

    describe('reEntries', () => {
      it('should make a new MLObject based on the given function', () => {
        expect(mockMlObject.reEntries((_, value) => [value, value])).toEqual(initObject({
          [value2]: value2,
          [value1]: value1
        }))

        expect(mockMlObject.reEntries((key, value) => [key, initArray(value)])).toEqual(initObject({
          value2: initArray(value2),
          value1: initArray(value1)
        }))

        expect(mockMlObject.reEntries((key, value) => [key, initObject({ value }).object])).toEqual(initObject({
          value2: { value: value2 },
          value1: { value: value1 }
        }))
      })
    })

    describe('forEach', () => {
      it('should run looping for each key-value pair on the object', () => {
        const mockLog = vi.fn()
        mockMlObject.forEach((key, value) => mockLog('Key:', key, '\nValue:', value))
        expect(mockLog).toHaveBeenCalledTimes(2)
        expect(mockLog).toHaveBeenLastCalledWith('Key:', 'value1', '\nValue:', value1)
      })
    })

    describe('map', () => {
      it('should return MLArray of values based on the given function', () => {
        expect(mockMlObject.map((_, value) => value)).toEqual(initArray([value2, value1]))
      })
    })

    describe('filter', () => {
      it('should filtering the object based on given condition', () => {
        expect(mockMlObject.filter((_, value) => value === value2)).toEqual(initObject({ value2 }))
      })
    })

    describe('get', () => {
      it('should return a value if given only one key', () => {
        expect(mockMlObject.get('value2')).toBe(value2)
      })

      it('should return an MLArray of values if given many keys', () => {
        expect(mockMlObject.get('value1', 'value2')).toEqual(initArray([value1, value2]))
        expect(mockMlObject.get('value2', 'value3', 'value1')).toEqual(initArray([value2, undefined, value1]))
      })

      it('should return an MLArray of values without null or undefined if configured', () => {
        expect(mockMlObject.get('value2', 'value3', 'value1', { isDeleteNull: true })).toEqual(initArray([value2, value1]))
      })
    })

    describe('getKeyByValue', () => {
      it.for([
        [value2, initString('value2')],
        [[value1, value2], initArray(['value1', 'value2']).map(value => initString(value))]
      ])('should return key(s) based on the given value(s)', ([param, expected]) => {
        expect(mockMlObject.getKeyByValue(param)).toEqual(expected)
      })
    })

    describe('delete', () => {
      it.for([
        ['value1', initObject({ value2 })],
        [['value2', 'value1'], initObject()]
      ])('should delete specific key-value pair based on the given key(s)', ([param, expected]) => {
        expect(mockMlObject.delete(param as string)).toEqual(expected)
      })
    })

    describe('set', () => {
      it.for([
        [['value1', value2], { value1: value2, value2 }],
        [[['value2', 'value1'], [value1, value2]], { value1: value2, value2: value1 }],
        [[{ value1: value2, value3 }], { value2, value1: value2, value3 }]
      ])('should change the object based on parameter input', ([param, expected]) => {
        expect(mockMlObject.set(...(param as [any]))).toEqual(initObject(expected as Record<string, string>))
      })
    })

    describe('convertValueAs', () => {
      it.for([
        [initObject({ value1, value2 }), mlArray, { value1: initArray(value1), value2: initArray(value2) }],
        [initObject({ value1: { value1 }, value2: { value2 } }), mlObject, initObject({
          value1: initObject({ value1 }),
          value2: initObject({ value2 })
        })]
      ])('should convert based on the given type', ([object, type, expected]) => {
        expect((object as MLObject<any>).convertValueAs(type as typeof mlObject || typeof mlArray)).toEqual(initObject(expected as Record<string, string>))
      })
    })
  })
})

describe('initObject', () => {
  it('should initialize an MLObject correctly based on input', () => {
    const emptyMlObject = initObject()
    expect(emptyMlObject).toBeInstanceOf(MLObject)
    expect(emptyMlObject.object).toEqual({})
    expect(emptyMlObject.entries).toEqual(initArray())

    const mlObject = initObject({ value2, value1 })
    expect(mlObject).toBeInstanceOf(MLObject)
    expect(mlObject.object).toEqual({ value2, value1 })
    expect(mlObject.entries).toEqual(initArray([['value2', value2], ['value1', value1]]))
    expect(mlObject.keys).toEqual(initArray(['value2', 'value1']))
    expect(mlObject.values).toEqual(initArray([value2, value1]))
  })
})

describe('isObject', () => {
  it.for([
    { value2 },
    initObject({ value2 })
  ])('should return true if the given parameter is a plain object or an instance of MLObject', (param) => {
    expect(isObject(param)).toBe(true)
  })

  it.for([
    [value2],
    new Date()
  ])('should return false if the given is not one of: a plain object nor an instance of ML Object', (param) => {
    expect(isObject(param)).toBe(false)
  })
})

describe('isEmpty', () => {
  it('should return true if an object is empty', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('should return false if an object is not empty', () => {
    expect(isEmpty({ value2 })).toBe(false)
  })
})

describe('parse', () => {
  it.for([
    `{ "value2": "${value2}", "value1": "${value1}" }`,
    [['value2', value2], ['value1', value1]],
    [{ value2 }, { value1 }]
  ])('should return an object according to the given parameter', (param) => {
    expect(parse(param as any)).toEqual({ value2, value1 })
  })
})

describe('toJSObject', () => {
  it.for([
    [[initObject({ value2 }), initObject({ value1 })], [{ value2 }, { value1 }]],
    [initObject({ value2 }), { value2 }],
    [{ value2 }, { value2 }]
  ])('should convert an MLObject and an Array of MLObject to plain object', ([param, expected]) => {
    expect(toJSObject(param)).toEqual(expected)
  })
})