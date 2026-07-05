import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Zap, ArrowLeft, Trash2, ChevronRight, Heart } from "lucide-react";
import { formatTime, formatDate, formatTimeOfDay } from "@/lib/format";
import type { WorkoutSession } from "@cadence-runner/shared";

interface HistoryProps {
  sessions: WorkoutSession[];
  viewingSessionId: string | null;
  onViewSession: (id: string | null) => void;
  onDeleteSession: (id: string) => void;
  deviationThreshold: number;
}

export function History({
  sessions, viewingSessionId, onViewSession, onDeleteSession,
  deviationThreshold,
}: HistoryProps) {
  const session = viewingSessionId
    ? sessions.find(s => s.id === viewingSessionId)
    : null;

  if (session) {
    return (
      <SessionDetail
        session={session}
        onBack={() => onViewSession(null)}
        onDelete={() => { onDeleteSession(session.id); onViewSession(null); }}
        deviationThreshold={deviationThreshold}
      />
    );
  }

  return <SessionList sessions={sessions} onView={onViewSession} />;
}

// ─── 세션 리스트 ─────────────────────────────────────────────────────

function SessionList({ sessions, onView }: {
  sessions: WorkoutSession[];
  onView: (id: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="px-6 flex flex-col items-center justify-center min-h-[40vh]">
        <Zap className="w-16 h-16 text-outline mb-4" />
        <p className="text-lg font-bold text-on-surface-variant">아직 기록이 없습니다</p>
        <p className="text-sm text-outline mt-1">첫 러닝을 완료하면 여기에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="px-6 max-w-xl mx-auto space-y-3">
      {sessions.map((s) => {
        const onTargetPct = Math.round(s.onTargetRatio * 100);
        return (
          <Card
            key={s.id}
            className="bg-surface-container-low hover:bg-surface-container transition-all border-0 cursor-pointer"
            onClick={() => onView(s.id)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
                <Zap className={`w-5 h-5 ${onTargetPct >= 70 ? 'text-primary' : 'text-tertiary'}`} />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-bold text-sm truncate">
                  {formatDate(s.startedAt)} {formatTimeOfDay(s.startedAt)}
                </p>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide">
                  {formatTime(s.durationSeconds)} · {onTargetPct}% 목표 달성
                </p>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="font-heading font-bold text-primary">{s.avgSpm}</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter">평균 SPM</p>
                </div>
                <ChevronRight className="w-4 h-4 text-outline" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── 세션 상세 ───────────────────────────────────────────────────────

function SessionDetail({ session, onBack, onDelete, deviationThreshold }: {
  session: WorkoutSession;
  onBack: () => void;
  onDelete: () => void;
  deviationThreshold: number;
}) {
  const s = session;
  const onTargetPct = Math.round(s.onTargetRatio * 100);
  // 케이던스 바 차트 데이터: 샘플을 20개 구간으로 다운샘플
  const bars = downsampleBars(s.samples.map(sample => sample.spm), 20);
  const maxBar = Math.max(...bars, 1);

  // 존 계산
  const spmValues = s.samples.map(sample => sample.spm).filter(v => v > 0);
  const offTarget = spmValues.filter(v => Math.abs(v - s.targetBpm) > deviationThreshold * 2).length;
  const warning = spmValues.filter(v => {
    const d = Math.abs(v - s.targetBpm);
    return d > deviationThreshold && d <= deviationThreshold * 2;
  }).length;
  const total = spmValues.length || 1;

  const zones = [
    { label: "목표 달성", pct: `${onTargetPct}%`, color: "bg-primary" },
    { label: "주의", pct: `${Math.round((warning / total) * 100)}%`, color: "bg-tertiary" },
    { label: "목표 이탈", pct: `${Math.round((offTarget / total) * 100)}%`, color: "bg-error-dim" },
  ];

  return (
    <div className="px-4 max-w-xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold text-sm">
        <ArrowLeft className="w-4 h-4" />
        기록으로 돌아가기
      </button>

      {/* Hero */}
      <section className="relative h-36 w-full rounded-xl overflow-hidden shadow-2xl bg-surface-container">
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest">
            {formatTimeOfDay(s.startedAt)}
          </p>
          <h2 className="text-2xl font-bold text-on-surface">
            {formatDate(s.startedAt)} 러닝
          </h2>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-surface-container-high border-outline-variant">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-secondary" />
              <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest">
                총 시간
              </p>
            </div>
            <p className="text-3xl font-bold text-on-surface">{formatTime(s.durationSeconds)}</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-high border-outline-variant">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest">
                목표 BPM
              </p>
            </div>
            <p className="text-3xl font-bold text-on-surface">{s.targetBpm}</p>
          </CardContent>
        </Card>

        {s.avgHeartRate && (
          <Card className="col-span-2 bg-surface-container-high border-red-500/20">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest">
                    평균 심박수
                  </p>
                  <p className="text-2xl font-bold text-on-surface">{s.avgHeartRate} <span className="text-sm text-on-surface-variant">BPM</span></p>
                </div>
              </div>
              {s.maxHeartRate && (
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">최고</p>
                  <p className="font-bold text-on-surface">{s.maxHeartRate} BPM</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="col-span-2 bg-surface-container-highest border-primary/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest mb-1">
                평균 케이던스
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-primary">{s.avgSpm}</span>
                <span className="text-lg font-bold text-primary-dim">SPM</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-on-surface-variant">
                최고 <span className="font-bold text-on-surface">{s.maxSpm}</span>
              </p>
              <p className="text-sm text-on-surface-variant">
                최저 <span className="font-bold text-on-surface">{s.minSpm}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cadence Chart */}
      {bars.length > 0 && (
        <Card className="bg-surface-container border-outline-variant">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-on-surface">케이던스 분석</h3>
              <Badge className="bg-primary/10 text-primary-dim border-0 text-xs">
                목표: {s.targetBpm} SPM
              </Badge>
            </div>
            <div className="relative h-40 w-full flex items-end gap-1 px-1">
              {bars.map((spm, i) => {
                const h = (spm / maxBar) * 100;
                const diff = Math.abs(spm - s.targetBpm);
                const color = diff <= deviationThreshold
                  ? "bg-primary"
                  : diff <= deviationThreshold * 2
                    ? "bg-tertiary/60"
                    : "bg-error-dim/60";
                return <div key={i} className={`${color} w-full rounded-t-sm`} style={{ height: `${h}%` }} />;
              })}
            </div>
            <div className="flex justify-between mt-3 text-xs font-heading text-on-surface-variant uppercase tracking-widest">
              <span>시작</span>
              <span>중간</span>
              <span>종료</span>
            </div>
            <div className="mt-6 flex justify-between gap-2">
              {zones.map((z) => (
                <div key={z.label} className="flex-1 flex flex-col items-center p-2 rounded bg-surface-container-low border border-outline-variant/30">
                  <div className={`w-2 h-2 rounded-full ${z.color} mb-1`} />
                  <span className="text-xs text-on-surface-variant">{z.label}</span>
                  <span className="text-sm font-bold">{z.pct}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete */}
      <div className="pt-4 mb-10">
        <Button
          onClick={onDelete}
          variant="ghost"
          className="w-full text-error font-bold flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          이 기록 삭제
        </Button>
      </div>
    </div>
  );
}

// ─── 유틸 ────────────────────────────────────────────────────────────

function downsampleBars(values: number[], targetLen: number): number[] {
  if (values.length === 0) return [];
  if (values.length <= targetLen) return values;
  const bucketSize = values.length / targetLen;
  const result: number[] = [];
  for (let i = 0; i < targetLen; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize);
    const slice = values.slice(start, end);
    result.push(Math.round(slice.reduce((a, b) => a + b, 0) / slice.length));
  }
  return result;
}
