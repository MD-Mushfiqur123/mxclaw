import Foundation
import Combine

class WebSocketManager: ObservableObject {
    @Published var isConnected = false
    @Published var messages: [ChatMessage] = []
    @Published var pairedDeviceId: String?

    private var webSocketTask: URLSessionWebSocketTask?
    private var session: URLSession?

    var serverURL: String {
        get { UserDefaults.standard.string(forKey: "serverURL") ?? "ws://localhost:18700" }
        set { UserDefaults.standard.set(newValue, forKey: "serverURL") }
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
    }

    func sendChat(_ text: String) {
        let uuid = UUID().uuidString
        let localMsg = ChatMessage(
            id: uuid,
            role: "user",
            content: text,
            timestamp: ISO8601DateFormatter().string(from: Date())
        )
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

    func sendPairCode(_ code: String) {
        let payload: [String: Any] = [
            "type": "pair:request",
            "code": code
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: payload) else { return }
        webSocketTask?.send(.data(data)) { error in
            if let error = error {
                print("Pair error: \(error)")
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
                }
            }
        }
    }

    private func handleData(_ data: Data) {
        if let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            if let type = dict["type"] as? String {
                switch type {
                case "pair:success":
                    if let deviceId = dict["deviceId"] as? String {
                        DispatchQueue.main.async {
                            self.pairedDeviceId = deviceId
                        }
                    }
                case "chat:message":
                    if let msg = try? JSONDecoder().decode(ChatMessage.self, from: data) {
                        DispatchQueue.main.async {
                            self.messages.append(msg)
                        }
                    }
                default:
                    if let msg = try? JSONDecoder().decode(ChatMessage.self, from: data) {
                        DispatchQueue.main.async {
                            self.messages.append(msg)
                        }
                    }
                }
            }
        }
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
