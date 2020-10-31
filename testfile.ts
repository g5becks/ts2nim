type SomeType<T extends () => string> = {
    val: T
}

class MyClass {}
