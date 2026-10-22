import { getClient } from "../telegram/client";
import { getSessionState } from "../session/store";
import { isLoggingOut } from "../session/logout";

export function isAuthenticated(): boolean {
  if (isLoggingOut()) {
    return false;
  }
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
