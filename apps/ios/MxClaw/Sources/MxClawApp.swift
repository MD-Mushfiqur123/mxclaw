import SwiftUI

@main
struct MxClawApp: App {
    @StateObject private var wsManager = WebSocketManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(wsManager)
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var wsManager: WebSocketManager
    @State private var showSettings = false
    @State private var showPairing = false

    var body: some View {
        TabView {
            ChatView()
                .tabItem {
                    Label("Chat", systemImage: "message.fill")
                }

            PairingView()
                .tabItem {
                    Label("Pair", systemImage: "qrcode.viewfinder")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
        .onAppear {
            wsManager.connect()
        }
    }
}
