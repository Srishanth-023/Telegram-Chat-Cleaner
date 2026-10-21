export interface SessionUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
}

export interface InMemorySessionState {
  user: SessionUser | null;
  sessionString: string;
  isConnected: boolean;
  rememberMe: boolean;
  lastActiveTimestamp: number;
}

let sessionState: InMemorySessionState = {
  user: null,
  sessionString: "",
  isConnected: false,
  rememberMe: false,
  lastActiveTimestamp: Date.now(),
};

type SessionListener = (state: InMemorySessionState) => void;
const listeners = new Set<SessionListener>();

function notify(): void {
  for (const listener of listeners) {
    listener({ ...sessionState });
  }
}

export function getSessionState(): InMemorySessionState {
  return { ...sessionState };
}

export function subscribeSession(listener: SessionListener): () => void {
  listeners.add(listener);
  listener({ ...sessionState });
  return () => listeners.delete(listener);
}

export function setSessionUser(user: SessionUser | null): void {
  sessionState.user = user;
  sessionState.lastActiveTimestamp = Date.now();
  notify();
}

export function setSessionString(session: string): void {
  sessionState.sessionString = session;
  sessionState.lastActiveTimestamp = Date.now();
  notify();
}

export function setIsConnected(connected: boolean): void {
  sessionState.isConnected = connected;
  sessionState.lastActiveTimestamp = Date.now();
  notify();
}

export function setRememberMe(remember: boolean): void {
  sessionState.rememberMe = remember;
  notify();
}

export function touchActivity(): void {
  sessionState.lastActiveTimestamp = Date.now();
}

export function clearInMemorySession(): void {
  sessionState = {
    user: null,
    sessionString: "",
    isConnected: false,
    rememberMe: false,
    lastActiveTimestamp: Date.now(),
  };
  notify();
}
