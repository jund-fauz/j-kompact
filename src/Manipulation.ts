import { isArray } from "./Array.ts";
import { initObject, isObject, MLObject } from "./Object.ts";
import { isString } from "./String.ts";

/**
 * Melakukan trim string secara menyeluruh, baik untuk string bisa, Array of String, maupun Object dengan value berupa string.
 * Data Array / Object campuran didukung dan akan melakukan trim pada string saja.
 */
export function trim<T>(value: T, options: { useJsObject?: boolean } = {}): T {
  const { useJsObject = false } = options
  if (isArray(value)) return value.map(val => trim(val, options)) as T
  if (isObject(value)) {
    const result = initObject((value instanceof MLObject ? value.object : value) as Record<string, T>).reEntries((key: string, value: any) => [key, trim(value, options)])
    if (useJsObject) return result.object as T
    return result as T
  }
  return isString(value) ? value.trim() as T: value
}