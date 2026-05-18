import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var wsManager: WebSocketManager
    @State private var serverURL = ""
    @State private var showAlert = false
    @State private var alertMessage = ""

    var body: some View {
        Form {
            Section("Connection") {
                TextField("Server URL", text: $serverURL)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .onAppear {
                        serverURL = wsManager.serverURL
                    }

                Button("Save & Reconnect") {
                    wsManager.serverURL = serverURL
                    wsManager.connect()
                    alertMessage = "Connecting to \(serverURL)"
                    showAlert = true
                }
                .buttonStyle(.borderedProminent)
            }

            Section("Status") {
                HStack {
                    Text("Connection")
                    Spacer()
                    Circle()
                        .fill(wsManager.isConnected ? Color.green : Color.red)
                        .frame(width: 8, height: 8)
                    Text(wsManager.isConnected ? "Connected" : "Disconnected")
                        .foregroundColor(.secondary)
                }

                if let deviceId = wsManager.pairedDeviceId {
                    HStack {
                        Text("Paired Device")
                        Spacer()
                        Text(deviceId)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0")
                        .foregroundColor(.secondary)
                }
            }
        }
        .navigationTitle("Settings")
        .alert("Connection", isPresented: $showAlert) {
            Button("OK") {}
        } message: {
            Text(alertMessage)
        }
    }
}
