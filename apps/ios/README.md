# MxClaw - iOS App

A native iOS app that connects to the MxClaw gateway via WebSocket.

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## Build & Run

```bash
open MxClaw.xcodeproj
```

Select a simulator or connected device and run (⌘R).

Or build from the command line:

```bash
xcodebuild -project MxClaw.xcodeproj -scheme MxClaw -destination 'platform=iOS Simulator,name=iPhone 15' build
```

## Features

- Real-time chat via WebSocket to the MxClaw gateway
- QR code scanner for device pairing (AVFoundation)
- Connection status indicator
- Configurable server URL

## Architecture

- `MxClawApp.swift` - `@main` entry point with TabView navigation
- `ChatView.swift` - Chat message list and input field with `MessageBubble`
- `WebSocketManager.swift` - WebSocket client with message handling and pairing
- `PairingView.swift` - QR code scanner using `AVCaptureSession`
- `SettingsView.swift` - Server URL configuration and connection status
