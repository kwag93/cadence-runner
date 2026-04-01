import React, {useCallback, useRef} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {WebView, type WebViewMessageEvent} from 'react-native-webview';
import {BPM_DEFAULT, type WebMessage} from '@cadence-runner/shared';
import NativeMetronome from './specs/NativeMetronome';

const SURFACE_BG = '#070d1f';

// 개발: Vite dev server, 프로덕션: 번들된 HTML
// 실기기: Mac의 LAN IP로 변경 필요 (e.g. 192.168.x.x)
const DEV_SERVER_HOST = Platform.select({
  ios: 'localhost',
  android: '10.0.2.2',
})!;
const DEV_PORT = 5173;
const DEV_URL = `http://${DEV_SERVER_HOST}:${DEV_PORT}`;

const WEB_URL = __DEV__ ? DEV_URL : 'file:///android_asset/web/index.html';

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

  /** WebView → Native 메시지 수신 */
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    let msg: WebMessage;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'start_workout':
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
          NativeMetronome.start(BPM_DEFAULT);
        }
        console.log('[Bridge] toggle_metronome');
        break;
      case 'speak':
        console.log('[Bridge] speak:', msg.text);
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
