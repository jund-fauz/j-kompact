import { expect, it } from 'vitest'
import { value1 } from './Value.ts'
import { initString, MLString } from '../src'

it('should return MLString', () => {
	expect(initString(value1)).toBeInstanceOf(MLString)
})