plugins {
  id("com.android.library")
  kotlin("android")
}
android {
  namespace = "com.unifyid.sdk"
  compileSdk = 35
  defaultConfig { minSdk = 23 }
  // Without this AGP compiles the Java sources at 1.8 while the Kotlin plugin
  // follows the JDK the build runs on — 17 in CI — and Gradle stops at
  // :sdk:compileReleaseKotlin for inconsistent JVM targets. Naming one
  // toolchain settles both, and settles them the same way on every machine
  // rather than by whichever JDK happens to be installed.
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}

kotlin { jvmToolchain(17) }
dependencies {
  implementation("androidx.browser:browser:1.9.0")
  implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
