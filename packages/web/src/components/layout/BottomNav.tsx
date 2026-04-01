import { Activity, History, BarChart3, Settings } from "lucide-react";

const tabs = [
  { id: "run", label: "Run", icon: Activity },
  { id: "history", label: "History", icon: History },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-4 px-4 bg-slate-900/90 backdrop-blur-xl rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)]" style={{ paddingBottom: 'calc(0.5rem + var(--sab))' }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 ${
              isActive
                ? "text-primary drop-shadow-[0_0_12px_rgba(52,211,153,0.6)] scale-110"
                : "text-slate-500 hover:text-emerald-200"
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="font-heading text-[10px] font-bold tracking-widest uppercase">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
