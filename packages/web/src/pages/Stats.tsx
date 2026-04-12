import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Zap, Brain, BarChart3 } from "lucide-react";
import { formatTime, formatDate } from "@/lib/format";
import type { WorkoutSession, UserSettings } from "@cadence-runner/shared";

interface StatsProps {
  sessions: WorkoutSession[];
  settings: UserSettings;
}

export function Stats({ sessions, settings }: StatsProps) {
  if (sessions.length === 0) {
    return (
      <div className="px-6 flex flex-col items-center justify-center min-h-[40vh]">
        <BarChart3 className="w-16 h-16 text-outline mb-4" />
        <p className="text-lg font-bold text-on-surface-variant">No stats yet</p>
        <p className="text-sm text-outline mt-1">Complete some runs to see your statistics</p>
      </div>
    );
  }

  const allSpm = sessions.map(s => s.avgSpm);
  const lifetimeAvg = Math.round(allSpm.reduce((a, b) => a + b, 0) / allSpm.length);
  const maxSpm = Math.max(...sessions.map(s => s.maxSpm));
  const totalSeconds = sessions.reduce((a, s) => a + s.durationSeconds, 0);
  const longestRun = Math.max(...sessions.map(s => s.durationSeconds));
  const avgOnTarget = Math.round(
    (sessions.reduce((a, s) => a + s.onTargetRatio, 0) / sessions.length) * 100
  );

  // 최근 5개 vs 이전 비교 (트렌드)
  const recentAvg = sessions.length >= 5
    ? Math.round(sessions.slice(0, 5).reduce((a, s) => a + s.avgSpm, 0) / 5)
    : lifetimeAvg;
  const olderAvg = sessions.length >= 10
    ? Math.round(sessions.slice(5, 10).reduce((a, s) => a + s.avgSpm, 0) / 5)
    : lifetimeAvg;
  const trend = recentAvg - olderAvg;

  // 월별 평균 (최근 6개월)
  const monthlyData = getMonthlyAverages(sessions);

  // 최근 세션 (최대 5개)
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="px-6 space-y-8 max-w-5xl mx-auto">
      {/* Hero Metric */}
      <section className="mt-8">
        <p className="font-heading text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
          Lifetime Average
        </p>
        <div className="flex items-baseline gap-4">
          <h2 className="font-heading text-6xl md:text-8xl font-bold text-primary leading-none">{lifetimeAvg}</h2>
          <span className="font-heading text-xl text-on-surface-variant tracking-widest uppercase">SPM</span>
        </div>
        {sessions.length >= 5 && (
          <p className={`mt-4 flex items-center gap-2 text-sm font-medium ${trend >= 0 ? 'text-secondary' : 'text-error'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            {trend >= 0 ? '+' : ''}{trend} SPM vs previous
          </p>
        )}
      </section>

      {/* Personal Bests */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Runs", value: String(sessions.length), color: "border-l-primary" },
          { label: "Max Cadence", value: String(maxSpm), unit: "SPM", color: "border-l-secondary" },
          { label: "Longest Run", value: formatTime(longestRun), color: "border-l-tertiary" },
          { label: "Total Time", value: formatTime(totalSeconds), color: "border-l-primary" },
        ].map((pb) => (
          <Card key={pb.label} className={`bg-surface-container-low border-0 border-l-2 ${pb.color}`}>
            <CardContent className="p-5">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{pb.label}</p>
              <p className="font-heading text-2xl font-bold">
                {pb.value}
                {pb.unit && <span className="text-xs font-normal opacity-60 ml-1">{pb.unit}</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Monthly Chart + Consistency */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {monthlyData.length > 0 && (
          <Card className="md:col-span-2 bg-surface-container border-0">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="font-heading text-xl font-bold">Monthly Cadence</h3>
                  <p className="text-xs text-on-surface-variant">Average SPM by month</p>
                </div>
              </div>
              <div className="flex items-end justify-between h-48 gap-3">
                {monthlyData.map((m, i) => {
                  const maxH = Math.max(...monthlyData.map(d => d.avg), 1);
                  const h = (m.avg / maxH) * 100;
                  const isLatest = i === monthlyData.length - 1;
                  return (
                    <div key={m.label} className="flex flex-col items-center flex-1 gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant">{m.avg}</span>
                      <div
                        className={`w-full rounded-t-lg ${isLatest ? 'bg-primary shadow-[0_0_15px_rgba(105,246,184,0.3)]' : 'bg-surface-container-highest'}`}
                        style={{ height: `${h}%` }}
                      />
                      <span className={`text-[9px] uppercase tracking-tighter ${isLatest ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary-container border-0 text-on-primary-container">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-heading font-bold text-lg mb-1 italic">ON TARGET</h3>
              <p className="text-xs opacity-80">
                You've stayed within ±{settings.deviationThreshold} SPM of your target for {avgOnTarget}% of your running time.
              </p>
            </div>
            <div className="mt-8">
              <p className="text-4xl font-bold font-heading">{avgOnTarget}%</p>
              <div className="w-full bg-on-primary-container/20 h-1.5 rounded-full mt-2">
                <div className="bg-on-primary-container h-full rounded-full" style={{ width: `${avgOnTarget}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Sessions */}
      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold tracking-tight px-1">Recent Sessions</h3>
        {recentSessions.map((s) => (
          <Card key={s.id} className="bg-surface-container-low border-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
                <Zap className={`w-5 h-5 ${s.onTargetRatio >= 0.7 ? 'text-primary' : 'text-tertiary'}`} />
              </div>
              <div className="flex-grow">
                <p className="font-bold text-sm">{formatDate(s.startedAt)}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                  {formatTime(s.durationSeconds)} · {Math.round(s.onTargetRatio * 100)}% on target
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading font-bold text-primary">{s.avgSpm}</p>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-tighter">Avg SPM</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Insight Card */}
      {sessions.length >= 3 && (
        <Card className="bg-surface-container-high border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <Brain className="w-8 h-8 text-secondary mb-4" />
            <h3 className="font-heading text-2xl font-bold text-on-surface leading-tight mb-3">
              Your Sweet Spot
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Based on {sessions.length} sessions, your most consistent cadence is{" "}
              <span className="text-primary font-bold">{lifetimeAvg} SPM</span>.
              {avgOnTarget >= 80
                ? " Great job maintaining your target rhythm!"
                : ` Try to stay closer to your ${settings.targetBpm} BPM target.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── 유틸 ────────────────────────────────────────────────────────────

function getMonthlyAverages(sessions: WorkoutSession[]): { label: string; avg: number }[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const buckets = new Map<string, number[]>();

  for (const s of sessions) {
    const d = new Date(s.startedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = buckets.get(key) ?? [];
    existing.push(s.avgSpm);
    buckets.set(key, existing);
  }

  // 최근 6개월 정렬
  const sorted = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, values]) => {
      const month = parseInt(key.split('-')[1]);
      return {
        label: monthNames[month],
        avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      };
    });

  return sorted;
}
