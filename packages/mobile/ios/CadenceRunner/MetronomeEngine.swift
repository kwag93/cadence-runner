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

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleInterruption),
            name: AVAudioSession.interruptionNotification,
            object: nil
        )
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
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

    // MARK: - Audio Interruption

    @objc private func handleInterruption(notification: Notification) {
        guard let info = notification.userInfo,
              let typeValue = info[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: typeValue) else { return }

        switch type {
        case .began:
            stopTimer()
        case .ended:
            guard let optionsValue = info[AVAudioSessionInterruptionOptionKey] as? UInt else { return }
            let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
            if options.contains(.shouldResume) && isPlaying {
                do {
                    try AVAudioSession.sharedInstance().setActive(true)
                    try engine.start()
                    playerNode.play()
                    startTimer()
                } catch {
                    print("[MetronomeEngine] resume after interruption failed: \(error)")
                }
            }
        @unknown default:
            break
        }
    }

    // MARK: - Click buffer

    private func generateClickBuffer() {
        let clickDuration: Double = 0.015
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

        // timer 접근을 timerQueue에서 직렬화하여 race 방지
        timerQueue.sync {
            self.timer?.cancel()
            let t = DispatchSource.makeTimerSource(queue: self.timerQueue)
            t.schedule(deadline: .now(), repeating: interval)
            t.setEventHandler { [weak self] in
                self?.tick()
            }
            t.resume()
            self.timer = t
        }
    }

    private func stopTimer() {
        timerQueue.sync {
            self.timer?.cancel()
            self.timer = nil
        }
    }

    private func restartTimer() {
        startTimer() // startTimer가 내부에서 기존 timer를 cancel하므로 별도 stop 불필요
    }

    private func tick() {
        lock.lock()
        let playing = _isPlaying
        lock.unlock()
        guard playing else { return }
        playerNode.scheduleBuffer(clickBuffer, at: nil, options: [], completionHandler: nil)
    }
}
