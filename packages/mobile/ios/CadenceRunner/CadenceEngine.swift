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
        guard CMPedometer.isStepCountingAvailable() else {
            print("[CadenceEngine] Step counting not available")
            return
        }

        _isRunning = true

        // 운동 중 화면 꺼짐 방지
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = true
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
    }

    @objc func stop() {
        guard _isRunning else { return }
        _isRunning = false
        pedometer.stopUpdates()

        // 화면 꺼짐 방지 해제
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = false
        }
    }
}
