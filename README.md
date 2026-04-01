# Cadence Runner

케이던스 메트로놈 러닝앱. 달리기 중 목표 케이던스(SPM)에 맞춰 메트로놈 클릭을 제공하고, 실시간 케이던스를 측정합니다.

## Architecture

React Native bare workflow + WebView hybrid 구조입니다.

```
packages/
├── web/       # React + Vite + Tailwind (UI 전체)
├── mobile/    # React Native WebView shell + Native Modules
└── shared/    # Bridge 타입, 상수
```

- **UI**: Vite 웹앱을 WebView에서 렌더링 (HMR 지원)
- **Native**: Swift Turbo Module로 하드웨어 접근 (메트로놈, 만보기, TTS)
- **Bridge**: `postMessage` 양방향 통신, TypeScript 타입 공유

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Bundler | Vite 8 |
| Mobile Shell | React Native 0.84 (New Architecture) |
| Audio Engine | AVAudioEngine (Swift Turbo Module) |
| Monorepo | pnpm workspaces |

## Design System

"The Kinetic Pulse" - 고성능 러닝 HUD 콘셉트.

- **Primary**: Emerald Green (`#69f6b8`) on Deep Navy (`#070d1f`)
- **Typography**: Space Grotesk (headings) + Geist (body)
- **Rule**: No 1px borders. 배경색 차이로만 영역 구분

자세한 내용은 [DESIGN.md](./DESIGN.md)를 참고하세요.

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 9
- Xcode (iOS 빌드)
- CocoaPods (`bundle install`로 설치)

### Setup

```bash
# 의존성 설치
pnpm install

# iOS Pod 설치
cd packages/mobile && bundle install
cd ios && bundle exec pod install && cd ..

# 개발 서버 시작 (2개 터미널)
pnpm web:dev          # Vite dev server (port 5173)
pnpm mobile:start     # Metro bundler (port 8081)

# iOS 시뮬레이터 실행
pnpm mobile:ios
```

### 실기기 테스트

1. `packages/mobile/App.tsx`의 `DEV_SERVER_HOST`를 Mac의 LAN IP로 변경
2. Xcode에서 signing team 설정
3. `npx react-native run-ios --device "기기이름"`
4. 아이폰: 설정 > 일반 > VPN 및 기기 관리 > 개발자 프로필 신뢰

## Project Structure

```
packages/mobile/
├── App.tsx                          # WebView shell + bridge 메시지 라우팅
├── specs/NativeMetronome.ts         # Turbo Module JS spec
├── ios/CadenceRunner/
│   ├── MetronomeEngine.swift        # AVAudioEngine 메트로놈 (1kHz click)
│   ├── RCTNativeMetronome.mm        # ObjC++ Turbo Module wrapper
│   └── RCTNativeMetronome.h
└── metro.config.js                  # pnpm monorepo 호환 설정

packages/web/
├── src/
│   ├── pages/ActiveRun.tsx          # 메인 러닝 화면 (BPM, 메트릭)
│   ├── pages/Stats.tsx              # 통계
│   ├── pages/Settings.tsx           # 설정
│   ├── components/layout/           # Header, BottomNav, AppShell
│   └── index.css                    # Design system tokens
└── index.html                       # viewport-fit=cover (safe area)

packages/shared/
└── src/bridge.ts                    # postToNative(), onNativeMessage(), 타입
```

## Roadmap

- [x] React Native bare 프로젝트 초기화 + WebView 설정
- [x] MetronomeModule (Swift, AVAudioEngine)
- [ ] postMessage 브릿지 연결 (웹 UI ↔ Native)
- [ ] CadenceModule (Swift, CMPedometer)
- [ ] VoiceAlertModule (Swift, AVSpeechSynthesizer)
- [ ] 실기기 통합 테스트
- [ ] GitHub push + CI

## License

MIT
