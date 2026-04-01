import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Gauge, Zap, Save } from "lucide-react";

const cadenceBars = [40, 60, 50, 85, 90, 35, 80, 95, 88, 30, 70, 92, 94, 60, 40, 80, 100, 89, 91, 76];

const zones = [
  { label: "On Target", pct: "82%", color: "bg-primary" },
  { label: "Warning", pct: "12%", color: "bg-tertiary" },
  { label: "Off Target", pct: "6%", color: "bg-error-dim" },
];

export function PostRunSummary() {
  return (
    <div className="px-4 max-w-xl mx-auto space-y-6">
      {/* Hero Map */}
      <section className="relative h-48 w-full rounded-xl overflow-hidden shadow-2xl bg-surface-container">
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest">
            Morning Session
          </p>
          <h2 className="text-2xl font-bold text-on-surface">City Perimeter Run</h2>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2 bg-surface-container-high border-outline-variant relative overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest mb-1">
              Distance
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black text-primary tracking-tighter">4.82</span>
              <span className="text-2xl font-bold text-primary-dim">km</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-high border-outline-variant">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-secondary" />
              <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest">
                Total Time
              </p>
            </div>
            <p className="text-3xl font-bold text-on-surface">24:12</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-high border-outline-variant">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-tertiary" />
              <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest">
                Avg Pace
              </p>
            </div>
            <p className="text-3xl font-bold text-on-surface">
              5:02<span className="text-sm font-medium text-on-surface-variant ml-1">/km</span>
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 bg-surface-container-highest border-primary/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-heading text-xs uppercase tracking-widest mb-1">
                Average Cadence
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-primary">171</span>
                <span className="text-lg font-bold text-primary-dim">SPM</span>
              </div>
            </div>
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary fill-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cadence Chart */}
      <Card className="bg-surface-container border-outline-variant">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-on-surface">Cadence Analysis</h3>
            <Badge className="bg-primary/10 text-primary-dim border-0 text-xs">
              Target: 170-175
            </Badge>
          </div>
          <div className="relative h-40 w-full flex items-end gap-1 px-1">
            {cadenceBars.map((h, i) => {
              const color = h >= 80 ? "bg-primary" : h >= 50 ? "bg-primary/60" : h >= 35 ? "bg-tertiary/60" : "bg-error-dim/60";
              return <div key={i} className={`${color} w-full rounded-t-sm`} style={{ height: `${h}%` }} />;
            })}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-heading text-on-surface-variant uppercase tracking-widest">
            <span>Start</span>
            <span>Mile 2</span>
            <span>Finish</span>
          </div>
          <div className="mt-6 flex justify-between gap-2">
            {zones.map((z) => (
              <div key={z.label} className="flex-1 flex flex-col items-center p-2 rounded bg-surface-container-low border border-outline-variant/30">
                <div className={`w-2 h-2 rounded-full ${z.color} mb-1`} />
                <span className="text-[10px] text-on-surface-variant">{z.label}</span>
                <span className="text-sm font-bold">{z.pct}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4 pt-4 mb-10">
        <Button className="w-full bg-primary hover:bg-primary-dim text-on-primary font-black py-4 rounded-xl text-lg h-auto shadow-lg">
          <Save className="w-5 h-5 mr-2" />
          Save Run
        </Button>
        <Button variant="ghost" className="w-full text-on-surface-variant font-bold">
          Discard
        </Button>
      </div>
    </div>
  );
}
