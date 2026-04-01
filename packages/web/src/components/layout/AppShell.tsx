import { useState } from "react";
import { Header } from "./Header";
import { BottomNav, type TabId } from "./BottomNav";
import { ActiveRun } from "@/pages/ActiveRun";
import { PostRunSummary } from "@/pages/PostRunSummary";
import { Stats } from "@/pages/Stats";
import { SettingsPage } from "@/pages/Settings";

const headerTitles: Record<TabId, string | undefined> = {
  run: undefined,
  history: "Run Complete",
  stats: undefined,
  settings: "Settings",
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("run");

  return (
    <div className="min-h-screen bg-surface">
      <Header title={headerTitles[activeTab]} />
      <main style={{ paddingTop: 'calc(6rem + var(--sat))', paddingBottom: 'calc(5rem + var(--sab))' }}>
        {activeTab === "run" && <ActiveRun />}
        {activeTab === "history" && <PostRunSummary />}
        {activeTab === "stats" && <Stats />}
        {activeTab === "settings" && <SettingsPage />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
