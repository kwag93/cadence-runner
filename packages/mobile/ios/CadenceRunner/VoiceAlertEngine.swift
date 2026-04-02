import AVFoundation

@objc class VoiceAlertEngine: NSObject {
    private let synthesizer = AVSpeechSynthesizer()
    private let delegateHandler = SpeechDelegate()

    override init() {
        super.init()
        synthesizer.delegate = delegateHandler
    }

    @objc func speak(_ text: String) {
        guard !synthesizer.isSpeaking else { return }

        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playback, mode: .voicePrompt, options: [.duckOthers]
            )
        } catch {
            print("[VoiceAlertEngine] audio session error: \(error)")
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 1.1
        utterance.pitchMultiplier = 1.0
        utterance.volume = 0.9

        let isKorean = text.unicodeScalars.contains { $0.value >= 0xAC00 && $0.value <= 0xD7AF }
        utterance.voice = AVSpeechSynthesisVoice(language: isKorean ? "ko-KR" : "en-US")

        synthesizer.speak(utterance)
    }

    @objc func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        SpeechDelegate.restoreAudioSession()
    }
}

// AVSpeechSynthesizerDelegate를 별도 클래스로 분리하여
// Swift-ObjC++ 브릿지 헤더에 AVFoundation 프로토콜이 노출되지 않도록 함
private class SpeechDelegate: NSObject, AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        SpeechDelegate.restoreAudioSession()
    }

    static func restoreAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playback, mode: .default, options: [.mixWithOthers, .duckOthers]
            )
        } catch {
            print("[VoiceAlertEngine] restore session error: \(error)")
        }
    }
}
