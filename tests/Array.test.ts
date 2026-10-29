import { expect, it } from 'vitest'
import { initArray, MLArray } from '../src'

/** TODO: Need adjustment */
it('should return MLArray type', () => {
	expect(initArray([])).toBeInstanceOf(MLArray)
})