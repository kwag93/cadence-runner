import ActivityKit
import Foundation

@objc class LiveActivityManager: NSObject {
    private var activityId: String?

    @objc func startActivity(targetBpm: Int) {
        guard #available(iOS 16.2, *) else { return }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        let attributes = RunActivityAttributes(startedAt: Date())
        let state = RunActivityAttributes.ContentState(
            elapsedSeconds: 0,
            currentSpm: 0,
            targetBpm: targetBpm,
            metronomeOn: true
        )

        do {
            let activity = try Activity.request(
                attributes: attributes,
                content: .init(state: state, staleDate: nil),
                pushType: nil
            )
            activityId = activity.id
        } catch {
            NSLog("[LiveActivity] Failed to start: \(error)")
        }
    }

    @objc func updateActivity(elapsedSeconds: Int, currentSpm: Int, targetBpm: Int, metronomeOn: Bool) {
        guard #available(iOS 16.2, *) else { return }
        guard let activityId else { return }

        let state = RunActivityAttributes.ContentState(
            elapsedSeconds: elapsedSeconds,
            currentSpm: currentSpm,
            targetBpm: targetBpm,
            metronomeOn: metronomeOn
        )

        Task {
            for activity in Activity<RunActivityAttributes>.activities where activity.id == activityId {
                await activity.update(.init(state: state, staleDate: nil))
            }
        }
    }

    @objc func endActivity() {
        guard #available(iOS 16.2, *) else { return }
        guard let activityId else { return }
        self.activityId = nil

        Task { [activityId] in
            for activity in Activity<RunActivityAttributes>.activities where activity.id == activityId {
                await activity.end(nil, dismissalPolicy: .default)
            }
        }
    }
}
