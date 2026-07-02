import { isObject, MLObject } from './Object.ts'
import { toString } from './String.ts'

declare var Logger: any

/**
 * Fungsi dynamic logging.
 * Melakukan logging sesuai dengan environment-nya.
 */
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