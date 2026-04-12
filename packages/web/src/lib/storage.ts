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

export function saveHistory(sessions: WorkoutSession[]): void {
  localStorage.setItem(KEYS.history, JSON.stringify(sessions));
}

export function addSession(session: WorkoutSession): WorkoutSession[] {
  const sessions = loadHistory();
  sessions.unshift(session);
  saveHistory(sessions);
  return sessions;
}

export function deleteSession(id: string): WorkoutSession[] {
  const sessions = loadHistory().filter(s => s.id !== id);
  saveHistory(sessions);
  return sessions;
}
