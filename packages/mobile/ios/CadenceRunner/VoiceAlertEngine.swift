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

        // MetronomeEngine이 설정한 .playback 세션을 유지.
        // voicePrompt 모드로 변경하지 않음 — 메트로놈 끊김 방지.

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
    }
}

// AVSpeechSynthesizerDelegate를 별도 클래스로 분리하여
// Swift-ObjC++ 브릿지 헤더에 AVFoundation 프로토콜이 노출되지 않도록 함
private class SpeechDelegate: NSObject, AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        // 오디오 세션을 건드리지 않음 — MetronomeEngine이 관리
    }
}
