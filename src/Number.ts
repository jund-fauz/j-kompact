import { iterate } from "./Iteration.ts";

/**
 * Membuat array berisi angka berurutan dari 'from' sampai 'until' (inklusif)
 */
export function range(from: number, until: number): number[] {
    if (until < from) {
        throw new Error("'until' should be greater than or equal to 'from'")
    }
    return iterate(i => i, { from, until }) as number[];
}
