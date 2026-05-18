# MxClaw - Android App

A native Android app that connects to the MxClaw gateway via WebSocket.

## Requirements

- Android 8.1+ (API 26)
- Android Studio Hedgehog (2023.1.1) or later
- Kotlin 1.9+
- Gradle 8.2+

## Build & Run

Open in Android Studio:

```bash
open -a "Android Studio" .
```

Or build from the command line:

```bash
./gradlew assembleDebug
```

Install on a connected device:

```bash
./gradlew installDebug
```

## Features

- Real-time chat via WebSocket to the MxClaw gateway
- Camera-based QR code scanner for device pairing (CameraX + ML Kit)
- Connection status indicator
- Configurable server URL
- Bottom navigation with Chat, Pair, and Settings screens

## Architecture

- `MainActivity.kt` - Entry point with Jetpack Compose + Navigation
- `ChatScreen.kt` - Compose chat UI with message list and input
- `PairingScreen.kt` - CameraX QR scanner for device pairing
- `SettingsScreen.kt` - Server URL configuration
- `WebSocketManager.kt` - OkHttp WebSocket client
- `ChatMessage.kt` - Data model for chat messages

## Dependencies

- Jetpack Compose with Material 3
- OkHttp 4.12+ for WebSocket
- CameraX 1.3+ for camera preview
- ML Kit Barcode Scanning 17.2+ for QR codes
- Navigation Compose for screen routing
