import Cocoa
import Carbon

class PushToTalkManager: ObservableObject {
    @Published var isListening = false

    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private let keyCode: UInt16 = 0x09 // 'V' key

    func start() {
        let eventMask = (1 << CGEventType.keyDown.rawValue) | (1 << CGEventType.keyUp.rawValue)
        eventTap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: CGEventMask(eventMask),
            callback: { (proxy, type, event, refcon) -> Unmanaged<CGEvent>? in
                let manager = Unmanaged<PushToTalkManager>.fromOpaque(refcon!).takeUnretainedValue()
                let key = event.getIntegerValueField(.keyboardEventKeycode)
                if key == manager.keyCode {
                    if type == .keyDown {
                        DispatchQueue.main.async { manager.isListening = true }
                    } else if type == .keyUp {
                        DispatchQueue.main.async { manager.isListening = false }
                    }
                }
                return Unmanaged.passUnretained(event)
            },
            userInfo: Unmanaged.passUnretained(self).toOpaque()
        )
        if let eventTap = eventTap {
            runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, eventTap, 0)
            if let source = runLoopSource {
                CFRunLoopAddSource(CFRunLoopGetCurrent(), source, .commonModes)
            }
            CGEvent.tapEnable(tap: eventTap, enable: true)
        }
    }

    func stop() {
        if let eventTap = eventTap {
            CGEvent.tapEnable(tap: eventTap, enable: false)
            CFMachPortInvalidate(eventTap)
            self.eventTap = nil
        }
        if let source = runLoopSource {
            CFRunLoopSourceInvalidate(source)
            runLoopSource = nil
        }
    }

    deinit {
        stop()
    }
}
