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
  useEffect(() => {
    const prev = settingsRef.current;
    settingsRef.current = settings;
    // 러닝 중 설정 변경 시 네이티브에 즉시 반영
    if (state.isRunning) {
      if (prev.hapticEnabled !== settings.hapticEnabled) {
        postToNative({ type: 'set_haptic', enabled: settings.hapticEnabled });
      }
      if (prev.soundType !== settings.soundType) {
        postToNative({ type: 'set_sound_type', value: settings.soundType });
      }
    }
  }, [settings, state.isRunning]);

  // Live Activity 업데이트: SPM, BPM, 메트로놈 상태 변경 시만 실행
  // elapsedSeconds는 매초 바뀌므로 의존성에서 제외 — 전송 시점의 최신 값을 ref로 참조
  const elapsedRef = useRef(state.elapsedSeconds);
  elapsedRef.current = state.elapsedSeconds;

  useEffect(() => {
    if (!state.isRunning || state.currentSpm === 0) return;
    postToNative({
      type: 'update_live_activity',
      elapsedSeconds: elapsedRef.current,
      currentSpm: state.currentSpm,
      targetBpm: state.targetBpm,
      metronomeOn: state.metronomeOn,
    });
  }, [state.isRunning, state.currentSpm, state.targetBpm, state.metronomeOn]);

  // 타이머: isRunning && !isPaused 일 때만 카운트
  useEffect(() => {
    if (!state.isRunning || state.isPaused) return;
    const timer = setInterval(() => {
      setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.isRunning, state.isPaused]);

  // 네이티브 메시지 리스너 — side effect는 updater 외부에서 실행
  useEffect(() => {
    return onNativeMessage((msg) => {
      switch (msg.type) {
        case 'cadence': {
          const prev = stateRef.current;
          if (!prev.isRunning) return;

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
          let shouldAutoPause = false;
          if (msg.value > 0 && msg.value < s.autoPauseThreshold) {
            lowSpmStreakRef.current++;
            if (lowSpmStreakRef.current >= 3) {
              lowSpmStreakRef.current = 0;
              shouldAutoPause = true;
            }
          } else {
            lowSpmStreakRef.current = 0;
          }

          // 음성 알림 체크
          let voiceText: string | null = null;
          if (!shouldAutoPause && s.voiceEnabled && !prev.isPaused && msg.value > 0) {
            if (absDev > s.deviationThreshold) {
              deviationStreakRef.current++;
              if (deviationStreakRef.current >= DEVIATION_SUSTAINED_SECONDS &&
                  now - lastAlertRef.current > s.cooldownSeconds * 1000) {
                const direction = deviation > 0 ? '빠릅니다' : '느립니다';
                voiceText = `케이던스가 ${absDev} ${direction}`;
                lastAlertRef.current = now;
                deviationStreakRef.current = 0;
              }
            } else {
              deviationStreakRef.current = 0;
            }
          }

          // 순수 state 업데이트
          if (shouldAutoPause) {
            setState(p => ({ ...p, currentSpm: msg.value, deviation, isPaused: true, metronomeOn: false }));
          } else {
            setState(p => ({ ...p, currentSpm: msg.value, deviation }));
          }

          // side effect는 updater 외부에서 실행
          if (shouldAutoPause) {
            postToNative({ type: 'stop_metronome' });
            postToNative({ type: 'speak', text: '자동 일시정지' });
          }
          if (voiceText) {
            postToNative({ type: 'speak', text: voiceText });
          }
          break;
        }
        case 'metronome_state':
          setState(p => ({ ...p, metronomeOn: msg.playing, targetBpm: msg.bpm }));
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
    postToNative({ type: 'start_live_activity', targetBpm: bpm });
  }, []);

  // ref로 최신 state 참조 — stopWorkout이 매초 재생성되지 않도록
  const stateRef = useRef(state);
  stateRef.current = state;

  const stopWorkout = useCallback((): WorkoutSession | null => {
    const samples = [...samplesRef.current];
    const { elapsedSeconds: elapsed, targetBpm: target } = stateRef.current;

    setState(prev => ({ ...prev, isRunning: false, isPaused: false, metronomeOn: false }));
    postToNative({ type: 'stop_metronome' });
    postToNative({ type: 'stop_workout' });
    postToNative({ type: 'end_live_activity' });

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

    postToNative({
      type: 'save_workout',
      startDate: session.startedAt,
      endDate: session.endedAt,
      durationSeconds: session.durationSeconds,
      avgCadence: session.avgSpm,
    });

    return session;
  }, []);

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

  const speak = useCallback((text: string) => {
    postToNative({ type: 'speak', text });
  }, []);

  return {
    ...state,
    startWorkout,
    stopWorkout,
    resumeWorkout,
    setMetronome,
    setTargetBpm,
    speak,
  };
}
