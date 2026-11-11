/**
 * Functions that behave according to the runtime environment.
 * Supports Node.js / Bun / Deno and Google Apps Script.
 */

import { isObject, MLObject } from './Object.ts'
import { toString } from './String.ts'

declare var Logger: any
declare var Utilities: any

/**
 * Logs with `Logger.log` in Google Apps Script, or `console.log` elsewhere.
 */
export function log(...args: any[]) {
  if (typeof Logger !== 'undefined' && typeof Logger.log === 'function')
    Logger.log(
      args.map(arg => {
        if (arg instanceof MLObject)
          arg = arg.object
        if (isObject(arg))
          return toString(arg)
        return String(arg)
      }).join(' ')
    )
  else
    console.log(...args)
}

/**
 * Blocks execution for a number of seconds.
 * Uses `Utilities.sleep` in Google Apps Script and `Atomics.wait` elsewhere.
 *
 * @param delay - Delay in seconds
 */
export function wait(delay: number) {
  delay *= 1000
  if (typeof Utilities !== 'undefined' && typeof Utilities.sleep === 'function')
    Utilities.sleep(delay)
  else
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay)
}