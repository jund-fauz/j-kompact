import type { MLObject } from './src/Object.ts'

interface Array<T> {
  lazyFlat(): Array<T>
}