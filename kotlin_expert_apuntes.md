# Apuntes Kotlin Expert

## Inicio Compose

main.kt
```kotlin
import androidx.compose.desktop.ui.tooling.preview.Preview
import androidx.compose.foundation.layout.Column
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

class AppState {
    val text = mutableStateOf("")
    val buttonEnabled get() = text.value.isNotEmpty()
}

@Composable
@Preview
fun App(appState: AppState) {
    MaterialTheme {
        Column {
            TextField(value = appState.text.value, onValueChange = {
                appState.text.value = it
            })
            Text(text = appState.text.value)
            Button(
                onClick = { appState.text.value = "" },
                enabled = appState.buttonEnabled
            ) {
                Text("Borrar")
            }
        }
    }
}

fun main() {
    val appState = AppState()
    application {
        Window(onCloseRequest = ::exitApplication) {
            App(appState)
        }
    }
}

```


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
        title = "title $it",
        description = "description $it",
        type = if (it % 3 == 0) Note.NoteType.AUDIO else Note.NoteType.TEXT
    )
}

fun main() {
    println(getNotes(3))
}


```

## Lazy Columns ( recycler view)

```kotlin
import ...

class AppState {
    var notes = mutableStateOf(getNotes(10))
}

@Composable
@Preview
fun App(appState: AppState) {
    MaterialTheme {
        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            items(appState.notes.value) { note ->
                Card(
                    modifier = Modifier
                        .padding(8.dp)
                        .fillMaxWidth(0.8f)
                        .clickable {
                            println("He pinchado ${note.title}")
                        }
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row {
                            Text(
                                note.title,
                                style = MaterialTheme.typography.h5,
                                modifier = Modifier.weight(1f)
                            )
                            if (note.type == Note.NoteType.AUDIO) {
                                /* https://material.io/icons
                                   Add dependency implementation(compose.materialIconsExtended) in build.gradle.kts
                                */
                                Icon(
                                    imageVector = Icons.Default.Campaign,
                                    contentDescription = null,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(note.description, style = MaterialTheme.typography.body1)
                    }
                }
            }
        }
    }
}

fun main() {
    val appState = AppState()
    application {
        Window(onCloseRequest = ::exitApplication) {
            App(appState)
        }
    }
}


```