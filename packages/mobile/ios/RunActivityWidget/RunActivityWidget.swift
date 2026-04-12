import SwiftUI
import WidgetKit
import ActivityKit

struct RunActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RunActivityAttributes.self) { context in
            // Lock Screen / Banner
            LockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                expandedContent(context: context)
            } compactLeading: {
                HStack(spacing: 4) {
                    Image(systemName: "figure.run")
                        .foregroundColor(.green)
                    Text("\(context.state.currentSpm)")
                        .font(.headline)
                        .fontWeight(.black)
                        .foregroundColor(.green)
                }
            } compactTrailing: {
                Text(formatElapsed(context.state.elapsedSeconds))
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white.opacity(0.8))
            } minimal: {
                Image(systemName: "figure.run")
                    .foregroundColor(.green)
            }
        }
    }

    @DynamicIslandExpandedContentBuilder
    private func expandedContent(context: ActivityViewContext<RunActivityAttributes>) -> DynamicIslandExpandedContent<some View> {
        DynamicIslandExpandedRegion(.leading) {
            VStack(alignment: .leading, spacing: 2) {
                Text("SPM")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.green.opacity(0.7))
                Text("\(context.state.currentSpm)")
                    .font(.title)
                    .fontWeight(.black)
                    .foregroundColor(.green)
            }
        }

        DynamicIslandExpandedRegion(.trailing) {
            VStack(alignment: .trailing, spacing: 2) {
                Text("목표")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(.white.opacity(0.5))
                Text("\(context.state.targetBpm)")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
        }

        DynamicIslandExpandedRegion(.center) {
            Text(formatElapsed(context.state.elapsedSeconds))
                .font(.title3)
                .fontWeight(.bold)
                .monospacedDigit()
                .foregroundColor(.white)
        }

        DynamicIslandExpandedRegion(.bottom) {
            HStack(spacing: 12) {
                let deviation = context.state.currentSpm - context.state.targetBpm
                let absDev = abs(deviation)
                let isOnTarget = absDev <= 5

                HStack(spacing: 4) {
                    Circle()
                        .fill(isOnTarget ? Color.green : (absDev > 10 ? Color.red : Color.orange))
                        .frame(width: 8, height: 8)
                    Text(isOnTarget ? "목표 달성" : (deviation > 0 ? "+\(absDev) 빠름" : "-\(absDev) 느림"))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                if context.state.metronomeOn {
                    HStack(spacing: 4) {
                        Image(systemName: "metronome.fill")
                            .font(.caption)
                            .foregroundColor(.green)
                        Text("켜짐")
                            .font(.caption)
                            .foregroundColor(.green.opacity(0.8))
                    }
                }
            }
            .padding(.horizontal, 4)
        }
    }
}

// Lock Screen 프레젠테이션
private struct LockScreenView: View {
    let context: ActivityViewContext<RunActivityAttributes>

    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text("케이던스 러너")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.green.opacity(0.8))
                Text("\(context.state.currentSpm) SPM")
                    .font(.title)
                    .fontWeight(.black)
                    .foregroundColor(.green)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text(formatElapsed(context.state.elapsedSeconds))
                    .font(.title2)
                    .fontWeight(.bold)
                    .monospacedDigit()
                Text("목표 \(context.state.targetBpm) BPM")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(16)
        .background(Color.black.opacity(0.8))
    }
}

private func formatElapsed(_ seconds: Int) -> String {
    let m = seconds / 60
    let s = seconds % 60
    return String(format: "%d:%02d", m, s)
}
