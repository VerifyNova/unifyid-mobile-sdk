# UnifyID Mobile SDK

Native helpers for adding **Continue with UnifyID** to Android/Kotlin, Flutter,
React Native, and Apple applications. Every adapter uses the hosted UnifyID
authorization experience, Authorization Code flow, PKCE S256, state validation,
and the operating system browser authentication surface.

## Packages

| Package | Runtime | Browser surface |
| --- | --- | --- |
| `packages/android-kotlin` | Android / Kotlin | Android Custom Tabs |
| `packages/flutter` | Flutter on Android and iOS | `flutter_appauth` |
| `packages/react-native` | React Native | `react-native-app-auth` |
| `packages/ios-swift` | iOS / Swift | `ASWebAuthenticationSession` |
| `packages/core` | Node reference and contract tests | OAuth helper primitives |

The SDK never embeds a Client Secret. Mobile applications are public OAuth
clients. Register every callback URI exactly in the UnifyID Developer portal
and use PKCE.

## Local verification

```bash
npm install
npm run check
```

Flutter is available separately:

```bash
cd packages/flutter
flutter pub get
flutter analyze
```

Open `packages/android-kotlin` in Android Studio to compile the Android library.
Open `packages/ios-swift` in Xcode or run `swift test` on macOS.

## Android / Kotlin

1. Register an exact HTTPS App Link such as
   `https://mobile.yourcompany.com/oauth/callback`.
2. Add a verified intent filter for that App Link.
3. Keep the returned transaction in encrypted local storage.
4. Launch `UnifyIDClient.authorize`.
5. Validate the callback with `complete`.
6. Exchange the code with the original verifier. A mobile app never sends a
   Client Secret.

See `examples/kotlin/MainActivity.kt`.

## Flutter

Add the local package while developing:

```yaml
dependencies:
  unifyid_flutter:
    path: ../unifyid-mobile-sdk/packages/flutter
```

Configure a verified Android App Link and iOS Universal Link, then use the
example in `examples/flutter/main.dart`.

## React Native

Install the adapter and its native peer:

```bash
npm install @unifyid/react-native react-native-app-auth
```

Add the Android App Link and iOS Universal Link, then use
`examples/react-native/App.js`.

## iOS / Swift

Add `packages/ios-swift` as a local Swift Package, register the Universal Link,
and call `UnifyIDClient.authorize(anchor:)`. The package uses
`ASWebAuthenticationSession`; it does not place the hosted flow in a general
purpose WebView.

## Production checklist

- Use verified HTTPS Universal Links/App Links. UnifyID deliberately rejects
  untrusted custom redirect schemes.
- Store pending state, nonce, and verifier in encrypted device storage.
- Allow only one active transaction per sign-in attempt.
- Reject mismatched, missing, replayed, or expired state.
- Do not log authorization codes, access tokens, or identity claims.
- Send crash diagnostics without personal identity information.
- Handle cancellation, offline operation, and revoked consent explicitly.
