import SwiftUI
import AVFoundation

struct PairingView: View {
    @EnvironmentObject var wsManager: WebSocketManager
    @StateObject private var scanner = QRScanner()

    var body: some View {
        VStack(spacing: 20) {
            if let deviceId = wsManager.pairedDeviceId {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.green)
                Text("Paired with")
                    .font(.headline)
                Text(deviceId)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Button("Unpair") {
                    wsManager.pairedDeviceId = nil
                }
                .buttonStyle(.bordered)
            } else {
                Text("Scan QR Code")
                    .font(.title2)
                    .fontWeight(.semibold)

                ZStack {
                    QRCodeScannerView(scanner: scanner) { code in
                        wsManager.sendPairCode(code)
                    }
                    .frame(width: 250, height: 250)
                    .cornerRadius(12)

                    if scanner.isLoading {
                        ProgressView()
                    }
                }

                Text("Point your camera at the QR code on the MxClaw gateway device")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                if let error = scanner.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
        }
        .padding()
        .navigationTitle("Pair Device")
    }
}

class QRScanner: NSObject, ObservableObject, AVCaptureMetadataOutputObjectsDelegate {
    @Published var isLoading = false
    @Published var error: String?

    private let session = AVCaptureSession()

    func startScanning(completion: @escaping (String) -> Void) {
        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device) else {
            error = "Camera unavailable"
            return
        }

        session.beginConfiguration()
        guard session.canAddInput(input) else {
            error = "Cannot add camera input"
            return
        }
        session.addInput(input)

        let output = AVCaptureMetadataOutput()
        guard session.canAddOutput(output) else {
            error = "Cannot add metadata output"
            return
        }
        session.addOutput(output)

        output.setMetadataObjectsDelegate(self, queue: .main)
        output.metadataObjectTypes = [.qr]
        session.commitConfiguration()

        isLoading = true
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.session.startRunning()
        }

        self.completion = completion
    }

    func stopScanning() {
        session.stopRunning()
        isLoading = false
    }

    private var completion: ((String) -> Void)?

    func metadataOutput(_ output: AVCaptureMetadataOutput,
                        didOutput metadataObjects: [AVMetadataObject],
                        from connection: AVCaptureConnection) {
        guard let object = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let code = object.stringValue else { return }
        completion?(code)
        stopScanning()
    }
}

struct QRCodeScannerView: UIViewRepresentable {
    @ObservedObject var scanner: QRScanner
    let onScan: (String) -> Void

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        let preview = AVCaptureVideoPreviewLayer(session: scanner.session)
        preview.videoGravity = .resizeAspectFill
        view.layer.addSublayer(preview)
        DispatchQueue.main.async {
            preview.frame = view.bounds
        }
        scanner.startScanning(completion: onScan)
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        if let layer = uiView.layer.sublayers?.first as? AVCaptureVideoPreviewLayer {
            layer.frame = uiView.bounds
        }
    }
}
