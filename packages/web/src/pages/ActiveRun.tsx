import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, Music, Play, StopCircle } from "lucide-react";
import { useWorkout } from "@/hooks/useWorkout";
import { formatTime } from "@/lib/format";

export function ActiveRun() {
  const {
    isRunning, elapsedSeconds, currentSpm, targetBpm,
    metronomeOn, deviation,
    startWorkout, stopWorkout, toggleMetronome,
  } = useWorkout();

  const deviationSign = deviation > 0 ? '+' : '';
  const displaySpm = isRunning ? currentSpm : 0;

  return (
    <div className="px-6 flex flex-col items-center">
      {/* Elapsed Time */}
      <div className="w-full flex flex-col items-center mt-4">
        <Badge variant="outline" className="mb-4 bg-surface-container-high border-outline-variant/30 text-on-surface-variant font-heading font-bold tracking-wider text-sm px-4 py-1.5 rounded-full">
          {isRunning ? 'ELAPSED TIME' : 'READY'}
        </Badge>
        <div className="text-5xl font-black font-heading tracking-tighter text-on-surface">
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Hero SPM */}
      <div className="relative w-full max-w-sm aspect-square flex flex-col items-center justify-center mt-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-64 h-64 border-2 border-primary/20 rounded-full ${isRunning ? 'active-pulse' : ''}`} />
          <div className="absolute w-80 h-80 border border-primary/10 rounded-full" />
        </div>
        <div className="z-10 flex flex-col items-center">
          <div className="flex items-start">
            <span className="text-[140px] font-black font-heading leading-none text-primary glow-emerald tracking-tighter">
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
            <Badge variant="outline" className="mt-4 bg-surface-container-low border-outline-variant/20 text-on-surface-variant rounded-full gap-2">
              <Flag className="w-3 h-3" />
              Target: {targetBpm} SPM
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 w-full mt-8">
        {[
          { label: "Time", value: formatTime(elapsedSeconds) },
          { label: "Distance", value: "—", unit: "KM" },
          { label: "Avg Pace", value: "—", unit: "/KM" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-surface-container-low border-transparent">
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-xs font-heading font-bold text-on-surface-variant uppercase mb-1">
                {stat.label}
              </span>
              <span className="text-xl font-black font-heading">
                {stat.value}
                {stat.unit && <span className="text-xs ml-1 text-on-surface-variant">{stat.unit}</span>}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metronome Card */}
      <Card className="w-full mt-6 bg-surface-container-high/60 backdrop-blur-xl border-transparent rounded-[2rem]">
        <CardContent className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface">Metronome</h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${metronomeOn ? 'bg-primary active-pulse' : 'bg-on-surface-variant/30'}`} />
                <p className={`text-sm font-medium ${metronomeOn ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {metronomeOn ? `${targetBpm} BPM` : 'Off'}
                </p>
              </div>
            </div>
          </div>
          <Switch
            checked={metronomeOn}
            onCheckedChange={toggleMetronome}
            className="data-[state=checked]:bg-primary"
          />
        </CardContent>
      </Card>

      {/* Start / Stop Button */}
      {isRunning ? (
        <Button
          onClick={stopWorkout}
          variant="destructive"
          size="lg"
          className="w-full mt-10 bg-error-dim hover:bg-error text-white font-black font-heading py-6 rounded-3xl text-xl tracking-widest uppercase shadow-lg shadow-error/20 active:scale-[0.98] h-auto"
        >
          <StopCircle className="w-6 h-6 mr-2" />
          STOP RUN
        </Button>
      ) : (
        <Button
          onClick={startWorkout}
          size="lg"
          className="w-full mt-10 bg-gradient-to-br from-primary to-primary-container text-on-primary font-black font-heading py-6 rounded-3xl text-xl tracking-widest uppercase shadow-lg shadow-primary/20 active:scale-[0.98] h-auto"
        >
          <Play className="w-6 h-6 mr-2" />
          START RUN
        </Button>
      )}
    </div>
  );
}
