# MxClaw - macOS App

A macOS menu bar app that connects to the MxClaw gateway via WebSocket.

## Requirements

- macOS 14.0+ (Sonoma)
- Xcode 15.0+
- Swift 5.9+

## Build & Run

```bash
open MxClaw.xcodeproj
```

Select the **MxClaw** scheme and run (⌘R).

Or build from the command line:

```bash
xcodebuild -project MxClaw.xcodeproj -scheme MxClaw build
```

## Features

- Menu bar icon showing connection status (green = connected, red = disconnected)
- Popover window with chat message list and input
- Real-time WebSocket communication with the gateway
- Global push-to-talk hotkey (hold V key)
- Configurable server URL

## Architecture

- `MxClawApp.swift` - `@main` entry point with `MenuBarExtra`
- `ContentView.swift` - Popover chat UI with `MessageBubble`
- `WebSocketManager.swift` - WebSocket client with auto-reconnect
- `PushToTalkManager.swift` - Global hotkey via CGEventTap
- `SettingsView.swift` - Server URL and auto-connect settings
