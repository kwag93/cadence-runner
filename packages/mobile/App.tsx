import React, {useCallback, useRef} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {WebView, type WebViewMessageEvent} from 'react-native-webview';
import type {WebMessage} from '@cadence-runner/shared';
import NativeMetronome from './specs/NativeMetronome';

// 개발: Vite dev server, 프로덕션: 번들된 HTML
// 실기기 테스트 시 Mac의 LAN IP 사용
const DEV_SERVER_HOST = '172.16.200.49';
const DEV_URL = Platform.select({
  ios: `http://${DEV_SERVER_HOST}:5174`,
  android: 'http://10.0.2.2:5174',
})!;

const WEB_URL = __DEV__ ? DEV_URL : 'file:///android_asset/web/index.html';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#070d1f" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  /** WebView → Native 메시지 수신 */
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const msg: WebMessage = JSON.parse(event.nativeEvent.data);

    switch (msg.type) {
      case 'start_workout':
        // Step 8: CadenceModule.start()
        console.log('[Bridge] start_workout');
        break;
      case 'stop_workout':
        NativeMetronome.stop();
        console.log('[Bridge] stop_workout');
        break;
      case 'set_target_bpm':
        NativeMetronome.setBpm(msg.value);
        console.log('[Bridge] set_target_bpm:', msg.value);
        break;
      case 'toggle_metronome':
        if (NativeMetronome.isPlaying()) {
          NativeMetronome.stop();
        } else {
          NativeMetronome.start(170); // 기본 BPM, WebView에서 set_target_bpm으로 조절
        }
        console.log('[Bridge] toggle_metronome');
        break;
      case 'speak':
        // Step 9: VoiceAlertModule.speak(msg.text)
        console.log('[Bridge] speak:', msg.text);
        break;
    }
  }, []);

  // safe area 패딩을 WebView에 CSS 변수로 주입
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
        style={[styles.webview, {backgroundColor: '#070d1f'}]}
        originWhitelist={['*']}
        onMessage={handleMessage}
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
    backgroundColor: '#070d1f',
  },
  webview: {
    flex: 1,
  },
});

export default App;
