import ActivityKit
import Foundation

@available(iOS 16.1, *)
struct RunActivityAttributes: ActivityAttributes {
    struct ContentState: Codable & Hashable {
        let elapsedSeconds: Int
        let currentSpm: Int
        let targetBpm: Int
        let metronomeOn: Bool
    }

    let startedAt: Date
}
