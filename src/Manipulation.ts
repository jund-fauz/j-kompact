import { isArray } from "./Array.ts";
import { initObject, isObject, MLObject } from "./Object.ts";
import { isString } from "./String.ts";

/**
 * Deeply trims strings: a plain string, an array of strings, or an object with string values.
 * Mixed arrays / objects are supported; only the strings are trimmed.
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