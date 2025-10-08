import { notifySaveFailed } from "./notificationHelper";
import { useState, useCallback } from "react";
import { useAsync } from "react-use";
import _ from "lodash";

export async function tryAsyncAction<T>(
  action: Promise<T>,
  cancel?: () => void
): Promise<T> {
  try {
    const result = await action;
    // notifySaveSuccess();
    return result;
  } catch {
    notifySaveFailed();
  }
  return {} as T;
}

export function useData<T>(
  changeDetectionId: any,
  loadAction: () => Promise<T>
) {
  const [loadingTimeStamp, setLoadingTimeStamp] = useState(
    new Date().toISOString()
  );
  const [lastId, setLastId] = useState(changeDetectionId);
  const triggerReload = useCallback(
    () => setLoadingTimeStamp(new Date().toISOString()),
    []
  );
  if (lastId !== changeDetectionId) {
    triggerReload();
    setLastId(changeDetectionId);
  }
  const { loading, value: data } = useAsync(
    () => loadAction(),
    [loadingTimeStamp]
  );
  return { loading, data, triggerReload };
}

export function hasChanges<T>(original: T, candidate: T): boolean {
  return !_.isEqual(original, candidate);
}
