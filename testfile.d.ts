type SomeUnion = string | number | Record<string, unknown>

type SomeType<T extends (name: string) => string> = {
    val: T
    getMe: (name: string) => string
    getNames(name: string): string
}

declare function someFunc(): string
declare class MyClass {}
