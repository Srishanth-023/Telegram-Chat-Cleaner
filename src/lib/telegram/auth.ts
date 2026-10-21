import { requireClient } from "./client";
import { mapTelegramError, type FriendlyError } from "./errors";

export type AuthStep = "credentials" | "phone" | "code" | "password" | "authenticated";

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export interface AuthBridgeState {
  currentStep: AuthStep;
  isLoading: boolean;
  isCodeViaApp?: boolean;
  passwordHint?: string;
  error: FriendlyError | null;
}

export type AuthStateListener = (state: AuthBridgeState) => void;

class AuthBridge {
  private state: AuthBridgeState = {
    currentStep: "credentials",
    isLoading: false,
    error: null,
  };

  private listeners = new Set<AuthStateListener>();
  private phoneDeferred: Deferred<string> | null = null;
  private codeDeferred: Deferred<string> | null = null;
  private passwordDeferred: Deferred<string> | null = null;
  private isCancelled = false;

  public subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public getState(): AuthBridgeState {
    return { ...this.state };
  }

  private updateState(partial: Partial<AuthBridgeState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public reset(): void {
    this.cancel();
    this.phoneDeferred = null;
    this.codeDeferred = null;
    this.passwordDeferred = null;
    this.isCancelled = false;
    this.updateState({
      currentStep: "credentials",
      isLoading: false,
      isCodeViaApp: undefined,
      passwordHint: undefined,
      error: null,
    });
  }

  public setStep(step: AuthStep): void {
    this.updateState({ currentStep: step, error: null });
  }

  public clearError(): void {
    if (this.state.error) {
      this.updateState({ error: null });
    }
  }

  public async startAuthFlow(phoneNumber: string): Promise<void> {
    const client = requireClient();
    this.isCancelled = false;
    this.updateState({ isLoading: true, error: null });

    this.phoneDeferred = createDeferred<string>();
    this.phoneDeferred.resolve(phoneNumber);

    try {
      await client.start({
        phoneNumber: async () => {
          if (this.isCancelled) throw new Error("AUTH_USER_CANCEL");
          if (!this.phoneDeferred) {
            this.phoneDeferred = createDeferred<string>();
            this.updateState({
              currentStep: "phone",
              isLoading: false,
            });
          }
          const deferred = this.phoneDeferred;
          this.phoneDeferred = null;
          const num = await deferred.promise;
          this.updateState({ isLoading: true, error: null });
          return num;
        },
        phoneCode: async (isCodeViaApp?: boolean) => {
          if (this.isCancelled) throw new Error("AUTH_USER_CANCEL");
          this.codeDeferred = createDeferred<string>();
          this.updateState({
            currentStep: "code",
            isLoading: false,
            isCodeViaApp: !!isCodeViaApp,
          });
          const code = await this.codeDeferred.promise;
          this.updateState({ isLoading: true, error: null });
          return code;
        },
        password: async (hint?: string) => {
          if (this.isCancelled) throw new Error("AUTH_USER_CANCEL");
          this.passwordDeferred = createDeferred<string>();
          this.updateState({
            currentStep: "password",
            isLoading: false,
            passwordHint: hint || "",
          });
          const pwd = await this.passwordDeferred.promise;
          this.updateState({ isLoading: true, error: null });
          return pwd;
        },
        onError: async (err: Error) => {
          if (this.isCancelled) return true;
          const friendly = mapTelegramError(err);
          this.updateState({
            isLoading: false,
            error: friendly,
          });
          // If the error occurred on phone submission, halt the internal loop cleanly
          if (this.state.currentStep === "phone" || this.state.currentStep === "credentials") {
            return true;
          }
          // Return false to allow retrying entering code/password
          return false;
        },
      });

      this.updateState({
        currentStep: "authenticated",
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      if (this.isCancelled) {
        this.updateState({
          isLoading: false,
          error: mapTelegramError("AUTH_USER_CANCEL"),
        });
        return;
      }
      this.updateState({
        isLoading: false,
        error: mapTelegramError(err),
      });
      // Do not throw unhandled exception if canceled or caught
    } finally {
      // Clean up deferreds
      this.phoneDeferred = null;
      this.codeDeferred = null;
      this.passwordDeferred = null;
    }
  }

  public submitPhone(phone: string): void {
    this.updateState({ isLoading: true, error: null });
    if (this.phoneDeferred) {
      this.phoneDeferred.resolve(phone);
      this.phoneDeferred = null;
    } else {
      this.startAuthFlow(phone).catch(() => {});
    }
  }

  public submitCode(code: string): void {
    if (this.codeDeferred) {
      const trimmed = code.trim();
      this.codeDeferred.resolve(trimmed);
      this.codeDeferred = null;
    }
  }

  public submitPassword(password: string): void {
    if (this.passwordDeferred) {
      this.passwordDeferred.resolve(password);
      this.passwordDeferred = null;
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.phoneDeferred) {
      this.phoneDeferred.reject(new Error("AUTH_USER_CANCEL"));
      this.phoneDeferred = null;
    }
    if (this.codeDeferred) {
      this.codeDeferred.reject(new Error("AUTH_USER_CANCEL"));
      this.codeDeferred = null;
    }
    if (this.passwordDeferred) {
      this.passwordDeferred.reject(new Error("AUTH_USER_CANCEL"));
      this.passwordDeferred = null;
    }
    this.updateState({
      isLoading: false,
      error: null,
    });
  }
}

export const authBridge = new AuthBridge();
