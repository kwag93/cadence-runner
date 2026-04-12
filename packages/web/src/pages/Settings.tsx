import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Timer, Mic, PauseCircle, Vibrate } from "lucide-react";
import { BPM_MIN, BPM_MAX } from "@cadence-runner/shared";
import type { UserSettings, SoundType } from "@cadence-runner/shared";

const soundTypes: SoundType[] = ["Click", "Woodblock", "Digital"];
const soundTypeLabels: Record<SoundType, string> = {
  Click: "클릭",
  Woodblock: "우드블록",
  Digital: "디지털",
};

interface SettingsPageProps {
  settings: UserSettings;
  onUpdate: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
}

export function SettingsPage({ settings, onUpdate }: SettingsPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-8">
      {/* Metronome */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Timer className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold font-heading tracking-tight text-on-surface uppercase">
            메트로놈
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-surface-container border-outline-variant/30">
            <CardContent className="p-6 flex flex-col justify-between min-h-[180px]">
              <div className="flex justify-between items-start">
                <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs">
                  BPM 범위
                </label>
                <span className="text-3xl font-black text-primary font-heading">{settings.targetBpm}</span>
              </div>
              <div className="mt-4">
                <Slider
                  value={[settings.targetBpm]}
                  onValueChange={(v) => onUpdate('targetBpm', Array.isArray(v) ? v[0] : v)}
                  min={BPM_MIN}
                  max={BPM_MAX}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-heading text-outline mt-2">
                  <span>{BPM_MIN} BPM</span>
                  <span>{BPM_MAX} BPM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-outline-variant/30">
            <CardContent className="p-6">
              <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs block mb-4">
                사운드 종류
              </label>
              <div className="space-y-2">
                {soundTypes.map((sound) => (
                  <button
                    key={sound}
                    onClick={() => onUpdate('soundType', sound)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg font-bold min-h-[56px] transition-all ${
                      settings.soundType === sound
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-variant text-on-surface-variant hover:bg-surface-bright"
                    }`}
                  >
                    <span>{soundTypeLabels[sound] ?? sound}</span>
                    {settings.soundType === sound && (
                      <span className="text-on-primary-container">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Haptic Feedback */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vibrate className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold font-heading tracking-tight text-on-surface uppercase">
              진동
            </h2>
          </div>
          <Switch
            checked={settings.hapticEnabled}
            onCheckedChange={(v) => onUpdate('hapticEnabled', v)}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <p className="text-sm text-outline">
          메트로놈 박자를 진동으로 느낄 수 있습니다 — 음악과 함께 달릴 때 유용합니다.
        </p>
      </section>

      {/* Voice Alert */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold font-heading tracking-tight text-on-surface uppercase">
              음성 알림
            </h2>
          </div>
          <Switch
            checked={settings.voiceEnabled}
            onCheckedChange={(v) => onUpdate('voiceEnabled', v)}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-surface-container border-outline-variant/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs block">
                    편차 임계값
                  </label>
                  <p className="text-[10px] text-outline mt-1">케이던스가 벗어나면 알림 발생</p>
                </div>
                <span className="text-2xl font-black text-tertiary font-heading">
                  ±{settings.deviationThreshold}<span className="text-sm font-medium ml-1">SPM</span>
                </span>
              </div>
              <Slider
                value={[settings.deviationThreshold]}
                onValueChange={(v) => onUpdate('deviationThreshold', Array.isArray(v) ? v[0] : v)}
                min={5}
                max={20}
                step={1}
              />
              <div className="flex justify-between text-[10px] font-heading text-outline mt-2">
                <span>±5 SPM</span>
                <span>±20 SPM</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-outline-variant/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs block">
                    알림 간격
                  </label>
                  <p className="text-[10px] text-outline mt-1">알림 사이 대기 시간</p>
                </div>
                <span className="text-2xl font-black text-on-surface font-heading">
                  {settings.cooldownSeconds}<span className="text-sm font-medium ml-1">초</span>
                </span>
              </div>
              <Slider
                value={[settings.cooldownSeconds]}
                onValueChange={(v) => onUpdate('cooldownSeconds', Array.isArray(v) ? v[0] : v)}
                min={10}
                max={30}
                step={1}
              />
              <div className="flex justify-between text-[10px] font-heading text-outline mt-2">
                <span>10초</span>
                <span>30초</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Auto-Pause */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <PauseCircle className="w-6 h-6 text-error" />
          <h2 className="text-2xl font-bold font-heading tracking-tight text-on-surface uppercase">
            자동 일시정지
          </h2>
        </div>
        <Card className="bg-surface-container border-outline-variant/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs block mb-1">
                  SPM 임계값
                </label>
                <p className="text-sm text-outline mb-6">
                  케이던스가 이 값 아래로 떨어지면 자동으로 세션을 일시정지합니다.
                </p>
                <Slider
                  value={[settings.autoPauseThreshold]}
                  onValueChange={(v) => onUpdate('autoPauseThreshold', Array.isArray(v) ? v[0] : v)}
                  min={30}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-[10px] font-heading text-outline mt-2">
                  <span>30 SPM</span>
                  <span>100 SPM</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-surface-variant rounded-2xl p-6 min-w-[140px] border border-outline-variant/50">
                <span className="text-5xl font-black text-error font-heading">{settings.autoPauseThreshold}</span>
                <span className="text-xs font-heading font-bold text-outline-variant uppercase">임계값</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
