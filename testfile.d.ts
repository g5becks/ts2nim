declare function of<T extends { name: string }>(...items: T[]): T[]
type SomePerson = {
    name: string
    age: number
}
type SomeUnion = string | number | boolean | null | undefined | Record<string, unknown> | { name: string; age: number }

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
class EventEmitter {
    constructor(options?: EventEmitterOptions)
    /** @deprecated since v4.0.0 */
    static listenerCount(emitter: EventEmitter, event: string | symbol): number
    static defaultMaxListeners: number
    /**
     * This symbol shall be used to install a listener for only monitoring `'error'`
     * events. Listeners installed using this symbol are called before the regular
     * `'error'` listeners are called.
     *
     * Installing a listener using this symbol does not change the behavior once an
     * `'error'` event is emitted, therefore the process will still crash if no
     * regular `'error'` listener is installed.
     */
    static readonly errorMonitor: unique symbol
}
