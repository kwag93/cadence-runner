import type { WorkoutSession, UserSettings } from '@cadence-runner/shared';
import {
  BPM_DEFAULT,
  DEVIATION_THRESHOLD_SPM,
  VOICE_COOLDOWN_SECONDS,
  AUTO_PAUSE_SPM_THRESHOLD,
} from '@cadence-runner/shared';

const KEYS = {
  settings: 'cadence_settings',
  history: 'cadence_history',
} as const;

// ─── Settings ────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: UserSettings = {
  targetBpm: BPM_DEFAULT,
  soundType: 'Click',
  voiceEnabled: true,
  hapticEnabled: true,
  deviationThreshold: DEVIATION_THRESHOLD_SPM,
  cooldownSeconds: VOICE_COOLDOWN_SECONDS,
  autoPauseThreshold: AUTO_PAUSE_SPM_THRESHOLD,
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

// ─── History ─────────────────────────────────────────────────────────

export function loadHistory(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(KEYS.history);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 최대 저장 세션 수 — 오래된 세션은 자동 제거 */
const MAX_SESSIONS = 200;

export function saveHistory(sessions: WorkoutSession[]): void {
  const trimmed = sessions.slice(0, MAX_SESSIONS);
  try {
    localStorage.setItem(KEYS.history, JSON.stringify(trimmed));
  } catch {
    // QuotaExceededError — 오래된 세션의 샘플 데이터를 축소하여 재시도
    const compacted = trimmed.map((s, i) =>
      i >= 50 ? { ...s, samples: [] } : s
    );
    try {
      localStorage.setItem(KEYS.history, JSON.stringify(compacted));
    } catch {
      // 그래도 실패하면 무시 — 데이터 손실보다 앱 크래시가 더 나쁨
    }
  }
}

export function addSession(session: WorkoutSession): WorkoutSession[] {
  const sessions = loadHistory();
  sessions.unshift(session);
  saveHistory(sessions);
  return sessions.slice(0, MAX_SESSIONS);
}

export function deleteSession(id: string): WorkoutSession[] {
  const sessions = loadHistory().filter(s => s.id !== id);
  saveHistory(sessions);
  return sessions;
}
