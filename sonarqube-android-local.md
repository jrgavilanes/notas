# Sonarqube en local

https://www.youtube.com/watch?v=i0MakUcHAGw

## Descargar servidor

https://www.sonarqube.org/success-download-community-edition/

## Enalazar app android

En build.gradle a nivel de proyecto
```
dependencies {
	classpath 'com.android.tools.build:gradle:7.1.3'

	classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.6.10"
	classpath "androidx.navigation:navigation-safe-args-gradle-plugin:2.4.1"
	// NOTE: Do not place your application dependencies here; they belong
	// in the individual module build.gradle files
	...

	classpath "org.sonarsource.scanner.gradle:sonarqube-gradle-plugin:2.7.1"   <--------------------------
}
```


En build.gradle a nivel de módulo.
```

dependencies {
    ...
	androidTestImplementation 'androidx.test.ext:junit:1.1.3'
	...
}

// Añadir esto al final del fichero
apply plugin: 'org.sonarqube'
sonarqube
	{
		properties {
			property "sonar.projectName", "mio que pasa"
			property "sonar.projectKey", "ojetekey"
			property "sonar.language", "kotlin"
			property "sonar.source", "src/main/java"
			property "sonar.binaries", "build"
			property "sonar.sourceincoding", "UTF-8"
			property "sonar.login", "admin"
			property "sonar.password", "miclave"
		}
	}
```
		
## Lanzar y revisar resultados.

```
$ gradlew sonar
```

Revisar en localhost:9000
	
		
