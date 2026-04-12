# HANDOFF: Cadence Runner — 현재 상태

## 구현 완료

### 데이터 레이어
- `packages/shared/src/types.ts` — WorkoutSession, UserSettings, SpmSample 타입
- `packages/web/src/lib/storage.ts` — localStorage CRUD (200세션 제한, QuotaExceededError 핸들링)
- `packages/web/src/lib/format.ts` — formatTime, formatDuration, formatDate, formatTimeOfDay, formatDateTime

### 훅
- `useSettings` — 설정 localStorage 영속화 (targetBpm, soundType, voiceEnabled, hapticEnabled, deviationThreshold, cooldownSeconds, autoPauseThreshold)
- `useHistory` — 운동 기록 CRUD
- `useWorkout` — 강화된 워크아웃 엔진:
  - SPM 샘플 수집 (초당)
  - 음성 알림 자동 트리거 (deviation 5초 지속 시 + cooldown)
  - 자동 일시정지 (SPM < threshold 3초 지속)
  - 운동 완료 시 자동 음성 요약
  - stopWorkout() → 완전한 WorkoutSession 반환

### 페이지
- `ActiveRun` — 3초 카운트다운 시작, 일시정지/재개 UI
- `History` — 리스트↔상세 이중 모드, 실 데이터 케이던스 차트
- `Stats` — 월별 평균, on-target 비율, 트렌드 분석
- `Settings` — 전 항목 영속화 (BPM, 사운드, 음성, 햅틱, 자동일시정지)

### 네이티브 (iOS)
- MetronomeEngine: AVAudioEngine + DispatchSourceTimer + **햅틱 피드백** + **Lock Screen Now Playing**
- CadenceEngine: CMPedometer + NSLock thread safety + **Screen Wake Lock**
- VoiceAlertEngine: AVSpeechSynthesizer (오디오 세션 충돌 수정 완료)
- Info.plist: UIBackgroundModes audio, NSMotionUsageDescription

### 안정성 수정
- crypto.randomUUID() 폴리필 (iOS 15 호환)
- localStorage overflow 방지 (200세션 제한 + 자동 압축)
- 카운트다운 중복 시작 방지
- timer 메모리 누수 방지 (로컬 변수 패턴)
- 브릿지 메시지 검증 강화
- 빈 NSLocationWhenInUseUsageDescription 제거

## 검증 상태

- `tsc -b`: PASS
- `vite build`: PASS
- `xcodebuild` (iPhone 17 Pro simulator): **BUILD SUCCEEDED**
- `eslint`: 기존 UI 컴포넌트 경고 3건만 잔존 (badge, button, toggle의 react-refresh 경고)

## Known Limitations

- Sound Type 선택지(Click/Woodblock/Digital)는 UI만 존재, 실제 사운드는 모두 1kHz sine wave
- GPS/거리/페이스 미지원 (설계상 SPM 중심)
- Android 네이티브 모듈 미구현
- Production URL 미설정 (번들 HTML 경로)
- HealthKit 연동 미구현

## 실기기 테스트 체크리스트

1. `App.tsx`의 `DEV_SERVER_HOST`를 Mac LAN IP로 변경
2. `vite.config.ts`에 `server: { host: true }` 확인
3. Xcode에서 signing team 설정
4. 아이폰 개발자 모드 + 프로필 신뢰
5. 테스트 항목:
   - [ ] START → 3초 카운트다운 → 메트로놈 재생 + 햅틱
   - [ ] SPM 실시간 표시 (실제 걸으며 확인)
   - [ ] 음성 알림 (target에서 크게 벗어났을 때)
   - [ ] 자동 일시정지 (멈추거나 천천히 걸을 때)
   - [ ] STOP → 음성 요약 → History에 세션 저장
   - [ ] History 리스트 → 세션 상세 → 케이던스 차트
   - [ ] Settings 변경 → 앱 재시작 → 설정 유지
   - [ ] 잠금화면 Now Playing 표시 + 재생/정지 제어
   - [ ] 백그라운드에서 메트로놈 계속 재생
   - [ ] 전화 수신 후 메트로놈 자동 재개
