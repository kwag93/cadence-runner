import { useState, useCallback } from 'react';
import type { WorkoutSession } from '@cadence-runner/shared';
import {
  loadHistory,
  addSession as storageAdd,
  deleteSession as storageDel,
} from '@/lib/storage';

export function useHistory() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(loadHistory);

  const add = useCallback((session: WorkoutSession) => {
    setSessions(storageAdd(session));
  }, []);

  const remove = useCallback((id: string) => {
    setSessions(storageDel(id));
  }, []);

  return { sessions, add, remove };
}
