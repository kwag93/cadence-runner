import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Timer, Mic, PauseCircle } from "lucide-react";
import { useState } from "react";

const soundTypes = ["Click", "Woodblock", "Digital"] as const;

export function SettingsPage() {
  const [bpm, setBpm] = useState(180);
  const [selectedSound, setSelectedSound] = useState<string>("Click");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [deviation, setDeviation] = useState(10);
  const [cooldown, setCooldown] = useState(15);
  const [autoPause, setAutoPause] = useState(60);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-8">
      {/* Metronome */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Timer className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold font-heading tracking-tight text-on-surface uppercase">
            Metronome
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-surface-container border-outline-variant/30">
            <CardContent className="p-6 flex flex-col justify-between min-h-[180px]">
              <div className="flex justify-between items-start">
                <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs">
                  BPM Range
                </label>
                <span className="text-3xl font-black text-primary font-heading">{bpm}</span>
              </div>
              <div className="mt-4">
                <Slider
                  value={[bpm]}
                  onValueChange={(v) => setBpm(Array.isArray(v) ? v[0] : v)}
                  min={30}
                  max={300}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-heading text-outline mt-2">
                  <span>30 BPM</span>
                  <span>300 BPM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container border-outline-variant/30">
            <CardContent className="p-6">
              <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs block mb-4">
                Sound Type
              </label>
              <div className="space-y-2">
                {soundTypes.map((sound) => (
                  <button
                    key={sound}
                    onClick={() => setSelectedSound(sound)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg font-bold min-h-[56px] transition-all ${
                      selectedSound === sound
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-variant text-on-surface-variant hover:bg-surface-bright"
                    }`}
                  >
                    <span>{sound}</span>
                    {selectedSound === sound && (
                      <span className="text-on-primary-container">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Voice Alert */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold font-heading tracking-tight text-on-surface uppercase">
              Voice Alert
            </h2>
          </div>
          <Switch
            checked={voiceEnabled}
            onCheckedChange={setVoiceEnabled}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-surface-container border-outline-variant/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs block">
                    Deviation Threshold
                  </label>
                  <p className="text-[10px] text-outline mt-1">Trigger alert when cadence drifts</p>
                </div>
                <span className="text-2xl font-black text-tertiary font-heading">
                  ±{deviation}<span className="text-sm font-medium ml-1">SPM</span>
                </span>
              </div>
              <Slider
                value={[deviation]}
                onValueChange={(v) => setDeviation(Array.isArray(v) ? v[0] : v)}
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
                    Cooldown Timer
                  </label>
                  <p className="text-[10px] text-outline mt-1">Wait time between alerts</p>
                </div>
                <span className="text-2xl font-black text-on-surface font-heading">
                  {cooldown}<span className="text-sm font-medium ml-1">sec</span>
                </span>
              </div>
              <Slider
                value={[cooldown]}
                onValueChange={(v) => setCooldown(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={30}
                step={1}
              />
              <div className="flex justify-between text-[10px] font-heading text-outline mt-2">
                <span>10s</span>
                <span>30s</span>
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
            Auto-pause
          </h2>
        </div>
        <Card className="bg-surface-container border-outline-variant/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <label className="font-heading text-on-surface-variant font-bold uppercase tracking-wider text-xs block mb-1">
                  SPM Threshold
                </label>
                <p className="text-sm text-outline mb-6">
                  Pause the session automatically when your cadence drops below this limit.
                </p>
                <Slider
                  value={[autoPause]}
                  onValueChange={(v) => setAutoPause(Array.isArray(v) ? v[0] : v)}
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
                <span className="text-5xl font-black text-error font-heading">{autoPause}</span>
                <span className="text-xs font-heading font-bold text-outline-variant uppercase">Threshold</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
