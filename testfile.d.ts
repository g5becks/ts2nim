declare let Na: number
declare let Infinit: number

/**
 * Evaluates JavaScript code and executes it.
 * @param x A String value that contains valid JavaScript code.
 */
declare function eval(x: string): any

type SomeType<T extends { name: string }> = {
    val: T
}

declare function someFunc(): string
declare class MyClass {}
