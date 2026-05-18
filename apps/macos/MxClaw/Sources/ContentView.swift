import SwiftUI

struct ContentView: View {
    @EnvironmentObject var wsManager: WebSocketManager
    @State private var messageText = ""

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Circle()
                    .fill(wsManager.isConnected ? Color.green : Color.red)
                    .frame(width: 8, height: 8)
                Text(wsManager.isConnected ? "Connected" : "Disconnected")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("MxClaw")
                    .font(.caption)
                    .fontWeight(.semibold)
            }
            .padding(.horizontal)
            .padding(.vertical, 6)
            .background(Color(NSColor.windowBackgroundColor))

            Divider()

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 4) {
                        ForEach(wsManager.messages) { msg in
                            MessageBubble(message: msg)
                                .id(msg.id)
                        }
                    }
                    .padding(8)
                }
                .onChange(of: wsManager.messages.count) { _ in
                    if let last = wsManager.messages.last {
                        proxy.scrollTo(last.id, anchor: .bottom)
                    }
                }
            }
            .frame(minHeight: 200, maxHeight: 300)

            Divider()

            HStack(spacing: 8) {
                TextField("Type a message...", text: $messageText)
                    .textFieldStyle(.plain)
                    .onSubmit { sendMessage() }
                Button("Send") { sendMessage() }
                    .disabled(messageText.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(8)
        }
        .frame(width: 320)
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        wsManager.sendChat(text)
        messageText = ""
    }
}

struct MessageBubble: View {
    let message: ChatMessage

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(message.role)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(message.content)
                .font(.body)
                .textSelection(.enabled)
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(message.role == "user" ? Color.blue.opacity(0.1) : Color.gray.opacity(0.1))
        )
    }
}

struct ChatMessage: Identifiable, Decodable {
    let id: String
    let role: String
    let content: String
    let timestamp: String?

    enum CodingKeys: String, CodingKey {
        case id, role, content, timestamp
    }
}
