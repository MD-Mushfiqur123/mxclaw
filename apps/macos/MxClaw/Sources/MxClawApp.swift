import SwiftUI

@main
struct MxClawApp: App {
    @StateObject private var wsManager = WebSocketManager()

    var body: some Scene {
        MenuBarExtra {
            ContentView()
                .environmentObject(wsManager)
        } label: {
            Image(systemName: wsManager.isConnected ? "waveform.circle.fill" : "waveform.circle")
        }
        .menuBarExtraStyle(.window)

        Settings {
            SettingsView()
                .environmentObject(wsManager)
        }
    }
}
