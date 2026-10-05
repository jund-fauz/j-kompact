import type { MLArray } from './src'

declare global {
  interface Array<T> {
    asMLArray<T>(): MLArray<T>
    lazyFlat(): Array<T>
  }
}

export {}