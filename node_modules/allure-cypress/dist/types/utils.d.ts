export declare const DEFAULT_RUNTIME_CONFIG: {
    stepsFromCommands: {
        maxArgumentLength: number;
        maxArgumentDepth: number;
    };
};
/**
 * Pops items from an array into a new one. The item that matches the predicate is the last item to pop.
 * If there is no such item in the array, the array is left unmodified.
 * @param items An array to pop the items from.
 * @param pred A predicate that defines the last item to pop.
 * @returns An array of popped items. The first popped item becomes the first element of this array.
 */
export declare const popUntilFindIncluded: <T>(items: T[], pred: (value: T) => boolean) => T[];
export declare const toReversed: <T = unknown>(arr: T[]) => T[];
export declare const last: <T = unknown>(arr: T[]) => T | undefined;
export declare const isDefined: <T>(value: T | undefined) => value is T;
