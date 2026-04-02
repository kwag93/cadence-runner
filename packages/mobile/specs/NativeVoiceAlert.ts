import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  speak(text: string): void;
  stop(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeVoiceAlert');
