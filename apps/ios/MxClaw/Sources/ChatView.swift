import SwiftUI

struct ChatView: View {
    @EnvironmentObject var wsManager: WebSocketManager
    @State private var messageText = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Circle()
                    .fill(wsManager.isConnected ? Color.green : Color.red)
                    .frame(width: 10, height: 10)
                Text(wsManager.isConnected ? "Connected" : "Disconnected")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
            }
            .padding(.horizontal)
            .padding(.vertical, 8)

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 6) {
                        ForEach(wsManager.messages) { msg in
                            MessageBubble(message: msg)
                                .id(msg.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: wsManager.messages.count) { _ in
                    if let last = wsManager.messages.last {
                        withAnimation {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }

            HStack(spacing: 10) {
                TextField("Type a message...", text: $messageText)
                    .textFieldStyle(.roundedBorder)
                    .focused($isFocused)
                    .onSubmit { sendMessage() }
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                }
                .disabled(messageText.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding()
            .background(Color(uiColor: .systemGroupedBackground))
        }
        .navigationTitle("MxClaw")
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
            Text(message.role.uppercased())
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(message.content)
                .font(.body)
                .textSelection(.enabled)
                .padding(10)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(message.role == "user" ? Color.blue.opacity(0.15) : Color(.systemGray6))
                )
        }
        .frame(maxWidth: .infinity, alignment: message.role == "user" ? .trailing : .leading)
    }
}
