import React, {useCallback, useEffect, useRef} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {WebView, type WebViewMessageEvent} from 'react-native-webview';
import {BPM_DEFAULT, BPM_MIN, BPM_MAX, type WebMessage} from '@cadence-runner/shared';
import NativeMetronome from './specs/NativeMetronome';
import NativeCadence from './specs/NativeCadence';
import NativeVoiceAlert from './specs/NativeVoiceAlert';
import NativeHealthKit from './specs/NativeHealthKit';

const SURFACE_BG = '#070d1f';

// 개발: Vite dev server, 프로덕션: 번들된 HTML
// 실기기 테스트 시 Mac LAN IP 사용, 시뮬레이터는 localhost
const DEV_SERVER_HOST = Platform.select({
  ios: '192.168.0.5', // Mac LAN IP — 실기기에서 접근 가능
  android: '10.0.2.2',
})!;
const DEV_PORT = 5173;
const DEV_URL = `http://${DEV_SERVER_HOST}:${DEV_PORT}`;

const PROD_URL = Platform.select({
  ios: '', // iOS: 번들 내 HTML (추후 설정)
  android: 'file:///android_asset/web/index.html',
})!;

const WEB_URL = __DEV__ ? DEV_URL : PROD_URL;

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={SURFACE_BG} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const targetBpmRef = useRef(BPM_DEFAULT);
  const workoutActiveRef = useRef(false);

  // HealthKit 권한 요청 (앱 시작 시 1회)
  useEffect(() => {
    NativeHealthKit.requestAuthorization();
  }, []);

  // cadence polling: 1초마다 SPM을 WebView에 전달
  useEffect(() => {
    const interval = setInterval(() => {
      if (!workoutActiveRef.current) return;
      const spm = NativeCadence.getCurrentSpm();
      const msg = JSON.stringify({
        type: 'cadence',
        value: Math.round(spm),
        timestamp: Date.now(),
      });
      webViewRef.current?.postMessage(msg);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // safe area 변경 시 WebView에 재주입
  useEffect(() => {
    webViewRef.current?.injectJavaScript(`
      document.documentElement.style.setProperty('--sat', '${insets.top}px');
      document.documentElement.style.setProperty('--sab', '${insets.bottom}px');
      document.documentElement.style.setProperty('--sal', '${insets.left}px');
      document.documentElement.style.setProperty('--sar', '${insets.right}px');
      true;
    `);
  }, [insets.top, insets.bottom, insets.left, insets.right]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    let msg: WebMessage;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'start_workout':
        workoutActiveRef.current = true;
        NativeCadence.start();
        console.log('[Bridge] start_workout');
        break;
      case 'stop_workout':
        workoutActiveRef.current = false;
        NativeMetronome.stop();
        NativeCadence.stop();
        console.log('[Bridge] stop_workout');
        break;
      case 'set_target_bpm': {
        const bpm = msg.value;
        if (typeof bpm !== 'number' || !Number.isFinite(bpm)) break;
        const clamped = Math.max(BPM_MIN, Math.min(BPM_MAX, bpm));
        targetBpmRef.current = clamped;
        NativeMetronome.setBpm(clamped);
        console.log('[Bridge] set_target_bpm:', clamped);
        break;
      }
      case 'start_metronome':
        NativeMetronome.start(targetBpmRef.current);
        console.log('[Bridge] start_metronome');
        break;
      case 'stop_metronome':
        NativeMetronome.stop();
        console.log('[Bridge] stop_metronome');
        break;
      case 'speak':
        if (typeof msg.text === 'string' && msg.text.length > 0 && msg.text.length < 500) {
          NativeVoiceAlert.speak(msg.text);
        }
        console.log('[Bridge] speak:', msg.text);
        break;
      case 'set_haptic':
        if (typeof msg.enabled === 'boolean') {
          NativeMetronome.setHapticEnabled(msg.enabled);
        }
        console.log('[Bridge] set_haptic:', msg.enabled);
        break;
      case 'set_sound_type':
        if (typeof msg.value === 'string') {
          NativeMetronome.setSoundType(msg.value);
        }
        console.log('[Bridge] set_sound_type:', msg.value);
        break;
      case 'request_health_auth':
        NativeHealthKit.requestAuthorization();
        console.log('[Bridge] request_health_auth');
        break;
      case 'save_workout':
        NativeHealthKit.saveWorkout(
          msg.startDate,
          msg.endDate,
          msg.durationSeconds,
          msg.avgCadence,
        );
        console.log('[Bridge] save_workout');
        break;
      default:
        console.warn('[Bridge] unknown message type:', (msg as {type: string}).type);
        break;
    }
  }, []);

  const safeAreaScript = `
    document.documentElement.style.setProperty('--sat', '${insets.top}px');
    document.documentElement.style.setProperty('--sab', '${insets.bottom}px');
    document.documentElement.style.setProperty('--sal', '${insets.left}px');
    document.documentElement.style.setProperty('--sar', '${insets.right}px');
    true;
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: WEB_URL}}
        style={[styles.webview, {backgroundColor: SURFACE_BG}]}
        originWhitelist={['*']}
        onMessage={handleMessage}
        onError={(e) => console.error('[WebView] error:', e.nativeEvent.description)}
        onHttpError={(e) => console.error('[WebView] HTTP error:', e.nativeEvent.statusCode, e.nativeEvent.url)}
        onLoadStart={() => console.log('[WebView] loading:', WEB_URL)}
        onLoadEnd={() => console.log('[WebView] loaded')}
        injectedJavaScript={safeAreaScript}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        webviewDebuggingEnabled={__DEV__}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SURFACE_BG,
  },
  webview: {
    flex: 1,
  },
});

export default App;
