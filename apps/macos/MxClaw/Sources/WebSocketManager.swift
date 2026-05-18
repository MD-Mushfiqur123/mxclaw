import Foundation
import Combine

class WebSocketManager: ObservableObject {
    @Published var isConnected = false
    @Published var messages: [ChatMessage] = []

    private var webSocketTask: URLSessionWebSocketTask?
    private var session: URLSession?
    private var reconnectTimer: Timer?
    private var isReconnecting = false

    var serverURL: String {
        get { UserDefaults.standard.string(forKey: "serverURL") ?? "ws://localhost:18700" }
        set { UserDefaults.standard.set(newValue, forKey: "serverURL") }
    }

    var autoConnect: Bool {
        get { UserDefaults.standard.bool(forKey: "autoConnect") }
        set { UserDefaults.standard.set(newValue, forKey: "autoConnect") }
    }

    init() {
        if autoConnect {
            connect()
        }
    }

    func connect() {
        disconnect()
        guard let url = URL(string: serverURL) else { return }
        session = URLSession(configuration: .default, delegate: nil, delegateQueue: .main)
        webSocketTask = session?.webSocketTask(with: url)
        webSocketTask?.resume()
        isConnected = true
        receiveMessage()
    }

    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        session?.invalidateAndCancel()
        session = nil
        isConnected = false
        stopReconnect()
    }

    func sendChat(_ text: String) {
        let uuid = UUID().uuidString
        let localMsg = ChatMessage(id: uuid, role: "user", content: text, timestamp: ISO8601DateFormatter().string(from: Date()))
        DispatchQueue.main.async {
            self.messages.append(localMsg)
        }
        let payload: [String: Any] = [
            "type": "chat:send",
            "message": text,
            "id": uuid
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: payload) else { return }
        webSocketTask?.send(.data(data)) { error in
            if let error = error {
                print("Send error: \(error)")
            }
        }
    }

    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let message):
                switch message {
                case .data(let data):
                    self.handleData(data)
                case .string(let string):
                    if let data = string.data(using: .utf8) {
                        self.handleData(data)
                    }
                @unknown default:
                    break
                }
                self.receiveMessage()
            case .failure(let error):
                print("Receive error: \(error)")
                DispatchQueue.main.async {
                    self.isConnected = false
                    self.scheduleReconnect()
                }
            }
        }
    }

    private func handleData(_ data: Data) {
        if let msg = try? JSONDecoder().decode(ChatMessage.self, from: data) {
            DispatchQueue.main.async {
                self.messages.append(msg)
            }
        }
    }

    private func scheduleReconnect() {
        guard !isReconnecting else { return }
        isReconnecting = true
        reconnectTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: false) { [weak self] _ in
            self?.isReconnecting = false
            self?.connect()
        }
    }

    private func stopReconnect() {
        reconnectTimer?.invalidate()
        reconnectTimer = nil
        isReconnecting = false
    }
}
