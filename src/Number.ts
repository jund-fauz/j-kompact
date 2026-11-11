import { iterate } from "./Iteration.ts";

/**
 * Creates an array of consecutive numbers from `from` to `until` (inclusive).
 */
export function range(from: number, until: number): number[] {
    if (until < from) {
        throw new Error("'until' should be greater than or equal to 'from'")
    }
    return iterate(i => i, { from, until }) as number[];
}
