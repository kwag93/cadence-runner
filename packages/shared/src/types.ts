// ─── 데이터 모델 (localStorage 직렬화 대상) ───────────────────────────

export interface SpmSample {
  /** Unix ms */
  timestamp: number;
  spm: number;
}

export interface WorkoutSession {
  id: string;
  startedAt: string;   // ISO 8601
  endedAt: string;      // ISO 8601
  durationSeconds: number;
  targetBpm: number;
  avgSpm: number;
  maxSpm: number;
  minSpm: number;
  samples: SpmSample[];
  /** target 대비 ±threshold 이내 비율 (0-1) */
  onTargetRatio: number;
}

export type SoundType = 'Click' | 'Woodblock' | 'Digital';

export interface UserSettings {
  targetBpm: number;
  soundType: SoundType;
  voiceEnabled: boolean;
  hapticEnabled: boolean;
  deviationThreshold: number;
  cooldownSeconds: number;
  autoPauseThreshold: number;
}
