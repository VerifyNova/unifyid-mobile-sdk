plugins {
  id("com.android.library")
  kotlin("android")
}
android { namespace = "com.unifyid.sdk"; compileSdk = 35; defaultConfig { minSdk = 23 } }
dependencies {
  implementation("androidx.browser:browser:1.9.0")
  implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
