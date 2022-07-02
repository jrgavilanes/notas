# Retos

https://github.com/mouredev/Weekly-Challenge-2022-Swift

## 26 - CUADRADO Y TRIÁNGULO 2D

```kotlin
interface Shape {
    fun print()
}

class Rectangle(private val size: Int): Shape {
    override fun print() {
        for (i in 1..size) {
            for (ii in 1..size) {
                print("*")
            }
            println()
        }
    }
}

class Triangle(private val size: Int): Shape {
    override fun print() {
        for (i in 1..size) {
            for (ii in 1..i) {
                print("*")
            }
            println()
        }
    }
}

val r = Rectangle(2)
r.print()

val t = Triangle(2)
t.print()



```