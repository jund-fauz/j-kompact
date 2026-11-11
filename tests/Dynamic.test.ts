import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { log, initObject, wait } from '../src'
import { value1, value2, value3 } from './Value.ts'

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

    it('should run the vanilla js console.formatDate', () => {
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

    it('should stringify and formatDate a concatted message by given params', () => {
      const mockMLObject = initObject({ value2 })
      log(value2, { value3 }, mockMLObject)
      expect(mockLogger.log).toHaveBeenCalledOnce()
      expect(mockLogger.log).toHaveBeenCalledWith(`${value2} ${JSON.stringify({ value3 })} ${JSON.stringify({ value2 })}`)
    })
  })
})

describe('wait', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should block for the given seconds (non-GAS environment)', () => {
    vi.stubGlobal('Utilities', undefined)
    const start = Date.now()
    wait(0.2)
    expect(Date.now() - start).toBeGreaterThanOrEqual(190)
  })

  it('should use Utilities.sleep in milliseconds (GAS environment)', () => {
    const sleep = vi.fn()
    vi.stubGlobal('Utilities', { sleep })
    wait(2)
    expect(sleep).toHaveBeenCalledWith(2000)
  })
})