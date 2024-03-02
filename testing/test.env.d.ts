declare global {
    export const document: Document;
    export const Element: Element;
    export const Node: Node;
}
declare namespace Test {
    export async function *count(n: number = 10): AsyncGenerator<number>;
    export async function sleep<T>(s: number, v?: T): Promise<T>;
}
