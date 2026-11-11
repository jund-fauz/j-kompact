import { log, wait } from './Dynamic.ts'

export const Break = 'BREAK'

/**
 * Deklarasi perulangan for dengan formatDate seperti forEach
 */
export function iterate<T>(func: (no: number) => void | T, options: {
  from?: number,
  until?: number,
  untilBefore?: boolean,
  addition?: number,
  withReturnValue?: boolean
} = {}) {
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
    // Jika tidak dikonfigurasi, nilai kembalian dikumpulkan bila iterasi pertama mengembalikan nilai
    if (withReturnValue === undefined)
      withReturnValue = returned !== undefined
    if (withReturnValue)
      result.push(returned)
  }
  if (withReturnValue)
    return result
}

/**
 * Fungsi pemanggilan API dengan skema perulangan saat gagal.
 * Dapat disesuaikan jumlah percobaan dan durasi antar percobaannya.
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