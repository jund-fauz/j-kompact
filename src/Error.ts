export function templateLogError(e: Error, functionName: string = '', options: {withThrow?: boolean, prefixMessage?: string} = {}) {
  const { withThrow = true, prefixMessage = '' } = options
  console.log(`${prefixMessage ? `${prefixMessage}\n` : ''}${functionName ? `Function: ${functionName}\n` : ''}Error: ${e.message}\n${e.stack}`)
  if (withThrow)
    throw e
}