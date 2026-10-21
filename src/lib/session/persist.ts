export interface EncryptedSessionPayload {
  sessionString: string;
  apiId: string;
  apiHash: string;
  expiresAt: number;
}

const DB_NAME = "tg_cleaner_secure_vault";
const DB_VERSION = 1;
const STORE_KEY = "crypto_keys";
const STORE_DATA = "encrypted_vault";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_KEY)) {
        db.createObjectStore(STORE_KEY);
      }
      if (!db.objectStoreNames.contains(STORE_DATA)) {
        db.createObjectStore(STORE_DATA);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getOrCreateCryptoKey(db: IDBDatabase): Promise<CryptoKey> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_KEY, "readwrite");
    const store = tx.objectStore(STORE_KEY);
    const getReq = store.get("vault_key");

    getReq.onsuccess = async () => {
      if (getReq.result instanceof CryptoKey) {
        resolve(getReq.result);
        return;
      }

      try {
        // Generate a non-extractable AES-GCM 256-bit key
        const newKey = await window.crypto.subtle.generateKey(
          {
            name: "AES-GCM",
            length: 256,
          },
          false, // Non-extractable!
          ["encrypt", "decrypt"]
        );

        const putTx = db.transaction(STORE_KEY, "readwrite");
        putTx.objectStore(STORE_KEY).put(newKey, "vault_key");
        putTx.oncomplete = () => resolve(newKey);
        putTx.onerror = () => reject(putTx.error);
      } catch (err) {
        reject(err);
      }
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

export async function saveEncryptedSession(
  payload: Omit<EncryptedSessionPayload, "expiresAt">,
  ttlHours: number
): Promise<void> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return;

  const db = await openDB();
  const key = await getOrCreateCryptoKey(db);

  const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;
  const fullPayload: EncryptedSessionPayload = {
    ...payload,
    expiresAt,
  };

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(fullPayload));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encodedData
  );

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DATA, "readwrite");
    const store = tx.objectStore(STORE_DATA);

    store.put(
      {
        iv: Array.from(iv),
        ciphertext: Array.from(new Uint8Array(cipherBuffer)),
      },
      "active_session"
    );

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadEncryptedSession(): Promise<EncryptedSessionPayload | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null;

  try {
    const db = await openDB();
    const tx = db.transaction([STORE_KEY, STORE_DATA], "readonly");
    const dataStore = tx.objectStore(STORE_DATA);
    const getReq = dataStore.get("active_session");

    const record = await new Promise<{ iv: number[]; ciphertext: number[] } | undefined>(
      (resolve, reject) => {
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
      }
    );

    if (!record) return null;

    const key = await getOrCreateCryptoKey(db);
    const iv = new Uint8Array(record.iv);
    const ciphertext = new Uint8Array(record.ciphertext);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    const decryptedJson = decoder.decode(decryptedBuffer);
    const payload = JSON.parse(decryptedJson) as EncryptedSessionPayload;

    // Check expiry
    if (Date.now() > payload.expiresAt) {
      await forgetDevice();
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function forgetDevice(): Promise<void> {
  if (typeof window === "undefined" || !window.indexedDB) return;

  try {
    const db = await openDB();
    const tx = db.transaction([STORE_KEY, STORE_DATA], "readwrite");
    tx.objectStore(STORE_KEY).clear();
    tx.objectStore(STORE_DATA).clear();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore clear errors
  }
}
