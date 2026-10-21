import { getClient } from "../telegram/client";
import { getSessionState } from "../session/store";

export function isAuthenticated(): boolean {
  const client = getClient();
  const session = getSessionState();
  return (client !== null && client.connected) || session.isConnected;
}

export function assertAuthenticated(redirectCallback: () => void): boolean {
  if (!isAuthenticated()) {
    redirectCallback();
    return false;
  }
  return true;
}
