import { useState, useCallback } from "react";
import type { WorkoutSession } from "@cadence-runner/shared";
import { Header } from "./Header";
import { BottomNav, type TabId } from "./BottomNav";
import { ActiveRun } from "@/pages/ActiveRun";
import { History } from "@/pages/History";
import { Stats } from "@/pages/Stats";
import { SettingsPage } from "@/pages/Settings";
import { useSettings } from "@/hooks/useSettings";
import { useHistory } from "@/hooks/useHistory";

const headerTitles: Record<TabId, string | undefined> = {
  run: undefined,
  history: "기록",
  stats: undefined,
  settings: "설정",
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("run");
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const { settings, update: updateSetting } = useSettings();
  const { sessions, add: addSession, remove: removeSession } = useHistory();

  const handleRunComplete = useCallback((session: WorkoutSession) => {
    addSession(session);
    setViewingSessionId(session.id);
    setActiveTab("history");
  }, [addSession]);

  return (
    <div className="min-h-screen bg-surface">
      <Header title={headerTitles[activeTab]} />
      <main style={{ paddingTop: 'calc(var(--header-height) + var(--sat) + 1rem)', paddingBottom: 'calc(var(--bottomnav-height) + var(--sab) + 1rem)' }}>
        {/* ActiveRun은 항상 마운트. 탭 전환해도 workout state + 타이머가 유지됨 */}
        <div className={activeTab !== "run" ? "hidden" : undefined}>
          <ActiveRun settings={settings} onRunComplete={handleRunComplete} />
        </div>
        {activeTab === "history" && (
          <History
            sessions={sessions}
            viewingSessionId={viewingSessionId}
            onViewSession={setViewingSessionId}
            onDeleteSession={removeSession}
            deviationThreshold={settings.deviationThreshold}
          />
        )}
        {activeTab === "stats" && <Stats sessions={sessions} settings={settings} />}
        {activeTab === "settings" && <SettingsPage settings={settings} onUpdate={updateSetting} sessions={sessions} />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
