/**
 * CLOUD EDGE COMPUTING & SERVERLESS (Cloudflare / Browser Web Crypto API)
 * - Web Crypto API: HMAC-SHA256 cryptographic verification at Edge (Zero trust security against DDoS)
 * - Telegram Mini App (TMA) WebApp SDK Wasm/JS & HMAC Auth
 * - Edge Caching & KV: Transient AI response caching with SHA-256 content addressing
 */

export interface TelegramWebAppAuthResult {
  valid: boolean;
  chatId: string;
  username: string;
  firstName: string;
  authDate: number;
  computedHash: string;
  receivedHash: string;
  dataCheckString: string;
  freshnessSeconds: number;
  isAdmin: boolean;
}

export interface EdgeZeroTrustHeaders {
  "X-Edge-Timestamp": string;
  "X-Edge-Nonce": string;
  "X-Edge-Signature": string;
  "X-Edge-Client": string;
}

export interface EdgeCacheTelemetry {
  hits: number;
  misses: number;
  entriesCount: number;
  lastKey: string | null;
  lastStatus: "HIT" | "MISS" | "IDLE";
}

const DEFAULT_EDGE_SECRET = "hendy_edge_secret_2026";
const DEFAULT_BOT_TOKEN = "8517026315:AAELCCiSvwQb-9AWi0VRRMQvT7Pf6rAZzP8";
const ADMIN_CHAT_ID = "6138197737";

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Computes SHA-256 hex digest using standard Web Crypto API (crypto.subtle)
 */
export async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

/**
 * Computes raw HMAC-SHA256 ArrayBuffer using Web Crypto API
 */
export async function hmacSha256Raw(
  keyMaterial: string | ArrayBuffer,
  message: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const rawKey =
    typeof keyMaterial === "string" ? encoder.encode(keyMaterial) : keyMaterial;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}

/**
 * Computes HMAC-SHA256 hex signature using Web Crypto API
 */
export async function hmacSha256Hex(
  secret: string | ArrayBuffer,
  payload: string
): Promise<string> {
  const sig = await hmacSha256Raw(secret, payload);
  return toHex(sig);
}

/**
 * Generates a cryptographically signed Telegram Mini App (TMA) initData string
 * using official Telegram WebApp HMAC-SHA256 algorithm:
 * secret_key = HMAC_SHA256("WebAppData", bot_token)
 * hash = HMAC_SHA256(secret_key, data_check_string)
 */
export async function generateSignedTelegramInitData(params: {
  id?: string;
  firstName?: string;
  username?: string;
  botToken?: string;
  authDate?: number;
}): Promise<{
  initData: string;
  hash: string;
  dataCheckString: string;
  authDate: number;
}> {
  const chatId = params.id || ADMIN_CHAT_ID;
  const firstName = params.firstName || "Hendy Admin";
  const username = params.username || "hendy_admin";
  const botToken = params.botToken || DEFAULT_BOT_TOKEN;
  const authDate = params.authDate || Math.floor(Date.now() / 1000);
  const queryId = `AAE_${chatId.slice(0, 6)}_${authDate}`;

  const userJson = JSON.stringify({
    id: Number(chatId) || chatId,
    first_name: firstName,
    username,
    language_code: "vi",
    allows_write_to_pm: true,
  });

  const pairs: Record<string, string> = {
    auth_date: String(authDate),
    query_id: queryId,
    user: userJson,
  };

  const dataCheckString = Object.keys(pairs)
    .sort()
    .map((k) => `${k}=${pairs[k]}`)
    .join("\n");

  // Step 1: HMAC_SHA256(key="WebAppData", message=botToken)
  const webAppSecretKey = await hmacSha256Raw("WebAppData", botToken);
  // Step 2: HMAC_SHA256(key=webAppSecretKey, message=dataCheckString)
  const hash = await hmacSha256Hex(webAppSecretKey, dataCheckString);

  const searchParams = new URLSearchParams({
    ...pairs,
    hash,
  });

  return {
    initData: searchParams.toString(),
    hash,
    dataCheckString,
    authDate,
  };
}

/**
 * Validates Telegram Mini App (TMA) initData string via Web Crypto API HMAC-SHA256
 */
export async function verifyTelegramWebAppInitData(
  initDataRaw: string,
  botToken: string = DEFAULT_BOT_TOKEN,
  maxAgeSeconds: number = 86400
): Promise<TelegramWebAppAuthResult> {
  const params = new URLSearchParams(initDataRaw);
  const receivedHash = params.get("hash") || "";

  const entries: [string, string][] = [];
  params.forEach((val, key) => {
    if (key !== "hash") {
      entries.push([key, val]);
    }
  });

  entries.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = await hmacSha256Raw("WebAppData", botToken);
  const computedHash = await hmacSha256Hex(secretKey, dataCheckString);

  const authDate = Number(params.get("auth_date") || "0");
  const nowSec = Math.floor(Date.now() / 1000);
  const freshnessSeconds = Math.max(0, nowSec - authDate);

  let chatId = ADMIN_CHAT_ID;
  let username = "hendy_admin";
  let firstName = "Hendy Admin";

  try {
    const userStr = params.get("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      chatId = String(userObj.id || ADMIN_CHAT_ID);
      username = userObj.username || "telegram_user";
      firstName = userObj.first_name || "Khách";
    }
  } catch {}

  const valid =
    Boolean(receivedHash) &&
    computedHash === receivedHash &&
    freshnessSeconds <= maxAgeSeconds;

  return {
    valid,
    chatId,
    username,
    firstName,
    authDate,
    computedHash,
    receivedHash,
    dataCheckString,
    freshnessSeconds,
    isAdmin: chatId === ADMIN_CHAT_ID,
  };
}

/**
 * Generates Zero-Trust Edge request headers signed with HMAC-SHA256
 * to protect Cloudflare Worker & Core Backend endpoints against DDoS and replay attacks
 */
export async function createZeroTrustEdgeHeaders(
  payloadString: string,
  edgeSecret: string = DEFAULT_EDGE_SECRET
): Promise<EdgeZeroTrustHeaders> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = Math.random().toString(36).substring(2, 10);
  const canonical = `${timestamp}:${nonce}:${payloadString}`;
  const signature = await hmacSha256Hex(edgeSecret, canonical);

  return {
    "X-Edge-Timestamp": timestamp,
    "X-Edge-Nonce": nonce,
    "X-Edge-Signature": signature,
    "X-Edge-Client": "HendyStudio-PWA-ZeroTrust-2026",
  };
}

/**
 * Transient AI Response Edge Cache (Client + KV Mirror)
 */
interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
}

class TransientEdgeKvStore {
  private store = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;
  private lastKey: string | null = null;
  private lastStatus: "HIT" | "MISS" | "IDLE" = "IDLE";

  async getOrCompute<T>(
    namespace: string,
    rawInput: string,
    computeFn: () => Promise<T>,
    ttlMs: number = 10 * 60 * 1000
  ): Promise<{ data: T; cacheStatus: "HIT" | "MISS"; cacheKey: string }> {
    const hash = await sha256Hex(`${namespace}:${rawInput}`);
    const key = `kv:${namespace}:${hash.slice(0, 16)}`;
    this.lastKey = key;

    const now = Date.now();
    const existing = this.store.get(key);
    if (existing && existing.expiresAt > now) {
      this.hits++;
      this.lastStatus = "HIT";
      return { data: existing.value as T, cacheStatus: "HIT", cacheKey: key };
    }

    this.misses++;
    this.lastStatus = "MISS";
    const computed = await computeFn();
    this.store.set(key, {
      key,
      value: computed,
      createdAt: now,
      expiresAt: now + ttlMs,
    });
    return { data: computed, cacheStatus: "MISS", cacheKey: key };
  }

  getTelemetry(): EdgeCacheTelemetry {
    return {
      hits: this.hits,
      misses: this.misses,
      entriesCount: this.store.size,
      lastKey: this.lastKey,
      lastStatus: this.lastStatus,
    };
  }

  clear(): void {
    this.store.clear();
    this.lastStatus = "IDLE";
  }
}

export const edgeTransientCache = new TransientEdgeKvStore();
