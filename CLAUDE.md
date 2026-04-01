# Cadence Runner

케이던스 메트로놈 러닝앱. React Native + WebView hybrid.

## Architecture

```
packages/
├── web/       # React 19 + Vite 8 + Tailwind 4 (UI 전체)
├── mobile/    # RN 0.84 bare workflow (WebView shell + Native Modules)
└── shared/    # Bridge 타입, 상수 (양쪽에서 import)
```

- **UI**는 Vite 웹앱. WebView에서 렌더링. HMR 지원.
- **Native**는 Swift Turbo Module (New Architecture). 하드웨어 접근만 담당.
- **Bridge**는 `postMessage` 양방향. `@cadence-runner/shared`의 `WebMessage`/`NativeMessage` 타입으로 계약.

## Commands

```bash
pnpm install              # 의존성 설치
pnpm web:dev              # Vite dev server (port 5173)
pnpm mobile:start         # Metro bundler (port 8081)
pnpm mobile:ios           # iOS 시뮬레이터 실행

# iOS Pod 설치 (최초 1회 또는 native 의존성 변경 시)
cd packages/mobile && bundle install
cd ios && bundle exec pod install
```

## pnpm + Metro 호환

`.npmrc`에 `node-linker=hoisted` 필수. pnpm 기본 strict symlink 구조는 Metro가 resolve 못함.
`metro.config.js`에서 `watchFolders: [monorepoRoot]` + `nodeModulesPaths` 설정 필요.

## iOS Native Module 작성 규칙

### 새 파일은 Xcode 프로젝트에 등록

`.swift`, `.h`, `.mm` 파일을 수동 생성하면 Xcode의 Compile Sources에 자동 포함되지 않음.
반드시 `xcodeproj` gem 또는 Xcode UI로 추가해야 빌드에 포함됨.

```ruby
# 예시: bundle exec ruby -e '...'
require "xcodeproj"
proj = Xcodeproj::Project.open("ios/CadenceRunner.xcodeproj")
target = proj.targets.find { |t| t.name == "CadenceRunner" }
group = proj.main_group.find_subpath("CadenceRunner", true)
ref = group.new_file("CadenceRunner/NewFile.swift")
target.add_file_references([ref])
proj.save
```

### ObjC++ 파일에서 Swift 브릿지 import 순서

`CadenceRunner-Swift.h`는 앱의 모든 `@objc` Swift 클래스를 노출함.
`AppDelegate`가 RN 프레임워크 클래스를 상속하므로, React 헤더를 먼저 import해야 함:

```objc
// 올바른 순서:
#import <React/RCTBridgeModule.h>
#import <React-RCTAppDelegate/RCTAppDelegate.h>
#import "RCTNativeMetronome.h"        // spec header
#import "CadenceRunner-Swift.h"       // Swift 브릿지 (항상 마지막)
```

### Turbo Module codegen 헤더 경로

```objc
// 올바름 (2단계 경로):
#import <ReactCodegen/NativeMetronomeSpec/NativeMetronomeSpec.h>

// 틀림:
#import <ReactCodegen/NativeMetronomeSpec.h>
```

## WebView Safe Area

- `index.html`에 `viewport-fit=cover` 필수. 없으면 `env(safe-area-inset-*)` 값이 항상 0.
- RN `App.tsx`에서 `useSafeAreaInsets()` 값을 CSS 변수(`--sat`, `--sab`, `--sal`, `--sar`)로 주입.
- insets 변경 시 `useEffect`로 재주입 (phone call 배너, 회전 등).

## 실기기 테스트 체크리스트

1. `App.tsx`의 `DEV_SERVER_HOST`를 Mac LAN IP로 변경 (또는 env 변수)
2. `vite.config.ts`에 `server: { host: true }` 확인
3. `Info.plist`의 `NSAllowsArbitraryLoads: true` (개발 시만. 프로덕션에서는 제거)
4. 아이폰: 설정 → 개인정보 보호 및 보안 → **개발자 모드** 활성화
5. 아이폰: 설정 → 일반 → VPN 및 기기 관리 → 개발자 프로필 **신뢰**
6. Xcode에서 signing team 설정 (`DEVELOPMENT_TEAM`)

## Design System

"The Kinetic Pulse" — DESIGN.md 참고.

- Primary: `#69f6b8` (Emerald Green)
- Surface: `#070d1f` (Deep Navy)
- Typography: Space Grotesk (headings) + Geist Variable (body)
- **No-Line Rule**: 1px 보더 금지. 배경색 차이로만 영역 구분.
- Layout heights: `--header-height: 5rem`, `--bottomnav-height: 4rem` (index.css)

## Git Workflow

- GitHub remote. `gh` CLI 사용 (GitLab이 아님).
- main 브랜치에 직접 커밋 금지. feature 브랜치 → PR.
- 커밋 메시지: Conventional Commits (한국어 설명).

## Known Limitations (v0.1)

- MetronomeEngine은 DispatchSourceTimer 기반 (1~5ms 지터). 프로덕션에서는 AVAudioSourceNode 렌더 콜백으로 교체 필요.
- Production URL이 iOS에서 아직 미설정 (번들 HTML 경로 결정 필요).
- `originWhitelist={['*']}`은 개발용. 프로덕션에서 제한 필요.
