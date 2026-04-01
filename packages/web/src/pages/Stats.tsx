import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Route, Timer, Brain } from "lucide-react";

const personalBests = [
  { label: "Fastest 5k", value: "19:42", color: "border-l-primary" },
  { label: "Max Cadence", value: "204", unit: "SPM", color: "border-l-secondary" },
  { label: "Longest Run", value: "22.4", unit: "KM", color: "border-l-tertiary" },
  { label: "Elevation", value: "842", unit: "M", color: "border-l-primary" },
];

const months = [
  { name: "Jan", h: 60, active: false },
  { name: "Feb", h: 75, active: false },
  { name: "Mar", h: 85, active: true, color: "bg-primary shadow-[0_0_15px_rgba(105,246,184,0.3)]" },
  { name: "Apr", h: 65, active: false },
  { name: "May", h: 80, active: false },
  { name: "Jun", h: 92, active: true, color: "bg-secondary shadow-[0_0_15px_rgba(90,252,210,0.3)]" },
];

const sessions = [
  { title: "Interval Sprint Session", day: "Tuesday", dist: "6.4 km", spm: "188", icon: Zap, iconColor: "text-primary" },
  { title: "Morning Endurance", day: "Sunday", dist: "12.1 km", spm: "174", icon: Route, iconColor: "text-tertiary" },
  { title: "Recovery Jog", day: "Friday", dist: "4.2 km", spm: "165", icon: Timer, iconColor: "text-secondary" },
];

export function Stats() {
  return (
    <div className="px-6 space-y-8 max-w-5xl mx-auto">
      {/* Hero Metric */}
      <section className="mt-8">
        <p className="font-heading text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
          Lifetime Average
        </p>
        <div className="flex items-baseline gap-4">
          <h2 className="font-heading text-6xl md:text-8xl font-bold text-primary leading-none">178</h2>
          <span className="font-heading text-xl text-on-surface-variant tracking-widest uppercase">SPM</span>
        </div>
        <p className="text-secondary mt-4 flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          +4% from last month
        </p>
      </section>

      {/* Personal Bests */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {personalBests.map((pb) => (
          <Card key={pb.label} className={`bg-surface-container-low border-0 border-l-2 ${pb.color}`}>
            <CardContent className="p-5">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{pb.label}</p>
              <p className="font-heading text-2xl font-bold">
                {pb.value}
                {pb.unit && <span className="text-xs font-normal opacity-60 ml-1">{pb.unit}</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Monthly Chart + Consistency */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-surface-container border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="font-heading text-xl font-bold">Monthly Cadence</h3>
                <p className="text-xs text-on-surface-variant">Step frequency consistency over 6 months</p>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 gap-3">
              {months.map((m) => (
                <div key={m.name} className="flex flex-col items-center flex-1 gap-2">
                  <div
                    className={`w-full rounded-t-lg ${m.color || "bg-surface-container-highest"}`}
                    style={{ height: `${m.h}%` }}
                  />
                  <span className={`text-[9px] uppercase tracking-tighter ${m.active ? "text-primary" : "text-on-surface-variant"}`}>
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary-container border-0 text-on-primary-container">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-heading font-bold text-lg mb-1 italic">VIBRANCY</h3>
              <p className="text-xs opacity-80">
                You've maintained a 180+ SPM rhythm for 85% of your recent sessions.
              </p>
            </div>
            <div className="mt-8">
              <p className="text-4xl font-bold font-heading">85%</p>
              <div className="w-full bg-on-primary-container/20 h-1.5 rounded-full mt-2">
                <div className="bg-on-primary-container h-full w-[85%] rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Sessions */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-heading text-lg font-bold tracking-tight">Recent Sessions</h3>
          <Badge variant="outline" className="text-primary border-0 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:underline">
            View All
          </Badge>
        </div>
        {sessions.map((s) => (
          <Card key={s.title} className="bg-surface-container-low hover:bg-surface-container transition-all border-0 cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div className="flex-grow">
                <p className="font-bold text-sm">{s.title}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                  {s.day} · {s.dist}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-heading font-bold ${s.iconColor}`}>{s.spm}</p>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-tighter">Avg SPM</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Insight Card */}
      <Card className="bg-surface-container-high border-0 rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <Brain className="w-8 h-8 text-secondary mb-4" />
          <h3 className="font-heading text-2xl font-bold text-on-surface leading-tight mb-3">
            Your Sweet Spot
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Data shows your most efficient energy output occurs at{" "}
            <span className="text-primary font-bold">182 SPM</span>. Focus on maintaining this
            rhythm during tomorrow's interval set.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
