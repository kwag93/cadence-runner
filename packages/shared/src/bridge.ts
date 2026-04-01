// window.ReactNativeWebView 타입 확장
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

/** WebView 내부에서 실행 중인지 여부 */
export const isNative = (): boolean =>
  typeof window !== 'undefined' && !!window.ReactNativeWebView;

/** Web → Native 메시지 전송 (WebView 밖에서는 no-op) */
export function postToNative(msg: WebMessage): void {
  window.ReactNativeWebView?.postMessage(JSON.stringify(msg));
}

/** Native → Web 메시지 리스너 등록. cleanup 함수 반환 */
export function onNativeMessage(
  handler: (msg: NativeMessage) => void,
): () => void {
  const listener = (event: MessageEvent) => {
    try {
      handler(JSON.parse(event.data));
    } catch {
      // 파싱 실패 시 무시 (non-bridge 메시지)
    }
  };
  window.addEventListener('message', listener);
  document.addEventListener('message', listener as EventListener);
  return () => {
    window.removeEventListener('message', listener);
    document.removeEventListener('message', listener as EventListener);
  };
}

// ─── Message Types ─────────────────────────────

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
  | { type: 'toggle_metronome' }
  | { type: 'speak'; text: string };

export type BridgeError = {
  type: 'error';
  code: string;
  message: string;
};
