# Apuntes Kotlin Expert

## Dataclass, Enum y colecciones

main.kt
```kotlin
data class Note(
    val title: String,
    val description: String,
    val type: NoteType
) {
    enum class NoteType {
        AUDIO,
        TEXT
    }
}

fun getNotes(num: Int) = (1..num).map {
    Note(
        "title $it",
        "description $it",
        if (it % 3 == 0) Note.NoteType.AUDIO else Note.NoteType.TEXT
    )
}

fun main() {
    println(getNotes(3))
}

```