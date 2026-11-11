import { log } from './Dynamic.ts'

/**
 * Logs an error in a standard format (function name, message, and stack trace),
 * then rethrows it unless `withThrow: false`.
 */
export function templateLogError(e: Error, functionName: string = '', options: {withThrow?: boolean, prefixMessage?: string} = {}) {
  const { withThrow = true, prefixMessage = '' } = options
  log(`${prefixMessage ? `${prefixMessage}\n` : ''}${functionName ? `Function: ${functionName}\n` : ''}Error: ${e.message}\n${e.stack}`)
  if (withThrow)
    throw e
}