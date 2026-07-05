import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  start(bpm: number): void;
  stop(): void;
  setBpm(bpm: number): void;
  setHapticEnabled(enabled: boolean): void;
  setSoundType(type: string): void;
  isPlaying(): boolean;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeMetronome');
