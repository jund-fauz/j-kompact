/**
 * File ini berisikan fungsi2 yang akan dijalankan dinamis sesuai environtment-nya
 * Mendukung environtment Node.js dan Google Apps Script
 */

import { isObject, MLObject } from './Object.ts'
import { toString } from './String.ts'

declare var Logger: any
declare var Utilities: any

export function log(...args: any[]) {
  if (typeof Logger !== 'undefined' && typeof log === 'function')
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
 * @param delay - In second
 */
export function wait(delay: number) {
  delay *= 1000
  if (typeof Utilities !== 'undefined' && typeof Utilities.sleep === 'function')
    Utilities.sleep(delay)
  else
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay)
}