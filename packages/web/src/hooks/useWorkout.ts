import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserSettings, WorkoutSession, SpmSample } from '@cadence-runner/shared';
import { DEVIATION_SUSTAINED_SECONDS } from '@cadence-runner/shared';
import { postToNative, onNativeMessage } from '@/lib/bridge';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

interface WorkoutState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  currentSpm: number;
  targetBpm: number;
  metronomeOn: boolean;
  deviation: number;
}

interface UseWorkoutOptions {
  settings: UserSettings;
}

export function useWorkout({ settings }: UseWorkoutOptions) {
  const [state, setState] = useState<WorkoutState>({
    isRunning: false,
    isPaused: false,
    elapsedSeconds: 0,
    currentSpm: 0,
    targetBpm: settings.targetBpm,
    metronomeOn: false,
    deviation: 0,
  });

  const samplesRef = useRef<SpmSample[]>([]);
  const startTimeRef = useRef<string>('');
  const lastAlertRef = useRef<number>(0);
  const deviationStreakRef = useRef<number>(0);
  const lowSpmStreakRef = useRef<number>(0);
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; });

  // 타이머: isRunning && !isPaused 일 때만 카운트
  useEffect(() => {
    if (!state.isRunning || state.isPaused) return;
    const timer = setInterval(() => {
      setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.isRunning, state.isPaused]);

  // 네이티브 메시지 리스너 — 모든 로직을 콜백 내에서 처리
  useEffect(() => {
    return onNativeMessage((msg) => {
      switch (msg.type) {
        case 'cadence':
          setState(prev => {
            if (!prev.isRunning) return prev;

            const deviation = msg.value - prev.targetBpm;
            const absDev = Math.abs(deviation);
            const now = Date.now();
            const s = settingsRef.current;

            // SPM 샘플 수집
            if (samplesRef.current.length === 0 ||
                msg.timestamp - samplesRef.current[samplesRef.current.length - 1].timestamp >= 1000) {
              samplesRef.current.push({ timestamp: msg.timestamp, spm: msg.value });
            }

            // 자동 일시정지 체크
            if (msg.value > 0 && msg.value < s.autoPauseThreshold) {
              lowSpmStreakRef.current++;
              if (lowSpmStreakRef.current >= 3) {
                lowSpmStreakRef.current = 0;
                postToNative({ type: 'stop_metronome' });
                postToNative({ type: 'speak', text: '자동 일시정지' });
                return { ...prev, currentSpm: msg.value, deviation, isPaused: true, metronomeOn: false };
              }
            } else {
              lowSpmStreakRef.current = 0;
            }

            // 음성 알림 체크
            if (s.voiceEnabled && !prev.isPaused && msg.value > 0) {
              if (absDev > s.deviationThreshold) {
                deviationStreakRef.current++;
                if (deviationStreakRef.current >= DEVIATION_SUSTAINED_SECONDS &&
                    now - lastAlertRef.current > s.cooldownSeconds * 1000) {
                  const direction = deviation > 0 ? '빠릅니다' : '느립니다';
                  postToNative({ type: 'speak', text: `케이던스가 ${absDev} ${direction}` });
                  lastAlertRef.current = now;
                  deviationStreakRef.current = 0;
                }
              } else {
                deviationStreakRef.current = 0;
              }
            }

            return { ...prev, currentSpm: msg.value, deviation };
          });
          break;
        case 'metronome_state':
          setState(prev => ({
            ...prev,
            metronomeOn: msg.playing,
            targetBpm: msg.bpm,
          }));
          break;
      }
    });
  }, []);

  const startWorkout = useCallback(() => {
    const bpm = settingsRef.current.targetBpm;
    samplesRef.current = [];
    startTimeRef.current = new Date().toISOString();
    lastAlertRef.current = 0;
    deviationStreakRef.current = 0;
    lowSpmStreakRef.current = 0;
    setState({
      isRunning: true,
      isPaused: false,
      elapsedSeconds: 0,
      currentSpm: 0,
      targetBpm: bpm,
      metronomeOn: true,
      deviation: 0,
    });
    postToNative({ type: 'set_target_bpm', value: bpm });
    postToNative({ type: 'set_haptic', enabled: settingsRef.current.hapticEnabled });
    postToNative({ type: 'set_sound_type', value: settingsRef.current.soundType });
    postToNative({ type: 'start_workout' });
    postToNative({ type: 'start_metronome' });
  }, []);

  const stopWorkout = useCallback((): WorkoutSession | null => {
    const samples = [...samplesRef.current];
    const elapsed = state.elapsedSeconds;
    const target = state.targetBpm;

    setState(prev => ({ ...prev, isRunning: false, isPaused: false, metronomeOn: false }));
    postToNative({ type: 'stop_metronome' });
    postToNative({ type: 'stop_workout' });

    const spmValues = samples.map(s => s.spm).filter(v => v > 0);
    if (spmValues.length === 0) return null;

    const avgSpm = Math.round(spmValues.reduce((a, b) => a + b, 0) / spmValues.length);
    const threshold = settingsRef.current.deviationThreshold;
    const onTarget = spmValues.filter(v => Math.abs(v - target) <= threshold).length;

    const session: WorkoutSession = {
      id: generateId(),
      startedAt: startTimeRef.current,
      endedAt: new Date().toISOString(),
      durationSeconds: elapsed,
      targetBpm: target,
      avgSpm,
      maxSpm: Math.max(...spmValues),
      minSpm: Math.min(...spmValues),
      samples,
      onTargetRatio: onTarget / spmValues.length,
    };

    // 운동 완료 음성 요약
    if (settingsRef.current.voiceEnabled) {
      const min = Math.floor(elapsed / 60);
      const sec = elapsed % 60;
      const timeText = min > 0
        ? `${min}분 ${sec > 0 ? `${sec}초` : ''}`
        : `${sec}초`;
      const onTargetPct = Math.round(session.onTargetRatio * 100);
      postToNative({
        type: 'speak',
        text: `운동 완료. ${timeText}, 평균 케이던스 ${avgSpm}. 목표 달성률 ${onTargetPct}퍼센트.`,
      });
    }

    return session;
  }, [state.elapsedSeconds, state.targetBpm]);

  const resumeWorkout = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false, metronomeOn: true }));
    postToNative({ type: 'start_metronome' });
    lowSpmStreakRef.current = 0;
  }, []);

  const setMetronome = useCallback((on: boolean) => {
    setState(prev => ({ ...prev, metronomeOn: on }));
    postToNative({ type: on ? 'start_metronome' : 'stop_metronome' });
  }, []);

  const setTargetBpm = useCallback((bpm: number) => {
    setState(prev => ({ ...prev, targetBpm: bpm }));
    postToNative({ type: 'set_target_bpm', value: bpm });
  }, []);

  return {
    ...state,
    startWorkout,
    stopWorkout,
    resumeWorkout,
    setMetronome,
    setTargetBpm,
  };
}
