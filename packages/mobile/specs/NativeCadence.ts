import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  start(): void;
  stop(): void;
  isAvailable(): boolean;
  getCurrentSpm(): number;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeCadence');
