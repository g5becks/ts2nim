type SomeType<T extends { name: string }> = {
    val: T
}

class MyClass {}
