import AVFoundation

@objc class VoiceAlertEngine: NSObject, AVSpeechSynthesizerDelegate {
    private let synthesizer = AVSpeechSynthesizer()

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    @objc func speak(_ text: String) {
        guard !synthesizer.isSpeaking else { return }

        // duck 다른 오디오 (메트로놈 포함)
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

        // 영어/한국어 자동 감지
        let isKorean = text.unicodeScalars.contains { $0.value >= 0xAC00 && $0.value <= 0xD7AF }
        utterance.voice = AVSpeechSynthesisVoice(language: isKorean ? "ko-KR" : "en-US")

        synthesizer.speak(utterance)
    }

    @objc func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        restoreAudioSession()
    }

    // 음성 종료 시 오디오 세션 복원
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        restoreAudioSession()
    }

    private func restoreAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playback, mode: .default, options: [.mixWithOthers, .duckOthers]
            )
        } catch {
            print("[VoiceAlertEngine] restore session error: \(error)")
        }
    }
}
