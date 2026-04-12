import CoreMotion
import Foundation
import UIKit

@objc class CadenceEngine: NSObject {
    private let pedometer = CMPedometer()
    private var _isRunning = false
    private var lastStepCount: Int = 0
    private var lastTimestamp: Date = Date()
    private let lock = NSLock()

    private var _currentSpm: Double = 0
    private var mockTimer: Timer?

    @objc var currentSpm: Double {
        lock.lock()
        defer { lock.unlock() }
        return _currentSpm
    }

    @objc static var isAvailable: Bool {
        CMPedometer.isStepCountingAvailable()
    }

    @objc func start() {
        guard !_isRunning else { return }
        _isRunning = true

        // 운동 중 화면 꺼짐 방지
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = true
        }

        #if targetEnvironment(simulator)
        // 시뮬레이터: mock SPM 데이터 (150-190 범위에서 랜덤 변동)
        print("[CadenceEngine] Simulator detected — using mock SPM data")
        DispatchQueue.main.async { [weak self] in
            self?.mockTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
                let base = 170.0
                let noise = Double.random(in: -20...20)
                self?.lock.lock()
                self?._currentSpm = base + noise
                self?.lock.unlock()
            }
        }
        #else
        // 실기기: CMPedometer 실제 데이터
        guard CMPedometer.isStepCountingAvailable() else {
            print("[CadenceEngine] Step counting not available on this device")
            _isRunning = false
            return
        }

        lastStepCount = 0
        lastTimestamp = Date()

        pedometer.startUpdates(from: Date()) { [weak self] data, error in
            guard let self = self, let data = data, error == nil else { return }

            let now = Date()
            let elapsed = now.timeIntervalSince(self.lastTimestamp)

            // 최소 1초 간격으로 SPM 계산
            guard elapsed >= 1.0 else { return }

            let currentSteps = data.numberOfSteps.intValue
            let stepDelta = currentSteps - self.lastStepCount
            let spm = Double(stepDelta) / elapsed * 60.0

            self.lastStepCount = currentSteps
            self.lastTimestamp = now

            self.lock.lock()
            self._currentSpm = spm
            self.lock.unlock()
        }
        #endif
    }

    @objc func stop() {
        guard _isRunning else { return }
        _isRunning = false

        #if targetEnvironment(simulator)
        DispatchQueue.main.async { [weak self] in
            self?.mockTimer?.invalidate()
            self?.mockTimer = nil
        }
        #else
        pedometer.stopUpdates()
        #endif

        lock.lock()
        _currentSpm = 0
        lock.unlock()

        // 화면 꺼짐 방지 해제
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = false
        }
    }
}
