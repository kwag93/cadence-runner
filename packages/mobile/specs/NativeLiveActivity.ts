import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  startActivity(targetBpm: number): void;
  updateActivity(
    elapsedSeconds: number,
    currentSpm: number,
    targetBpm: number,
    metronomeOn: boolean,
  ): void;
  endActivity(): void;
}

export default TurboModuleRegistry.get<Spec>('NativeLiveActivity');
