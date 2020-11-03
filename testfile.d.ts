declare function of<T>(...items: T[]): T[]
type SomePerson = {
    name: string
    age: number
}
type SomeUnion = string | number | Record<string, unknown> | { name: string; age: number }

type SomeFunc = (name: string) => string
type SomeType<
    T extends {
        getName(name: string): string
    }
> = {
    val: T
    getMe: (name: string) => string
    getNames(name: string): string
}

declare function someFunc(): string
declare class MyClass {}
