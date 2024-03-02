import type Iterators from "../module/src/ai-ui/iterators";

declare global {
    export const document: Document;
    export const Element: Element;
    declare namespace Test {
        export async function *count(n: number = 10): AsyncGenerator<number>;
        export async function sleep<T>(s: number, v?: T): Promise<T>;
    }
}