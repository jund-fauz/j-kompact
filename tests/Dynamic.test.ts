import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { log } from '../src/Dynamic.ts'
import { value1, value2, value3 } from './Value.ts'
import { initObject } from '../src/Object.ts'

describe('log', () => {
  describe('non-GAS environment', () => {
    beforeEach(() => {
      vi.stubGlobal('Logger', undefined)
      vi.spyOn(console, 'log').mockImplementation(() => {
      })
    })
    afterEach(() => {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    })

    it('should run the vanilla js console.log', () => {
      log(value2)
      expect(console.log).toHaveBeenCalledOnce()
      expect(console.log).toHaveBeenCalledWith(value2)
    })
  })

  describe('GAS environment', () => {
    let mockLogger: { log: Mock }
    beforeEach(() => {
      mockLogger = { log: vi.fn() }
      vi.stubGlobal('Logger', mockLogger)
    })
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should stringify and log a concatted message by given params', () => {
      const mockMLObject = initObject({ value2 })
      log(value2, { value3 }, mockMLObject)
      expect(mockLogger.log).toHaveBeenCalledOnce()
      expect(mockLogger.log).toHaveBeenCalledWith(`${value2} ${JSON.stringify({ value3 })} ${JSON.stringify({ value2 })}`)
    })
  })
})