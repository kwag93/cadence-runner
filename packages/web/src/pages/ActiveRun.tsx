import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, Music, StopCircle } from "lucide-react";

export function ActiveRun() {
  return (
    <div className="px-6 flex flex-col items-center">
      {/* Elapsed Time */}
      <div className="w-full flex flex-col items-center mt-4">
        <Badge variant="outline" className="mb-4 bg-surface-container-high border-outline-variant/30 text-on-surface-variant font-heading font-bold tracking-wider text-sm px-4 py-1.5 rounded-full">
          ELAPSED TIME
        </Badge>
        <div className="text-5xl font-black font-heading tracking-tighter text-on-surface">
          12:42
        </div>
      </div>

      {/* Hero SPM */}
      <div className="relative w-full max-w-sm aspect-square flex flex-col items-center justify-center mt-6">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-primary/20 rounded-full active-pulse" />
          <div className="absolute w-80 h-80 border border-primary/10 rounded-full" />
        </div>
        <div className="z-10 flex flex-col items-center">
          <div className="flex items-start">
            <span className="text-[140px] font-black font-heading leading-none text-primary glow-emerald tracking-tighter">
              172
            </span>
            <Badge className="bg-primary/20 text-primary border-primary/30 mt-8 ml-2 text-lg font-bold">
              +2
            </Badge>
          </div>
          <div className="flex flex-col items-center -mt-4">
            <span className="font-heading text-xl font-bold text-primary tracking-[0.2em] uppercase">
              SPM
            </span>
            <Badge variant="outline" className="mt-4 bg-surface-container-low border-outline-variant/20 text-on-surface-variant rounded-full gap-2">
              <Flag className="w-3 h-3" />
              Target: 170 SPM
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 w-full mt-8">
        {[
          { label: "Time", value: "24:12" },
          { label: "Distance", value: "4.82", unit: "KM" },
          { label: "Avg Pace", value: "5:02", unit: "/KM" },
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
                <span className="w-2 h-2 bg-primary rounded-full active-pulse" />
                <p className="text-sm text-primary font-medium">Currently Pulsing</p>
              </div>
            </div>
          </div>
          <Switch defaultChecked className="data-[state=checked]:bg-primary" />
        </CardContent>
      </Card>

      {/* Stop Button */}
      <Button
        variant="destructive"
        size="lg"
        className="w-full mt-10 bg-error-dim hover:bg-error text-white font-black font-heading py-6 rounded-3xl text-xl tracking-widest uppercase shadow-lg shadow-error/20 active:scale-[0.98] h-auto"
      >
        <StopCircle className="w-6 h-6 mr-2" />
        STOP RUN
      </Button>
    </div>
  );
}
