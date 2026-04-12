// ─── Message Types (DOM-free, mobile + web 양쪽에서 안전하게 import) ─────

// Native → WebView
export type NativeMessage =
  | { type: 'cadence'; value: number; timestamp: number }
  | { type: 'metronome_state'; playing: boolean; bpm: number }
  | { type: 'health_ready'; available: boolean }
  | BridgeError;

// WebView → Native
export type WebMessage =
  | { type: 'start_workout' }
  | { type: 'stop_workout' }
  | { type: 'set_target_bpm'; value: number }
  | { type: 'start_metronome' }
  | { type: 'stop_metronome' }
  | { type: 'speak'; text: string }
  | { type: 'set_haptic'; enabled: boolean }
  | { type: 'set_sound_type'; value: string }
  | { type: 'request_health_auth' }
  | { type: 'save_workout'; startDate: string; endDate: string; durationSeconds: number; avgCadence: number };

export type BridgeError = {
  type: 'error';
  code: string;
  message: string;
};
