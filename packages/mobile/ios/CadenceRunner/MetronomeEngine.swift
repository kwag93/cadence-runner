import AVFoundation

@objc class MetronomeEngine: NSObject {
    private let engine = AVAudioEngine()
    private let playerNode = AVAudioPlayerNode()
    private var clickBuffer: AVAudioPCMBuffer!
    private let sampleRate: Double = 44100
    private let format: AVAudioFormat

    private var timer: DispatchSourceTimer?
    private let timerQueue = DispatchQueue(label: "metronome.timer", qos: .userInteractive)

    private var _bpm: Double = 170
    private var _isPlaying = false

    override init() {
        format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
        super.init()
        engine.attach(playerNode)
        engine.connect(playerNode, to: engine.mainMixerNode, format: format)
        generateClickBuffer()
    }

    // MARK: - Public API

    @objc func start(_ bpm: Double) {
        guard !_isPlaying else { return }
        _bpm = bpm

        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playback, mode: .default, options: [.mixWithOthers, .duckOthers]
            )
            try AVAudioSession.sharedInstance().setActive(true)
            try engine.start()
        } catch {
            print("[MetronomeEngine] start failed: \(error)")
            return
        }

        playerNode.play()
        _isPlaying = true
        startTimer()
    }

    @objc func stop() {
        guard _isPlaying else { return }
        _isPlaying = false
        stopTimer()
        playerNode.stop()
        engine.stop()
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    @objc func setBpm(_ bpm: Double) {
        _bpm = max(30, min(300, bpm))
        if _isPlaying {
            restartTimer()
        }
    }

    @objc var isPlaying: Bool { _isPlaying }

    // MARK: - Click buffer 생성

    private func generateClickBuffer() {
        let clickDuration: Double = 0.015 // 15ms
        let frameCount = AVAudioFrameCount(sampleRate * clickDuration)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }
        buffer.frameLength = frameCount

        let data = buffer.floatChannelData![0]
        let freq: Float = 1000.0 // 1kHz — 러닝 중 주변 소음에서도 잘 들리는 주파수

        for i in 0..<Int(frameCount) {
            let t = Float(i) / Float(sampleRate)
            let envelope = expf(-t * 300) // 빠른 감쇠
            data[i] = sinf(2.0 * .pi * freq * t) * envelope * 0.7
        }

        clickBuffer = buffer
    }

    // MARK: - Timer

    private func startTimer() {
        let interval = 60.0 / _bpm
        timer = DispatchSource.makeTimerSource(queue: timerQueue)
        timer?.schedule(deadline: .now(), repeating: interval)
        timer?.setEventHandler { [weak self] in
            self?.tick()
        }
        timer?.resume()
    }

    private func stopTimer() {
        timer?.cancel()
        timer = nil
    }

    private func restartTimer() {
        stopTimer()
        startTimer()
    }

    private func tick() {
        guard _isPlaying else { return }
        playerNode.scheduleBuffer(clickBuffer, at: nil, options: [], completionHandler: nil)
    }
}
