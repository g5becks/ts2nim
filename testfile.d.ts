declare let Na, Xa: number
declare let Infinit: number

/**
 * Converts a string to an integer.
 * @param s A string to convert into a number.
 * @param radix A value between 2 and 36 that specifies the base of the number in numString.
 * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
 * All other strings are considered decimal.
 */
declare function eval(x: string): any

type SomeType<T extends (name: string) => string> = {
    val: T
}

declare function someFunc(): string
declare class MyClass {}
