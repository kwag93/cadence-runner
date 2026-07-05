export const BPM_MIN = 30;
export const BPM_MAX = 300;
export const BPM_DEFAULT = 170;

// 케이던스 이탈 감지
export const DEVIATION_THRESHOLD_SPM = 10;
export const DEVIATION_SUSTAINED_SECONDS = 5;
export const VOICE_COOLDOWN_SECONDS = 15;

// SPM 계산
export const SPM_WINDOW_SECONDS = 5;
export const SPM_UPDATE_INTERVAL_SECONDS = 1;

// 자동 일시정지 (걷기/정지 상태)
export const AUTO_PAUSE_SPM_THRESHOLD = 60;

// 심박 존 (Heart Rate Zones)
export type HeartRateZone = 1 | 2 | 3 | 4 | 5;
export const HR_ZONE_NAMES: Record<HeartRateZone, string> = {
  1: '회복',
  2: '지구력',
  3: '유산소',
  4: '역치',
  5: '최대',
};
export const HR_ZONE_COLORS: Record<HeartRateZone, string> = {
  1: 'text-blue-400',
  2: 'text-green-400',
  3: 'text-yellow-400',
  4: 'text-orange-400',
  5: 'text-red-500',
};
export const HR_ZONE_BG_COLORS: Record<HeartRateZone, string> = {
  1: 'bg-blue-400/20',
  2: 'bg-green-400/20',
  3: 'bg-yellow-400/20',
  4: 'bg-orange-400/20',
  5: 'bg-red-500/20',
};

/** 심박 존 계산: 나이 기반 최대심박수 (220 - age) */
export function getHeartRateZone(heartRate: number, age: number): HeartRateZone | null {
  if (age <= 0 || heartRate <= 0) return null;
  const maxHR = 220 - age;
  const pct = (heartRate / maxHR) * 100;
  if (pct >= 90) return 5;
  if (pct >= 80) return 4;
  if (pct >= 70) return 3;
  if (pct >= 60) return 2;
  return 1;
}
