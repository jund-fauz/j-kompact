import { log, wait } from './Dynamic.ts'

/**
 * Return this from an `iterate` / `MLArray.iterate` callback to stop the loop.
 */
export const Break = 'BREAK'

/**
 * A configurable `for` loop with a `forEach`-like callback.
 */
export function iterate<T>(func: (no: number) => void | T, options: {
  from?: number,
  until?: number,
  untilBefore?: boolean,
  addition?: number,
  withReturnValue?: boolean
} = {}): (void | T)[] | undefined {
  let { from = 1, until = 1, withReturnValue } = options
  if (from > until && until === 1)
    until = from
  const { untilBefore = false, addition = 1 } = options,
    end = until - +untilBefore,
    result: (void | T)[] = []
  for (let i = from; i <= end; i += addition) {
    const returned = func(i)
    if (returned === Break)
      break
    // If not configured, return values are collected when the first iteration returns a value
    if (withReturnValue === undefined)
      withReturnValue = returned !== undefined
    if (withReturnValue)
      result.push(returned)
  }
  if (withReturnValue)
    return result
}

/**
 * Calls a function and retries it when it fails, e.g. for API calls.
 * The number of attempts and the delay between them are configurable.
 */
export function retry<T>(func: () => void | T, options: {
  attempts?: number,
  waitingInSec?: number,
  withReturnValue?: boolean,
  fallback?: any
} = {}): void | T[] | any {
  const { attempts = 3, waitingInSec = 2, withReturnValue = false, fallback = null } = options
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      if (withReturnValue)
        return func()
      else
        func()
    } catch (e: any) {
      if (attempt === attempts) {
        if (typeof fallback === 'function')
          if (withReturnValue)
            return fallback()
          else
            fallback()
        else if (withReturnValue)
          return fallback
        throw e
      }
      log(`Retry ${attempt}/${attempts}: ${e.message}`)
      wait(attempt * waitingInSec)
    }
  }
}