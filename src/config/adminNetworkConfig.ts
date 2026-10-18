export type NetworkPortalMode = "commercial" | "admin_dedicated";

export type DedicatedAdminSubRoute =
  | "hendy-admini"
  | "control-plane"
  | "network-gateway"
  | "cross-platform-studio"
  | "telegram-ops"
  | "infrastructure"
  | "pipeline";

export interface DedicatedNetworkPolicy {
  commercialDomain: string;
  commercialCdnIp: string;
  adminDedicatedDomain: string;
  adminSecondaryDomain: string;
  adminDedicatedIp: string;
  adminSubnetIp: string;
  adminRouterPath: string;
  verifyAccessEndpoint: string;
  mtlsEnabled: boolean;
  hmacZeroTrustEnabled: boolean;
  allowedCidrs: string[];
  authorizedAdminId: string;
  supportedWindowsOs: string[];
  exclusiveGatewayServices: string[];
}

export const DEFAULT_NETWORK_POLICY: DedicatedNetworkPolicy = {
  commercialDomain: "https://hendy-video-studio-new-pro.onrender.com",
  commercialCdnIp: "104.21.48.100:443",
  adminDedicatedDomain: "https://admin.hendystudio.net",
  adminSecondaryDomain: "https://hendy-video-studio-new-pro.onrender.com/admin-console/network-gateway",
  adminDedicatedIp: "10.240.0.10:8443",
  adminSubnetIp: "172.16.88.10:9443",
  adminRouterPath: "/admin-console",
  verifyAccessEndpoint: "/api/admin-gateway/verify-access",
  mtlsEnabled: true,
  hmacZeroTrustEnabled: true,
  allowedCidrs: [
    "10.240.0.0/16",
    "172.16.88.0/24",
    "192.168.1.0/24",
    "10.0.0.0/8",
    "127.0.0.1/32",
  ],
  authorizedAdminId: "6138197737",
  supportedWindowsOs: [
    "Windows 10 (32-bit x86)",
    "Windows 10 (64-bit x64)",
    "Windows 11 (32-bit x86)",
    "Windows 11 (64-bit x64)",
  ],
  exclusiveGatewayServices: [
    "Cross-Platform User Interface & Build Studio",
    "Service Center & VIP Repository",
    "Docker · Ktor · PostgreSQL Infrastructure",
  ],
};

/**
 * Converts an IPv4 address string (e.g. "10.240.0.10") into an unsigned 32-bit integer.
 */
export function ipv4ToUint32(ip: string): number | null {
  const cleanIp = ip.trim().split(":")[0];
  const parts = cleanIp.split(".");
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const num = Number(part);
    if (!Number.isInteger(num) || num < 0 || num > 255 || part === "") {
      return null;
    }
    result = ((result << 8) | num) >>> 0;
  }
  return result >>> 0;
}

/**
 * Checks whether an IPv4 address falls inside a CIDR block (e.g. "10.240.0.0/16").
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  const trimmedCidr = cidr.trim();
  const [networkStr, prefixStr] = trimmedCidr.split("/");
  const ipNum = ipv4ToUint32(ip);
  const netNum = ipv4ToUint32(networkStr);
  if (ipNum === null || netNum === null) return false;

  const prefix = prefixStr !== undefined ? Number(prefixStr) : 32;
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  if (prefix === 0) return true;

  const mask = prefix === 32 ? 0xffffffff : (~((1 << (32 - prefix)) - 1)) >>> 0;
  return (ipNum & mask) >>> 0 === (netNum & mask) >>> 0;
}

/**
 * Evaluates a client IP against a list of allowed CIDR network ranges.
 */
export function evaluateCidrFirewall(
  clientIp: string,
  allowedCidrs: string[]
): {
  allowed: boolean;
  matchedCidr: string | null;
} {
  for (const cidr of allowedCidrs) {
    if (isIpInCidr(clientIp, cidr)) {
      return { allowed: true, matchedCidr: cidr.trim() };
    }
  }
  return { allowed: false, matchedCidr: null };
}

const NETWORK_MODE_EVENT = "vietsub:network-portal-change";

/**
 * Detects whether the current browser location or session targets the
 * Dedicated Administrator Router (separate domain, IP address, or /admin-console path).
 */
export function detectInitialNetworkMode(): {
  mode: NetworkPortalMode;
  subRoute: DedicatedAdminSubRoute;
} {
  if (typeof window === "undefined") {
    return { mode: "commercial", subRoute: "network-gateway" };
  }

  const host = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();

  // 1. Check if accessed via dedicated admin domain or static admin IP
  const isDedicatedHost =
    host.startsWith("admin.") ||
    host.startsWith("ops.") ||
    host === "10.240.0.10" ||
    host === "172.16.88.10";

  // 2. Check if accessed via dedicated router path (/admin-console or /admin-gateway)
  const isDedicatedPath =
    pathname.startsWith("/admin-console") ||
    pathname.startsWith("/admin-gateway") ||
    pathname.startsWith("/admin-router");

  // 3. Check if accessed via explicit query params or hash
  const routerParam = searchParams.get("router") || searchParams.get("portal");
  const viewParam = searchParams.get("view");
  const domainParam = searchParams.get("domain");
  const ipParam = searchParams.get("ip");

  const isDedicatedQuery =
    routerParam === "admin" ||
    routerParam === "admin-dedicated" ||
    viewParam === "admin" ||
    viewParam === "docker_ktor" ||
    viewParam === "admin_portal" ||
    domainParam === "admin.hendystudio.net" ||
    domainParam === "admin.vietsubpro.studio" ||
    ipParam === "10.240.0.10";

  const isDedicatedHash =
    hash.startsWith("#/admin-console") || hash.startsWith("#/admin-gateway");

  let subRoute: DedicatedAdminSubRoute = "control-plane";
  if (
    pathname.includes("hendy-admini") ||
    hash.includes("hendy-admini") ||
    searchParams.get("tab") === "hendy-admini"
  ) {
    subRoute = "hendy-admini";
  } else if (
    pathname.includes("control-plane") ||
    hash.includes("control-plane") ||
    searchParams.get("tab") === "control-plane"
  ) {
    subRoute = "control-plane";
  } else if (
    pathname.includes("cross-platform") ||
    hash.includes("cross-platform") ||
    searchParams.get("tab") === "cross-platform"
  ) {
    subRoute = "cross-platform-studio";
  } else if (
    pathname.includes("telegram") ||
    hash.includes("telegram") ||
    searchParams.get("tab") === "telegram"
  ) {
    subRoute = "telegram-ops";
  } else if (
    pathname.includes("infrastructure") ||
    hash.includes("infrastructure") ||
    searchParams.get("tab") === "infrastructure"
  ) {
    subRoute = "infrastructure";
  } else if (
    pathname.includes("pipeline") ||
    hash.includes("pipeline") ||
    searchParams.get("tab") === "pipeline"
  ) {
    subRoute = "pipeline";
  } else if (
    pathname.includes("network") ||
    hash.includes("network") ||
    searchParams.get("tab") === "network"
  ) {
    subRoute = "network-gateway";
  }

  if (
    isDedicatedHost ||
    isDedicatedPath ||
    isDedicatedQuery ||
    isDedicatedHash
  ) {
    return { mode: "admin_dedicated", subRoute };
  }

  return { mode: "commercial", subRoute: "network-gateway" };
}

/**
 * Navigates between the Public Commercial Interface (https://vietsubpro.studio)
 * and the Dedicated Administrator Interface (https://admin.vietsubpro.studio / 10.240.0.10:8443).
 */
export function navigateNetworkPortal(
  mode: NetworkPortalMode,
  subRoute: DedicatedAdminSubRoute = "network-gateway"
): void {
  if (typeof window === "undefined") return;

  try {
    if (mode === "admin_dedicated") {
      const nextUrl = `/admin-console/${subRoute}?domain=admin.hendystudio.net&ip=10.240.0.10`;
      window.history.pushState({ mode, subRoute }, "", nextUrl);
    } else {
      window.history.pushState({ mode: "commercial" }, "", "/");
    }
  } catch {
    // Fallback if pushState is restricted in sandboxed iframe
  }

  window.dispatchEvent(
    new CustomEvent(NETWORK_MODE_EVENT, {
      detail: { mode, subRoute },
    })
  );
}

export function subscribeNetworkPortalChange(
  listener: (detail: {
    mode: NetworkPortalMode;
    subRoute: DedicatedAdminSubRoute;
  }) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{
      mode: NetworkPortalMode;
      subRoute: DedicatedAdminSubRoute;
    }>;
    if (customEvent.detail) {
      listener(customEvent.detail);
    }
  };

  const popStateHandler = () => {
    listener(detectInitialNetworkMode());
  };

  window.addEventListener(NETWORK_MODE_EVENT, handler);
  window.addEventListener("popstate", popStateHandler);
  return () => {
    window.removeEventListener(NETWORK_MODE_EVENT, handler);
    window.removeEventListener("popstate", popStateHandler);
  };
}

export function generateNginxDedicatedAdminConfig(
  policy: DedicatedNetworkPolicy = DEFAULT_NETWORK_POLICY
): string {
  const cleanCommercialHost = policy.commercialDomain.replace(/^https?:\/\//, "");
  const cleanAdminHost = policy.adminDedicatedDomain.replace(/^https?:\/\//, "");
  const cleanSecondaryHost = policy.adminSecondaryDomain.replace(/^https?:\/\//, "");
  const cidrLines = policy.allowedCidrs
    .map((cidr) => `    allow ${cidr.trim()};`)
    .join("\n");

  return `# =============================================================================
# NGINX REVERSE PROXY & DEDICATED IP VHOST CONFIGURATION
# Isolates Commercial Storefront (${cleanCommercialHost}) from
# Dedicated Administrator Gateway (${cleanAdminHost} / ${policy.adminDedicatedIp})
# Exclusively gates: Cross-Platform UI & Build Studio, Service Center & VIP Repo
# =============================================================================

# 1. PUBLIC COMMERCIAL STOREFRONT (Customer-Facing SaaS & Vietsub Studio)
server {
    listen 80;
    listen 443 ssl http2;
    server_name ${cleanCommercialHost} www.${cleanCommercialHost};

    # Block public access to Admin Gateway, Cross-Platform Build Studio & VIP Repo
    location ~ ^/(admin-console|api/admin-gateway|api/infrastructure|cross-platform-studio|telegram-ops) {
        return 404;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Portal-Tier "COMMERCIAL_PUBLIC";
    }
}

# 2. DEDICATED ADMINISTRATOR GATEWAY (Bound to Static IP ${policy.adminDedicatedIp} & Subdomain)
server {
    listen ${policy.adminDedicatedIp} ssl http2;
    listen ${policy.adminSubnetIp} ssl http2;
    server_name ${cleanAdminHost} ${cleanSecondaryHost};

    # Strict CIDR IP Firewall Allowlist (/admin-console/network-gateway)
${cidrLines}
    deny all;

    # Connection Authentication Verification Endpoint
    location = ${policy.verifyAccessEndpoint} {
        proxy_pass http://127.0.0.1:3000${policy.verifyAccessEndpoint};
        proxy_set_header X-Admin-Domain "${cleanAdminHost}";
        proxy_set_header X-Admin-Dedicated-IP "${policy.adminDedicatedIp}";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Mutual TLS (mTLS) + Web Crypto HMAC-SHA256 Headers
    ssl_verify_client optional;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Admin-Isolated-Gateway "${policy.adminDedicatedIp}" always;

    location / {
        proxy_pass http://127.0.0.1:3000${policy.adminRouterPath};
        proxy_set_header Host ${cleanAdminHost};
        proxy_set_header X-Admin-Domain "${cleanAdminHost}";
        proxy_set_header X-Admin-Dedicated-IP "${policy.adminDedicatedIp}";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`;
}

export const NGINX_DEDICATED_ADMIN_CONFIG =
  generateNginxDedicatedAdminConfig(DEFAULT_NETWORK_POLICY);
