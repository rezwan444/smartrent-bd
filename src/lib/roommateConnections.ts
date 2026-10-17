import { ConnectionStatus, RoommateConnectionRecord } from "@/types/roommate";

const STORAGE_KEY = "smartrent_roommate_connections";

export function getAllConnections(): Record<string, RoommateConnectionRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse roommate connections:", e);
    return {};
  }
}

export function getConnectionRecord(targetProfileId: string): RoommateConnectionRecord {
  const all = getAllConnections();
  return (
    all[targetProfileId] || {
      targetProfileId,
      status: "NONE",
      requestedAt: "",
    }
  );
}

export function saveConnectionRecord(record: RoommateConnectionRecord): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllConnections();
    all[record.targetProfileId] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save connection record:", e);
  }
}

export function sendConnectionRequest(targetProfileId: string): RoommateConnectionRecord {
  const record: RoommateConnectionRecord = {
    targetProfileId,
    status: "REQUEST_SENT",
    requestedAt: new Date().toISOString(),
  };
  saveConnectionRecord(record);
  return record;
}

export function respondToConnectionRequest(
  targetProfileId: string,
  accept: boolean
): RoommateConnectionRecord {
  const existing = getConnectionRecord(targetProfileId);
  const status: ConnectionStatus = accept ? "MUTUAL_ACCEPTED" : "DECLINED";
  const updated: RoommateConnectionRecord = {
    ...existing,
    targetProfileId,
    status,
    respondedAt: new Date().toISOString(),
  };
  saveConnectionRecord(updated);
  return updated;
}

export function resetConnectionRecord(targetProfileId: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllConnections();
    delete all[targetProfileId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to reset connection record:", e);
  }
}
