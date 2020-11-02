type SomeUnion = string | number | Record<string, unknown>

type SomeType<T extends (name: string) => string> = {
    val: T
}

declare function someFunc(): string
declare class MyClass {}
