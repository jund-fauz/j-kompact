import { expect, it } from 'vitest'
import { initArray, MLArray } from '../src'

it('should return MLArray type', () => {
	expect(initArray([])).toBeInstanceOf(MLArray)
})