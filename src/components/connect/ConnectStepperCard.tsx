"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Phone,
  MessageSquare,
  Lock,
  CheckCircle2,
  Trash2,
} from "@/components/ui/Icons";
import { Stepper, StepItem } from "@/components/ui/Stepper";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  createTelegramClient,
  disconnectClient,
  telegramCredentialsSchema,
} from "@/lib/telegram/client";
import { authBridge, AuthBridgeState, AuthStep } from "@/lib/telegram/auth";
import {
  saveEncryptedSession,
  loadEncryptedSession,
  forgetDevice,
  EncryptedSessionPayload,
} from "@/lib/session/persist";
import {
  setSessionUser,
  setSessionString,
  setIsConnected,
  setRememberMe,
} from "@/lib/session/store";
import { useAppStore } from "@/lib/store";

const STEPS: StepItem[] = [
  { id: "credentials", title: "API Keys" },
  { id: "phone", title: "Phone" },
  { id: "code", title: "Code" },
  { id: "password", title: "2FA Password" },
];

export function ConnectStepperCard() {
  const router = useRouter();
  const { toast } = useToast();

  // Auth bridge subscription
  const [authState, setAuthState] = useState<AuthBridgeState>(authBridge.getState());

  // Form input states
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [showApiHash, setShowApiHash] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Remember me options
  const [rememberMeOpt, setRememberMeOpt] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [existingSavedSession, setExistingSavedSession] = useState<EncryptedSessionPayload | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Validation errors
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const handleAuthSuccessRef = React.useRef<() => Promise<void>>();

  useEffect(() => {
    // Check for saved encrypted session on mount
    loadEncryptedSession().then((saved) => {
      if (saved) {
        setExistingSavedSession(saved);
        setApiId(saved.apiId);
        setApiHash(saved.apiHash);
      }
    });

    const unsubscribe = authBridge.subscribe((state) => {
      setAuthState(state);
      if (state.currentStep === "authenticated") {
        handleAuthSuccessRef.current?.();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getStepIndex = (step: AuthStep): number => {
    switch (step) {
      case "credentials":
        return 0;
      case "phone":
        return 1;
      case "code":
        return 2;
      case "password":
        return 3;
      case "authenticated":
        return 3;
      default:
        return 0;
    }
  };

  const handleAuthSuccess = async () => {
    try {
      const client = authBridge.getState();
      const tgClient = (await import("@/lib/telegram/client")).requireClient();
      const me = await tgClient.getMe();
      const sessionString = tgClient.session.save() as unknown as string;

      setSessionString(sessionString);
      setIsConnected(true);
      setRememberMe(rememberMeOpt);

      if (me && "id" in me) {
        setSessionUser({
          id: me.id.toString(),
          firstName: ("firstName" in me && me.firstName) ? me.firstName : "User",
          lastName: ("lastName" in me && me.lastName) ? me.lastName : undefined,
          username: ("username" in me && me.username) ? me.username : undefined,
          phone: ("phone" in me && me.phone) ? me.phone : undefined,
        });
      }

      if (rememberMeOpt) {
        await saveEncryptedSession(
          {
            sessionString,
            apiId,
            apiHash,
          },
          expiryHours
        );
      }

      // Clear sensitive secrets from memory inputs
      setCode("");
      setPassword("");

      toast({
        title: "Connected Successfully",
        description: `Logged in as ${("firstName" in me && me.firstName) ? me.firstName : "Telegram User"}`,
        variant: "success",
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Session Finalization Error",
        description: (err as Error).message || "Could not complete session setup",
        variant: "danger",
      });
    }
  };
  handleAuthSuccessRef.current = handleAuthSuccess;

  const handleRestoreSaved = async () => {
    if (!existingSavedSession) return;
    setIsRestoring(true);
    try {
      const client = await createTelegramClient(
        {
          apiId: existingSavedSession.apiId,
          apiHash: existingSavedSession.apiHash,
        },
        existingSavedSession.sessionString
      );

      await client.connect();

      if (await client.checkAuthorization()) {
        const me = await client.getMe();
        setSessionString(existingSavedSession.sessionString);
        setIsConnected(true);
        setRememberMe(true);

        if (me && "id" in me) {
          setSessionUser({
            id: me.id.toString(),
            firstName: ("firstName" in me && me.firstName) ? me.firstName : "User",
            lastName: ("lastName" in me && me.lastName) ? me.lastName : undefined,
            username: ("username" in me && me.username) ? me.username : undefined,
            phone: ("phone" in me && me.phone) ? me.phone : undefined,
          });
        }

        toast({
          title: "Session Restored",
          description: "Reconnected using encrypted device session.",
          variant: "success",
        });

        router.push("/dashboard");
      } else {
        await forgetDevice();
        setExistingSavedSession(null);
        toast({
          title: "Session Expired",
          description: "Saved session was terminated on Telegram. Please log in again.",
          variant: "warning",
        });
      }
    } catch (err: unknown) {
      await forgetDevice();
      setExistingSavedSession(null);
      toast({
        title: "Reconnection Failed",
        description: "Could not restore session. Please log in afresh.",
        variant: "danger",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleForgetSaved = async () => {
    await forgetDevice();
    setExistingSavedSession(null);
    setApiId("");
    setApiHash("");
    toast({
      title: "Saved Device Cleared",
      description: "Encrypted keys and stored session deleted from IndexedDB.",
      variant: "default",
    });
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors({});

    const result = telegramCredentialsSchema.safeParse({ apiId, apiHash });
    if (!result.success) {
      const formatted: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) formatted[issue.path[0].toString()] = issue.message;
      }
      setClientErrors(formatted);
      return;
    }

    try {
      await createTelegramClient({ apiId, apiHash });
      authBridge.setStep("phone");
    } catch (err: unknown) {
      setClientErrors({ apiId: (err as Error).message });
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors({});

    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    if (!/^\+\d{7,15}$/.test(cleanPhone)) {
      setClientErrors({
        phone: "Must be in international format starting with + (e.g. +1234567890)",
      });
      return;
    }

    try {
      authBridge.submitPhone(cleanPhone);
    } catch (err: unknown) {
      setClientErrors({ phone: (err as Error).message });
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors({});
    const cleanCode = code.trim();

    if (!/^\d{5,6}$/.test(cleanCode)) {
      setClientErrors({ code: "Please enter the 5-digit verification code" });
      return;
    }

    authBridge.submitCode(cleanCode);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientErrors({});

    if (!password) {
      setClientErrors({ password: "Password cannot be empty" });
      return;
    }

    authBridge.submitPassword(password);
  };

  const handleCancel = async () => {
    authBridge.cancel();
    authBridge.reset();
    await disconnectClient();
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      <Card className="border-border bg-surface text-left">
        {/* Header & Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold tracking-tight text-text">
              Connect Telegram Account
            </h1>
            <Badge variant="primary">GramJS over WSS</Badge>
          </div>
          <p className="text-xs text-text-muted">
            All verification steps communicate directly from your browser to Telegram.
          </p>
          <Stepper
            steps={STEPS}
            currentStepIndex={getStepIndex(authState.currentStep)}
            className="mt-2"
          />
        </div>

        {/* Saved Session Restore Banner */}
        {existingSavedSession && authState.currentStep === "credentials" && (
          <div className="mb-6 p-4 rounded-control border border-primary/30 bg-primary-soft/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="text-xs font-semibold text-text block">
                  Encrypted Session Detected on this Device
                </span>
                <span className="text-[11px] text-text-muted">
                  API ID: <code className="font-mono">{existingSavedSession.apiId}</code>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="primary"
                isLoading={isRestoring}
                onClick={handleRestoreSaved}
                className="flex-1 sm:flex-initial text-xs"
              >
                Restore Session
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleForgetSaved}
                className="text-text-muted hover:text-danger text-xs px-2"
                title="Forget this session"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {authState.error && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-control bg-danger-soft border border-red-200 text-danger text-xs"
          >
            <div className="flex items-center gap-1.5 font-semibold text-sm mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>{authState.error.title}</span>
            </div>
            <p className="leading-relaxed">{authState.error.message}</p>
            {authState.error.action && (
              <p className="mt-1 font-medium text-red-700">{authState.error.action}</p>
            )}
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {authState.currentStep === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <Input
              label="App API ID (api_id)"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 12345678"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              errorMessage={clientErrors.apiId}
              helperText="Numeric App ID from my.telegram.org"
              mono
              autoComplete="off"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text uppercase tracking-wider">
                  App API Hash (api_hash)
                </label>
                <button
                  type="button"
                  onClick={() => setShowApiHash(!showApiHash)}
                  className="text-xs text-text-muted hover:text-text flex items-center gap-1 focus:outline-none"
                >
                  {showApiHash ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showApiHash ? "Hide" : "Show"}</span>
                </button>
              </div>
              <Input
                type={showApiHash ? "text" : "password"}
                placeholder="32-character hexadecimal hash"
                value={apiHash}
                onChange={(e) => setApiHash(e.target.value)}
                errorMessage={clientErrors.apiHash}
                helperText="32-character hash from my.telegram.org"
                mono
                autoComplete="off"
                required
              />
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              <Checkbox
                id="remember-me"
                checked={rememberMeOpt}
                onCheckedChange={(checked) => setRememberMeOpt(!!checked)}
                label="Remember me on this device (Optional)"
                description="Encrypts session in your browser IndexedDB with AES-GCM WebCrypto key. Never leaves this browser."
              />

              {rememberMeOpt && (
                <div className="pl-7 pt-1 flex items-center gap-3">
                  <span className="text-xs text-text-muted font-medium">Auto-expire after:</span>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(parseInt(e.target.value, 10))}
                    className="h-8 px-2.5 rounded-control border border-border bg-surface text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>1 hour</option>
                    <option value={24}>24 hours (1 day)</option>
                    <option value={168}>7 days</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-end">
              <Button type="submit" size="md" className="w-full sm:w-auto font-medium">
                Next: Phone Verification
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: PHONE */}
        {authState.currentStep === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="p-3 rounded-control bg-surface-muted text-xs text-text-muted">
              Entering phone number for Telegram authorization. Telegram will send a verification code to your Telegram mobile/desktop app.
            </div>

            <Input
              label="International Phone Number"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              errorMessage={clientErrors.phone}
              helperText="Must include + and country code (e.g. +1 for US/CA, +44 for UK, +91 for India)"
              mono
              autoComplete="tel"
              required
              disabled={authState.isLoading}
            />

            <div className="pt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={authState.isLoading}
                onClick={() => authBridge.setStep("credentials")}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>

              <Button
                type="submit"
                size="md"
                isLoading={authState.isLoading}
                className="font-medium"
              >
                Request Verification Code
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: CODE */}
        {authState.currentStep === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="p-3.5 rounded-control bg-primary-soft/60 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>
                {authState.isCodeViaApp
                  ? "A 5-digit code was sent to your active Telegram app."
                  : "A verification code was sent via SMS to your phone."}
              </span>
            </div>

            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              placeholder="12345"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              errorMessage={clientErrors.code}
              helperText="Enter the 5-digit code without spaces"
              mono
              className="text-center text-lg tracking-widest font-bold"
              autoComplete="one-time-code"
              required
              disabled={authState.isLoading}
            />

            <div className="pt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={authState.isLoading}
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="md"
                isLoading={authState.isLoading}
                className="font-medium"
              >
                Submit Code
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: 2FA PASSWORD */}
        {authState.currentStep === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="p-3.5 rounded-control bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Lock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <strong>Two-Step Verification Enabled.</strong>
                <p className="mt-0.5 text-text-muted">
                  Your Telegram account is protected with a cloud password.
                  {authState.passwordHint && (
                    <span className="block mt-1 font-semibold text-text">
                      Password Hint: &ldquo;{authState.passwordHint}&rdquo;
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text uppercase tracking-wider">
                  2FA Cloud Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-text-muted hover:text-text flex items-center gap-1 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your 2FA password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                errorMessage={clientErrors.password}
                autoComplete="current-password"
                required
                disabled={authState.isLoading}
              />
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={authState.isLoading}
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="md"
                isLoading={authState.isLoading}
                className="font-medium"
              >
                Verify & Finish Login
                <CheckCircle2 className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
