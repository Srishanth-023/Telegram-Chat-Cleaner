export interface FriendlyError {
  title: string;
  message: string;
  action?: string;
  code?: string;
  seconds?: number;
}

export function mapTelegramError(error: unknown): FriendlyError {
  if (!error) {
    return {
      title: "Unknown Error",
      message: "An unexpected error occurred. Please try again.",
    };
  }

  // Handle error message or RPC error
  const rawMessage =
    typeof error === "string"
      ? error
      : (error as { errorMessage?: string; message?: string }).errorMessage ||
        (error as Error).message ||
        "";

  // Check for FloodWaitError or FLOOD_WAIT_X
  const floodMatch = rawMessage.match(/FLOOD_WAIT_(\d+)/) || rawMessage.match(/wait of (\d+) seconds/i);
  const secondsProp = (error as { seconds?: number }).seconds;
  if (floodMatch || typeof secondsProp === "number") {
    const seconds = secondsProp ?? (floodMatch ? parseInt(floodMatch[1], 10) : 60);
    return {
      title: "Rate Limit Exceeded",
      message: `Telegram asked us to wait ${seconds}s before making more requests.`,
      action: "Please wait for the timer to finish.",
      code: "FLOOD_WAIT",
      seconds,
    };
  }

  if (rawMessage.includes("PHONE_CODE_INVALID")) {
    return {
      title: "Invalid Verification Code",
      message: "The login code you entered is incorrect.",
      action: "Please double-check the 5-digit code sent to your Telegram app.",
      code: "PHONE_CODE_INVALID",
    };
  }

  if (rawMessage.includes("PHONE_CODE_EXPIRED")) {
    return {
      title: "Code Expired",
      message: "The verification code has expired.",
      action: "Please go back and request a new code.",
      code: "PHONE_CODE_EXPIRED",
    };
  }

  if (rawMessage.includes("PASSWORD_HASH_INVALID")) {
    return {
      title: "Incorrect 2FA Password",
      message: "The two-step verification password you entered is incorrect.",
      action: "Please enter your Telegram cloud password again.",
      code: "PASSWORD_HASH_INVALID",
    };
  }

  if (rawMessage.includes("PHONE_NUMBER_INVALID")) {
    return {
      title: "Invalid Phone Number",
      message: "The phone number format is not recognized by Telegram.",
      action: "Include your international country code (e.g. +1 555 123 4567).",
      code: "PHONE_NUMBER_INVALID",
    };
  }

  if (rawMessage.includes("PHONE_NUMBER_UNREGISTERED")) {
    return {
      title: "Account Not Found",
      message: "There is no Telegram account registered with this phone number.",
      action: "Please check your number or register an account on Telegram first.",
      code: "PHONE_NUMBER_UNREGISTERED",
    };
  }

  if (rawMessage.includes("AUTH_KEY_UNREGISTERED")) {
    return {
      title: "Session Terminated",
      message: "Your Telegram session was closed or terminated from another device.",
      action: "Please log in again.",
      code: "AUTH_KEY_UNREGISTERED",
    };
  }

  if (rawMessage.includes("USER_DEACTIVATED") || rawMessage.includes("USER_DEACTIVATED_BAN")) {
    return {
      title: "Account Deactivated",
      message: "This Telegram account has been deactivated or banned.",
      action: "Contact Telegram support.",
      code: "USER_DEACTIVATED",
    };
  }

  if (rawMessage.includes("CHAT_ADMIN_REQUIRED")) {
    return {
      title: "Admin Rights Required",
      message: "You must be an administrator to perform this operation.",
      code: "CHAT_ADMIN_REQUIRED",
    };
  }

  if (rawMessage.includes("PEER_ID_INVALID") || rawMessage.includes("CHANNEL_INVALID")) {
    return {
      title: "Chat Unavailable",
      message: "Telegram could not identify this chat or channel.",
      code: "PEER_ID_INVALID",
    };
  }

  if (rawMessage.includes("AUTH_USER_CANCEL")) {
    return {
      title: "Authentication Cancelled",
      message: "The sign-in process was cancelled.",
      code: "AUTH_USER_CANCEL",
    };
  }

  if (
    rawMessage.includes("Failed to fetch") ||
    rawMessage.includes("WebSocket") ||
    rawMessage.includes("NetworkError") ||
    rawMessage.includes("CONNECTION_LOST")
  ) {
    return {
      title: "Connection Issue",
      message: "Unable to communicate with Telegram servers over WebSocket.",
      action: "Check your internet connection and ensure Telegram web is not blocked.",
      code: "NETWORK_ERROR",
    };
  }

  // Safe fallback without raw internal stack traces
  return {
    title: "Telegram Request Failed",
    message: rawMessage || "An unexpected error occurred while communicating with Telegram.",
    action: "Please try again or reconnect.",
    code: "UNKNOWN_ERROR",
  };
}
