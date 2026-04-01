import type { WebMessage, NativeMessage } from '@cadence-runner/shared';

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
      // non-bridge 메시지 무시
    }
  };
  window.addEventListener('message', listener);
  document.addEventListener('message', listener as EventListener);
  return () => {
    window.removeEventListener('message', listener);
    document.removeEventListener('message', listener as EventListener);
  };
}
