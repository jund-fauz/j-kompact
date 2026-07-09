import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { templateLogError } from '../src/Error.ts'
import { internalServerErrorMessage } from './Value.ts'
import * as Dynamic from '../src/Dynamic.ts'

describe('templateLogError', () => {
  let logSpy: Mock
  beforeEach(() => {
    logSpy = vi.spyOn(Dynamic, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockClear()
  })

  it('should formatDate an error correctly', () => {
    const functionName = 'errorLogtest',
      mockError = new Error(internalServerErrorMessage)
    mockError.stack = 'Oi Oi OI at Line Oi'
    expect(() => templateLogError(mockError, functionName)).toThrow(internalServerErrorMessage)
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy).toHaveBeenCalledWith(`${`Function: ${functionName}\n`}Error: ${mockError.message}\n${mockError.stack}`)
  })

  it('should add prefix message to the formatDate if provided', () => {
    const functionName = 'errorLogtest',
      mockError = new Error(internalServerErrorMessage)
    mockError.stack = 'Oi Oi OI at Line Oi'
    expect(() => templateLogError(mockError, functionName, { prefixMessage: 'WOY' })).toThrow(internalServerErrorMessage)
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy).toHaveBeenCalledWith(`WOY\nFunction: ${functionName}\nError: ${mockError.message}\n${mockError.stack}`)
  })
})