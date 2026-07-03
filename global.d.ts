import type { MLArray } from './src/Array.ts'

declare global {
  interface Array<T> {
    asMLArray<T>(): MLArray<T>
    lazyFlat(): Array<T>
  }
}

export {}