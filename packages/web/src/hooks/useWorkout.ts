import { useState, useEffect, useCallback, useRef } from 'react';
import { BPM_DEFAULT } from '@cadence-runner/shared';
import { postToNative, onNativeMessage } from '@/lib/bridge';

interface WorkoutState {
  isRunning: boolean;
  elapsedSeconds: number;
  currentSpm: number;
  targetBpm: number;
  metronomeOn: boolean;
  deviation: number;
}

export function useWorkout() {
  const [state, setState] = useState<WorkoutState>({
    isRunning: false,
    elapsedSeconds: 0,
    currentSpm: 0,
    targetBpm: BPM_DEFAULT,
    metronomeOn: false,
    deviation: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (state.isRunning) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [state.isRunning]);

  useEffect(() => {
    return onNativeMessage((msg) => {
      switch (msg.type) {
        case 'cadence':
          setState(prev => ({
            ...prev,
            currentSpm: msg.value,
            deviation: msg.value - prev.targetBpm,
          }));
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
    setState(prev => ({ ...prev, isRunning: true, elapsedSeconds: 0, currentSpm: 0, metronomeOn: true }));
    postToNative({ type: 'start_workout' });
    postToNative({ type: 'start_metronome' });
  }, []);

  const stopWorkout = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false, metronomeOn: false }));
    postToNative({ type: 'stop_metronome' });
    postToNative({ type: 'stop_workout' });
  }, []);

  const setMetronome = useCallback((on: boolean) => {
    setState(prev => ({ ...prev, metronomeOn: on }));
    postToNative({ type: on ? 'start_metronome' : 'stop_metronome' });
  }, []);

  const setTargetBpm = useCallback((bpm: number) => {
    setState(prev => ({ ...prev, targetBpm: bpm }));
    postToNative({ type: 'set_target_bpm', value: bpm });
  }, []);

  return { ...state, startWorkout, stopWorkout, setMetronome, setTargetBpm };
}
