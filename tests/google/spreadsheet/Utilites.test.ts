import { expect, it } from 'vitest'
import { isYear } from '../../../src'
import { value1 } from '../../Value'

it.for([
	[2005, true],
	['2009', true],
	['015', false],
	[192, false],
	[114798429, false],
	[value1, false]
])('should check year correctly', ([data, result]) => {
	expect(isYear(data)).toBe(result)
})