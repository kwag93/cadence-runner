import AVFoundation

@objc class MetronomeEngine: NSObject {
    private let engine = AVAudioEngine()
    private let playerNode = AVAudioPlayerNode()
    private var clickBuffer: AVAudioPCMBuffer!
    private let sampleRate: Double = 44100
    private let format: AVAudioFormat

    private var timer: DispatchSourceTimer?
    private let timerQueue = DispatchQueue(label: "metronome.timer", qos: .userInteractive)
    private let lock = NSLock()

    private var _bpm: Double = 170
    private var _isPlaying = false

    override init() {
        format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
        super.init()
        engine.attach(playerNode)
        engine.connect(playerNode, to: engine.mainMixerNode, format: format)
        generateClickBuffer()
    }

    deinit {
        stop()
    }

    // MARK: - Public API

    @objc func start(_ bpm: Double) {
        lock.lock()
        guard !_isPlaying else { lock.unlock(); return }
        _bpm = bpm
        _isPlaying = true
        lock.unlock()

        do {
            try AVAudioSession.sharedInstance().setCategory(
                .playback, mode: .default, options: [.mixWithOthers, .duckOthers]
            )
            try AVAudioSession.sharedInstance().setActive(true)
            try engine.start()
        } catch {
            print("[MetronomeEngine] start failed: \(error)")
            lock.lock()
            _isPlaying = false
            lock.unlock()
            return
        }

        playerNode.play()
        startTimer()
    }

    @objc func stop() {
        lock.lock()
        guard _isPlaying else { lock.unlock(); return }
        _isPlaying = false
        lock.unlock()

        stopTimer()
        playerNode.stop()
        engine.stop()
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    @objc func setBpm(_ bpm: Double) {
        lock.lock()
        // Must match BPM_MIN/BPM_MAX in shared/constants.ts
        _bpm = max(30, min(300, bpm))
        let playing = _isPlaying
        lock.unlock()

        if playing {
            restartTimer()
        }
    }

    @objc var isPlaying: Bool {
        lock.lock()
        defer { lock.unlock() }
        return _isPlaying
    }

    // MARK: - Click buffer 생성

    private func generateClickBuffer() {
        let clickDuration: Double = 0.015 // 15ms
        let frameCount = AVAudioFrameCount(sampleRate * clickDuration)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }
        buffer.frameLength = frameCount

        let data = buffer.floatChannelData![0]
        let freq: Float = 1000.0

        for i in 0..<Int(frameCount) {
            let t = Float(i) / Float(sampleRate)
            let envelope = expf(-t * 300)
            data[i] = sinf(2.0 * .pi * freq * t) * envelope * 0.7
        }

        clickBuffer = buffer
    }

    // MARK: - Timer
    // TODO: Replace DispatchSourceTimer with AVAudioSourceNode render callback for sample-accurate timing

    private func startTimer() {
        lock.lock()
        let interval = 60.0 / _bpm
        lock.unlock()

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
        lock.lock()
        let playing = _isPlaying
        lock.unlock()
        guard playing else { return }
        playerNode.scheduleBuffer(clickBuffer, at: nil, options: [], completionHandler: nil)
    }
}
