import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Flag, Music, Play, StopCircle, RotateCcw, Minus, Plus, Heart } from "lucide-react";
import { useWorkout } from "@/hooks/useWorkout";
import { formatTime } from "@/lib/format";
import { BPM_MIN, BPM_MAX, getHeartRateZone, HR_ZONE_NAMES, HR_ZONE_COLORS } from "@cadence-runner/shared";
import type { UserSettings, WorkoutSession } from "@cadence-runner/shared";

interface ActiveRunProps {
  settings: UserSettings;
  onRunComplete: (session: WorkoutSession) => void;
}

export function ActiveRun({ settings, onRunComplete }: ActiveRunProps) {
  const {
    isRunning, isPaused, elapsedSeconds, currentSpm, targetBpm,
    metronomeOn, deviation, heartRate,
    startWorkout, stopWorkout, resumeWorkout, setMetronome, setTargetBpm, speak,
  } = useWorkout({ settings });

  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // 카운트다운 클린업
  useEffect(() => {
    return () => clearInterval(countdownRef.current);
  }, []);

  const handleStart = useCallback(() => {
    clearInterval(countdownRef.current);
    setCountdown(3);
    speak('3');

    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        speak(String(count));
      } else {
        clearInterval(countdownRef.current);
        setCountdown(null);
        speak('시작!');
        startWorkout();
      }
    }, 1000);
  }, [startWorkout, speak]);

  const handleStop = () => {
    const session = stopWorkout();
    if (session) {
      onRunComplete(session);
    }
  };

  const deviationSign = deviation > 0 ? '+' : '';
  const displaySpm = isRunning ? currentSpm : 0;
  const hrZone = heartRate > 0 && settings.age > 0 ? getHeartRateZone(heartRate, settings.age) : null;
  const hrZoneColor = hrZone ? HR_ZONE_COLORS[hrZone] : '';
  const hrZoneName = hrZone ? HR_ZONE_NAMES[hrZone] : '';

  return (
    <div className="px-6 pb-4 flex flex-col items-center">
      {/* Elapsed Time */}
      <div className="w-full flex flex-col items-center mt-2">
        <Badge variant="outline" className="mb-2 bg-surface-container-high border-outline-variant/30 text-on-surface-variant font-heading font-bold tracking-wider text-sm px-4 py-1 rounded-full">
          {countdown !== null ? '준비' : isPaused ? '일시정지' : isRunning ? '경과 시간' : '대기 중'}
        </Badge>
        <div className={`text-4xl font-black font-heading tracking-tighter ${isPaused ? 'text-tertiary animate-pulse' : 'text-on-surface'}`}>
          {countdown !== null ? '' : formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Hero SPM / Countdown */}
      <div className="relative w-full max-w-sm h-[220px] flex flex-col items-center justify-center mt-2">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-48 h-48 border-2 border-primary/20 rounded-full ${isRunning && !isPaused ? 'active-pulse' : ''}`} />
          <div className="absolute w-64 h-64 border border-primary/10 rounded-full" />
        </div>
        <div className="z-10 flex flex-col items-center">
          {countdown !== null ? (
            <span className="text-[110px] font-black font-heading leading-none text-primary glow-emerald tracking-tighter animate-pulse">
              {countdown}
            </span>
          ) : (
            <>
              <div className="flex items-start">
                <span className="text-[100px] font-black font-heading leading-none text-primary glow-emerald tracking-tighter">
                  {displaySpm}
                </span>
                {isRunning && deviation !== 0 && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 mt-8 ml-2 text-lg font-bold">
                    {deviationSign}{deviation}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col items-center -mt-4">
                <span className="font-heading text-xl font-bold text-primary tracking-[0.2em] uppercase">
                  SPM
                </span>
                <Badge variant="outline" className="mt-2 bg-surface-container-low border-outline-variant/20 text-on-surface-variant rounded-full gap-2">
                  <Flag className="w-3 h-3" />
                  목표: {targetBpm} SPM
                </Badge>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${heartRate > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 w-full mt-3`}>
        {[
          { label: "시간", value: formatTime(elapsedSeconds) },
          { label: "목표", value: String(targetBpm), unit: "BPM" },
          { label: "편차", value: isRunning ? `${deviation > 0 ? '+' : ''}${deviation}` : "0", unit: "SPM" },
          ...(heartRate > 0 ? [{ label: hrZone ? `Z${hrZone} ${hrZoneName}` : "심박", value: String(heartRate), unit: "BPM", icon: true }] : []),
        ].map((stat) => (
          <Card key={stat.label} className="bg-surface-container-low border-transparent">
            <CardContent className="p-3 flex flex-col items-center">
              <span className="text-xs font-heading font-bold text-on-surface-variant uppercase mb-0.5 flex items-center gap-1">
                {'icon' in stat && <Heart className={`w-3 h-3 ${hrZoneColor || 'text-red-500'}`} />}
                {stat.label}
              </span>
              <span className="text-lg font-black font-heading">
                {stat.value}
                {stat.unit && <span className="text-xs ml-1 text-on-surface-variant">{stat.unit}</span>}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metronome Card */}
      <Card className="w-full mt-3 bg-surface-container-high/60 backdrop-blur-xl border-transparent rounded-2xl">
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">메트로놈</h3>
                <p className={`text-xs font-medium ${metronomeOn ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {metronomeOn ? `${targetBpm} BPM` : '꺼짐'}
                </p>
              </div>
            </div>
            <Switch
              checked={metronomeOn}
              onCheckedChange={setMetronome}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          {/* BPM 슬라이더 */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setTargetBpm(Math.max(BPM_MIN, targetBpm - 5))}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-90 transition-transform"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <Slider
              value={[targetBpm]}
              onValueChange={(v) => setTargetBpm(Array.isArray(v) ? v[0] : v)}
              min={BPM_MIN}
              max={BPM_MAX}
              step={1}
              className="flex-1"
            />
            <button
              onClick={() => setTargetBpm(Math.min(BPM_MAX, targetBpm + 5))}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-90 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Start / Stop / Resume Buttons */}
      {countdown !== null ? (
        <Button
          disabled
          size="lg"
          className="w-full mt-4 bg-surface-container text-on-surface-variant font-black font-heading py-4 rounded-2xl text-lg tracking-widest uppercase h-auto opacity-60"
        >
          시작하는 중...
        </Button>
      ) : isPaused ? (
        <div className="w-full mt-4 flex gap-3">
          <Button
            onClick={resumeWorkout}
            size="lg"
            className="flex-1 bg-gradient-to-br from-primary to-primary-container text-on-primary font-black font-heading py-4 rounded-2xl text-lg tracking-widest uppercase shadow-lg shadow-primary/20 active:scale-[0.98] h-auto"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            이어하기
          </Button>
          <Button
            onClick={handleStop}
            variant="destructive"
            size="lg"
            className="flex-1 bg-error-dim hover:bg-error text-white font-black font-heading py-4 rounded-2xl text-lg tracking-widest uppercase shadow-lg shadow-error/20 active:scale-[0.98] h-auto"
          >
            <StopCircle className="w-6 h-6 mr-2" />
            종료
          </Button>
        </div>
      ) : isRunning ? (
        <Button
          onClick={handleStop}
          variant="destructive"
          size="lg"
          className="w-full mt-4 bg-error-dim hover:bg-error text-white font-black font-heading py-4 rounded-2xl text-lg tracking-widest uppercase shadow-lg shadow-error/20 active:scale-[0.98] h-auto"
        >
          <StopCircle className="w-6 h-6 mr-2" />
          러닝 중지
        </Button>
      ) : (
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full mt-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-black font-heading py-4 rounded-2xl text-lg tracking-widest uppercase shadow-lg shadow-primary/20 active:scale-[0.98] h-auto"
        >
          <Play className="w-6 h-6 mr-2" />
          러닝 시작
        </Button>
      )}
    </div>
  );
}
