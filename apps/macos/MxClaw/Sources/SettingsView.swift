import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var wsManager: WebSocketManager
    @State private var serverURL: String = ""
    @State private var autoConnect: Bool = false

    var body: some View {
        Form {
            TextField("Server URL:", text: $serverURL)
                .onAppear {
                    serverURL = wsManager.serverURL
                    autoConnect = wsManager.autoConnect
                }
            Toggle("Auto-connect on launch", isOn: $autoConnect)
            HStack {
                Button("Save") {
                    wsManager.serverURL = serverURL
                    wsManager.autoConnect = autoConnect
                }
                Button("Reconnect") {
                    wsManager.connect()
                }
            }
        }
        .padding(20)
        .frame(width: 350)
    }
}
