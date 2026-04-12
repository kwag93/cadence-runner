import HealthKit

@objc class HealthKitEngine: NSObject {
    private let store = HKHealthStore()
    private var _isAuthorized = false

    @objc static var isAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    // MARK: - 권한 요청

    @objc func requestAuthorization() {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("[HealthKit] Health data not available on this device")
            return
        }

        let writeTypes: Set<HKSampleType> = [
            HKObjectType.workoutType(),
        ]

        let readTypes: Set<HKObjectType> = [
            HKObjectType.workoutType(),
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
        ]

        store.requestAuthorization(toShare: writeTypes, read: readTypes) { [weak self] success, error in
            if let error = error {
                print("[HealthKit] Authorization error: \(error.localizedDescription)")
                return
            }
            self?._isAuthorized = success
            print("[HealthKit] Authorization: \(success ? "granted" : "unknown")")
        }
    }

    // MARK: - 심박수 읽기

    /// HealthKit에서 최근 심박수를 읽어옴 (Apple Watch에서 동기화된 데이터)
    @objc func getLatestHeartRate() -> Double {
        guard HKHealthStore.isHealthDataAvailable() else { return -1 }
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return -1 }

        var result: Double = -1
        let semaphore = DispatchSemaphore(value: 0)

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
        // 최근 5분 이내의 데이터만
        let fiveMinAgo = Date().addingTimeInterval(-300)
        let predicate = HKQuery.predicateForSamples(withStart: fiveMinAgo, end: Date(), options: .strictStartDate)

        let query = HKSampleQuery(
            sampleType: heartRateType,
            predicate: predicate,
            limit: 1,
            sortDescriptors: [sortDescriptor]
        ) { _, samples, error in
            if let sample = samples?.first as? HKQuantitySample {
                let bpm = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
                result = bpm
            }
            semaphore.signal()
        }

        store.execute(query)
        _ = semaphore.wait(timeout: .now() + 2)
        return result
    }

    // MARK: - 운동 세션 저장

    /// 운동 세션을 Apple 건강 앱에 저장
    /// - Parameters:
    ///   - startDate: ISO 8601 시작 시각
    ///   - endDate: ISO 8601 종료 시각
    ///   - durationSeconds: 총 운동 시간 (초)
    ///   - avgCadence: 평균 SPM
    @objc func saveWorkout(
        startDate: String,
        endDate: String,
        durationSeconds: Double,
        avgCadence: Double
    ) {
        guard HKHealthStore.isHealthDataAvailable() else { return }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let start = formatter.date(from: startDate) ?? ISO8601DateFormatter().date(from: startDate),
              let end = formatter.date(from: endDate) ?? ISO8601DateFormatter().date(from: endDate) else {
            print("[HealthKit] Invalid date format: \(startDate) / \(endDate)")
            return
        }

        let config = HKWorkoutConfiguration()
        config.activityType = .running
        config.locationType = .outdoor

        let builder = HKWorkoutBuilder(healthStore: store, configuration: config, device: .local())
        builder.beginCollection(withStart: start) { success, error in
            guard success else {
                print("[HealthKit] beginCollection failed: \(error?.localizedDescription ?? "unknown")")
                return
            }

            // 케이던스 메타데이터 추가
            let metadata: [String: Any] = [
                "AverageCadenceSPM": avgCadence,
            ]

            builder.addMetadata(metadata) { _, _ in }

            builder.endCollection(withEnd: end) { success, error in
                guard success else {
                    print("[HealthKit] endCollection failed: \(error?.localizedDescription ?? "unknown")")
                    return
                }

                builder.finishWorkout { workout, error in
                    if let workout = workout {
                        print("[HealthKit] Workout saved: \(workout.uuid), duration: \(workout.duration)s")
                    } else {
                        print("[HealthKit] Save failed: \(error?.localizedDescription ?? "unknown")")
                    }
                }
            }
        }
    }
}
