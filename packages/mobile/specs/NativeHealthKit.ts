import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  requestAuthorization(): void;
  saveWorkout(
    startDate: string,
    endDate: string,
    durationSeconds: number,
    avgCadence: number,
  ): void;
  isAvailable(): boolean;
  getLatestHeartRate(): number;
  startHeartRateObserver(): void;
  stopHeartRateObserver(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeHealthKit');
