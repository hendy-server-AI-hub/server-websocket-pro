import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Server,
  Globe,
  Lock,
  Terminal,
  Send,
  Sliders,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Activity,
  Network,
  CheckCircle2,
  Layers,
  Cpu,
  Plus,
  X,
  AlertTriangle,
  FileCode2,
} from "lucide-react";
import {
  DEFAULT_NETWORK_POLICY,
  DedicatedAdminSubRoute,
  DedicatedNetworkPolicy,
  evaluateCidrFirewall,
  generateNginxDedicatedAdminConfig,
  navigateNetworkPortal,
} from "./config/adminNetworkConfig";
import { DockerKtorWorkspace } from "./workspaces/DockerKtor";
import { TelegramBotWorkspace } from "./workspaces/TelegramBot";
import { CrossPlatformToolkitModal } from "./components/CrossPlatformToolkitModal";
import { AdminControlPlaneSuite } from "../apps/admin-web/AdminControlPlaneSuite";
import { HendyAdminiLiveIde } from "../hendy-Admini/HendyAdminiLiveIde";
import {
  checkIsAuthorizedAdmin,
  DEFAULT_ADMIN_USER,
  DEFAULT_STANDARD_USER,
} from "./context/CurrentUserContext";

export interface DedicatedAdminRouterProps {
  initialSubRoute?: DedicatedAdminSubRoute;
  currentUser: any;
  onUserChange?: (user: any) => void;
  onReturnToCommercialStorefront: () => void;
  onOpenDownloadModal?: () => void;
  onOpenPipelineConsole?: () => void;
  onNotify?: (msg: string, type?: "success" | "error" | "info") => void;
}

const PRESET_CIDRS = [
  "10.240.0.0/16",
  "172.16.88.0/24",
  "192.168.1.0/24",
  "127.0.0.1/32",
];

const TEST_CLIENT_IPS = [
  { ip: "10.240.0.10", label: "10.240.0.10 (Primary Admin Subnet)" },
  { ip: "172.16.88.24", label: "172.16.88.24 (Secondary Subnet)" },
  { ip: "192.168.1.100", label: "192.168.1.100 (LAN Admin Subnet)" },
  { ip: "203.0.113.99", label: "203.0.113.99 (External Unauthorized IP)" },
];

export const DedicatedAdminRouter: React.FC<DedicatedAdminRouterProps> = ({
  initialSubRoute = "network-gateway",
  currentUser,
  onUserChange,
  onReturnToCommercialStorefront,
  onOpenDownloadModal,
  onOpenPipelineConsole,
  onNotify,
}) => {
  const [activeSubRoute, setActiveSubRoute] =
    useState<DedicatedAdminSubRoute>(initialSubRoute);
  const [networkPolicy, setNetworkPolicy] = useState<DedicatedNetworkPolicy>(
    DEFAULT_NETWORK_POLICY
  );
  const [cidrInput, setCidrInput] = useState<string>(
    DEFAULT_NETWORK_POLICY.allowedCidrs.join(", ")
  );
  const [newCidrRange, setNewCidrRange] = useState<string>("");
  const [verifyEndpointInput, setVerifyEndpointInput] = useState<string>(
    DEFAULT_NETWORK_POLICY.verifyAccessEndpoint
  );
  const [testClientIp, setTestClientIp] = useState<string>("10.240.0.10");
  const [testAdminId, setTestAdminId] = useState<string>(
    DEFAULT_NETWORK_POLICY.authorizedAdminId
  );
  const [gatewayVerifyResult, setGatewayVerifyResult] = useState<any>(null);
  const [isLoadingGateway, setIsLoadingGateway] = useState(false);
  const [copiedNginx, setCopiedNginx] = useState(false);

  const isRbacAdminAuthorized = checkIsAuthorizedAdmin(
    currentUser || DEFAULT_ADMIN_USER
  );

  useEffect(() => {
    setActiveSubRoute(initialSubRoute);
  }, [initialSubRoute]);

  const fetchNetworkTopology = async () => {
    setIsLoadingGateway(true);
    try {
      const res = await fetch("/api/admin-gateway/network-topology");
      const data = await res.json();
      if (data.ok && data.policy) {
        setNetworkPolicy(data.policy);
        if (Array.isArray(data.policy.allowedCidrs)) {
          setCidrInput(data.policy.allowedCidrs.join(", "));
        }
        if (data.policy.verifyAccessEndpoint) {
          setVerifyEndpointInput(data.policy.verifyAccessEndpoint);
        }
      }
    } catch {
      // Fallback to default policy
    } finally {
      setIsLoadingGateway(false);
    }
  };

  useEffect(() => {
    fetchNetworkTopology();
  }, []);

  const handleSelectSubRoute = (sub: DedicatedAdminSubRoute) => {
    setActiveSubRoute(sub);
    navigateNetworkPortal("admin_dedicated", sub);
  };

  const parsedCidrs = cidrInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const localCidrPrecheck = evaluateCidrFirewall(testClientIp, parsedCidrs);
  const dynamicNginxConfig = generateNginxDedicatedAdminConfig({
    ...networkPolicy,
    allowedCidrs: parsedCidrs,
    verifyAccessEndpoint:
      verifyEndpointInput.trim() || "/api/admin-gateway/verify-access",
  });

  const handleAddCidrRange = (cidrToAdd: string) => {
    const trimmed = cidrToAdd.trim();
    if (!trimmed) return;
    if (!parsedCidrs.includes(trimmed)) {
      const updated = [...parsedCidrs, trimmed];
      setCidrInput(updated.join(", "));
      setNetworkPolicy((prev) => ({ ...prev, allowedCidrs: updated }));
    }
    setNewCidrRange("");
  };

  const handleRemoveCidrRange = (cidrToRemove: string) => {
    const updated = parsedCidrs.filter((c) => c !== cidrToRemove);
    setCidrInput(updated.join(", "));
    setNetworkPolicy((prev) => ({ ...prev, allowedCidrs: updated }));
  };

  const handleSaveNetworkPolicy = async () => {
    const cleanEndpoint = verifyEndpointInput.trim().startsWith("/")
      ? verifyEndpointInput.trim()
      : `/${verifyEndpointInput.trim()}`;
    const nextPolicy: DedicatedNetworkPolicy = {
      ...networkPolicy,
      allowedCidrs: parsedCidrs,
      verifyAccessEndpoint: cleanEndpoint || "/api/admin-gateway/verify-access",
    };
    setNetworkPolicy(nextPolicy);
    setVerifyEndpointInput(nextPolicy.verifyAccessEndpoint);
    try {
      const res = await fetch("/api/admin-gateway/update-network-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextPolicy),
      });
      const data = await res.json();
      if (data.ok) {
        onNotify?.(
          `Đã lưu cấu hình Admin Domain (${nextPolicy.adminDedicatedDomain}), Static IP (${nextPolicy.adminDedicatedIp}) & CIDR (${parsedCidrs.length} dải mạng)!`,
          "success"
        );
      }
    } catch {
      onNotify?.(
        "Đã cập nhật cấu hình Tên miền, IP Tĩnh & Tường lửa CIDR cục bộ!",
        "info"
      );
    }
  };

  const handleVerifyGatewayAccess = async () => {
    setIsLoadingGateway(true);
    const activeEndpoint = verifyEndpointInput.trim().startsWith("/")
      ? verifyEndpointInput.trim()
      : "/api/admin-gateway/verify-access";
    try {
      const res = await fetch(activeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDomain: networkPolicy.adminDedicatedDomain,
          targetIp: networkPolicy.adminDedicatedIp,
          clientIp: testClientIp.trim(),
          adminId: testAdminId.trim(),
          customCidrs: parsedCidrs,
          customEndpoint: activeEndpoint,
        }),
      });
      const data = await res.json();
      setGatewayVerifyResult(data);
      if (data.ok) {
        onNotify?.(data.message, "success");
      } else {
        onNotify?.(data.message, "error");
      }
    } catch (err: any) {
      onNotify?.(
        "Lỗi xác thực kết nối qua " + activeEndpoint + ": " + err.message,
        "error"
      );
    } finally {
      setIsLoadingGateway(false);
    }
  };

  const handleCopyNginxConfig = () => {
    navigator.clipboard.writeText(dynamicNginxConfig);
    setCopiedNginx(true);
    setTimeout(() => setCopiedNginx(false), 2000);
    onNotify?.("Đã sao chép cấu hình Nginx Dedicated Admin VHost!", "success");
  };

  const handleDownloadNginxConfig = () => {
    const blob = new Blob([dynamicNginxConfig], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin.vietsubpro.studio.conf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify?.("Đã tải xuống tệp admin.vietsubpro.studio.conf!", "success");
  };

  const handleToggleRbacRole = () => {
    const nextUser = isRbacAdminAuthorized
      ? DEFAULT_STANDARD_USER
      : DEFAULT_ADMIN_USER;
    onUserChange?.(nextUser);
    onNotify?.(
      nextUser.isAdmin
        ? `Đã xác thực quyền Quản trị viên trên cổng IP ${networkPolicy.adminDedicatedIp}.`
        : "Đã chuyển sang chế độ Khách — Cổng Quản trị sẽ tự động khóa truy cập.",
      nextUser.isAdmin ? "success" : "info"
    );
  };

  return (
    <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[#07090E] text-slate-100 flex flex-col font-sans">
      {/* =================================================================== */}
      {/* DEDICATED ADMIN DOMAIN & STATIC IP ROUTER BAR                       */}
      {/* Bound to https://admin.vietsubpro.studio · IP 10.240.0.10:8443       */}
      {/* =================================================================== */}
      <div className="w-full max-w-full bg-[#0B0F19] border-b border-amber-500/25 px-3 sm:px-6 lg:px-8 py-2 text-[11px] font-mono">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-slate-300 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
              <Network className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>ADMIN GATEWAY (📁 hendy-Admini)</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              DOMAIN:{" "}
              <strong className="text-cyan-300">
                {networkPolicy.adminDedicatedDomain}
              </strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              STATIC IP:{" "}
              <strong className="text-emerald-400">
                {networkPolicy.adminDedicatedIp}
              </strong>
            </span>
            <span className="hidden lg:inline text-slate-600">|</span>
            <span className="hidden lg:inline text-slate-400">
              ROUTE:{" "}
              <span className="text-slate-200">
                /admin-console/{activeSubRoute}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>CIDR FIREWALL & RBAC ACTIVE</span>
            </span>
            <button
              type="button"
              onClick={onReturnToCommercialStorefront}
              className="text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
            >
              Về Trang Thương mại
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Gateway Navigation Header (Flexible & Zero Edge-Overflow) */}
      <header className="sticky top-0 z-40 w-full max-w-full bg-[#090C14]/95 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
            {/* Left: Dedicated Admin Console Brand + Back to Commercial Storefront */}
            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={onReturnToCommercialStorefront}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Trở về Trang chủ Thương mại công khai"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Giao diện Thương mại</span>
              </button>

              <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                    hendy-Admini · Quản Trị 7 Tầng & Sửa Code Trực Tiếp
                  </div>
                  <div className="text-[11px] font-mono text-amber-300/90 truncate">
                    {networkPolicy.adminDedicatedDomain} ·{" "}
                    {networkPolicy.adminDedicatedIp}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: RBAC Guardrail Verification Switch */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleRbacRole}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isRbacAdminAuthorized
                    ? "bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25"
                    : "bg-rose-500/15 border-rose-500/35 text-rose-300 hover:bg-rose-500/25"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isRbacAdminAuthorized
                    ? `Admin Verified (${networkPolicy.authorizedAdminId})`
                    : "Chế độ Khách (Locked)"}
                </span>
              </button>
            </div>
          </div>

          {/* Flexible Wrapping Admin Gateway Sub-Routes Bar (Never Overflows Horizontally) */}
          <nav
            aria-label="Dedicated Admin Router Navigation"
            className="w-full flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#101522] border border-neutral-800"
          >
            <button
              type="button"
              onClick={() => handleSelectSubRoute("hendy-admini")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeSubRoute === "hendy-admini"
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "text-amber-300 hover:text-white bg-amber-500/10"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 shrink-0" />
              <span>📁 hendy-Admini (7 Tầng & Sửa Code Trực Tiếp)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubRoute("control-plane")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeSubRoute === "control-plane"
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Tầng 0: Control Plane & 7 Tầng</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubRoute("network-gateway")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeSubRoute === "network-gateway"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Domain, Static IP & CIDR (/network-gateway)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubRoute("cross-platform-studio")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeSubRoute === "cross-platform-studio"
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Cross-Platform UI & Build Studio</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubRoute("telegram-ops")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeSubRoute === "telegram-ops"
                  ? "bg-[#24A1DE] text-white font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Trung Tâm Dịch Vụ & Kho VIP</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectSubRoute("infrastructure")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeSubRoute === "infrastructure"
                  ? "bg-emerald-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>Docker · Ktor · PostgreSQL</span>
            </button>

            {onOpenPipelineConsole && (
              <button
                type="button"
                onClick={onOpenPipelineConsole}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pipeline Gate</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* =================================================================== */}
      {/* ZERO-TRUST RBAC FIREWALL GUARDRAIL                                  */}
      {/* =================================================================== */}
      {!isRbacAdminAuthorized ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-2xl bg-[#10141F] border border-amber-500/35 p-7 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-amber-300">
              HTTP 403 · DEDICATED ADMIN GATEWAY ({networkPolicy.adminDedicatedIp})
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Truy Cập Độc Quyền Qua Cổng Quản Trị (Admin Gateway)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Giao diện đa nền tảng (Cross-Platform UI), Build Studio, Trung tâm Dịch vụ & Kho VIP và Quản lý Tên miền/IP/CIDR (
              <span className="font-mono text-slate-200">
                /admin-console/network-gateway
              </span>
              ) chỉ dành riêng cho Quản trị viên đã xác thực (ID:{" "}
              <span className="font-mono text-amber-300">
                {networkPolicy.authorizedAdminId}
              </span>
              ).
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleToggleRbacRole}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Xác thực Quản trị viên (ID: {networkPolicy.authorizedAdminId})
              </button>
              <button
                type="button"
                onClick={onReturnToCommercialStorefront}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Quay lại Trang chủ Thương mại
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* AUTHORIZED DEDICATED ADMIN GATEWAY VIEWS                          */
        /* ================================================================= */
        <div className="flex-1 w-full max-w-full min-w-0 flex flex-col overflow-x-hidden">
          {/* --------------------------------------------------------------- */}
          {/* SUB-ROUTE: /admin-console/hendy-admini                          */}
          {/* 📁 hendy-Admini: 7-Layer Hub & Direct Repository/Admin IDE       */}
          {/* --------------------------------------------------------------- */}
          {activeSubRoute === "hendy-admini" && (
            <div className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 py-5">
              <HendyAdminiLiveIde onNotify={onNotify} />
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-ROUTE 0: /admin-console/control-plane                       */}
          {/* Tầng 0: Admin Control Plane (apps/admin-web/)                   */}
          {/* --------------------------------------------------------------- */}
          {activeSubRoute === "control-plane" && (
            <AdminControlPlaneSuite
              onNotify={onNotify}
              onNavigateAdminSubRoute={handleSelectSubRoute}
            />
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-ROUTE 1: /admin-console/network-gateway                     */}
          {/* Domain, Static IP & CIDR Firewall Management                    */}
          {/* --------------------------------------------------------------- */}
          {activeSubRoute === "network-gateway" && (
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
              {/* Top Banner: Domain, Static IP & CIDR Firewall Management (/admin-console/network-gateway) */}
              <div className="rounded-2xl bg-[#10141F] border border-white/10 p-6 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
                      <span>/admin-console/network-gateway</span>
                      <span>·</span>
                      <span className="text-amber-300">
                        WINDOWS 10 & 11 (32-BIT & 64-BIT) SUPPORTED
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Quản Lý Tên Miền Quản Trị, Địa Chỉ IP Tĩnh & Tường Lửa Dải Mạng CIDR
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-4xl leading-relaxed">
                      Cho phép cấu hình trực tiếp Tên miền Quản trị (
                      <span className="font-mono text-amber-300">
                        {networkPolicy.adminDedicatedDomain}
                      </span>
                      ), Địa chỉ IP Tĩnh (
                      <span className="font-mono text-emerald-400">
                        {networkPolicy.adminDedicatedIp}
                      </span>
                      ), danh sách dải mạng CIDR được phép truy cập (ví dụ:{" "}
                      <span className="font-mono text-slate-200">
                        10.240.0.0/16, 172.16.88.0/24, 192.168.1.0/24
                      </span>
                      ), và kiểm chứng xác thực kết nối qua API tùy chỉnh{" "}
                      <span className="font-mono text-cyan-300">
                        {verifyEndpointInput}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleVerifyGatewayAccess}
                      disabled={isLoadingGateway}
                      className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Activity className="w-4 h-4" />
                      <span>
                        Kiểm Chứng Kết Nối ({verifyEndpointInput})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Exclusive Admin Gateway Modules Strip (Cross-Platform UI, Build Studio, Service Center & VIP Repo) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#0A0D14] border border-amber-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                        <span>EXCLUSIVE MODULE 01</span>
                        <span>WIN 10/11 (32 & 64-BIT)</span>
                      </div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Giao Diện Đa Nền Tảng & Build Studio</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Truy cập độc quyền qua Admin Gateway. Biên dịch mã nguồn & đóng gói cài đặt cho Windows 10/11 (32-bit x86 & 64-bit x64), Android và iOS.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectSubRoute("cross-platform-studio")
                      }
                      className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Mở Cross-Platform UI & Build Studio
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A0D14] border border-sky-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-sky-300">
                        <span>EXCLUSIVE MODULE 02</span>
                        <span>VIP REPOSITORY</span>
                      </div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Trung Tâm Dịch Vụ & Kho Tài Khoản VIP</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Truy cập độc quyền qua Admin Gateway. Điều hành Bot tự động, cổng thanh toán VietQR/Stripe/Stars và kho tài khoản 13 thương hiệu liên minh.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectSubRoute("telegram-ops")}
                      className="w-full py-2 px-3 rounded-lg bg-[#24A1DE] hover:bg-[#1f8fc5] text-white font-bold text-xs transition cursor-pointer"
                    >
                      Mở Trung Tâm Dịch Vụ & Kho VIP
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A0D14] border border-emerald-500/30 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                        <span>EXCLUSIVE MODULE 03</span>
                        <span>CORE INFRASTRUCTURE</span>
                      </div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hạ Tầng Docker · Ktor · PostgreSQL</span>
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Truy cập độc quyền qua Admin Gateway. Quản trị cụm container Docker, máy chủ Ktor 3.6 Netty, cơ sở dữ liệu PostgreSQL 16 và Redis.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectSubRoute("infrastructure")}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Mở Hạ Tầng Docker · Ktor · PostgreSQL
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Configuration & Verification Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 6 Cols: Direct Configuration of Admin Domain, Static IP & CIDR Firewall */}
                <div className="lg:col-span-6 rounded-2xl bg-[#10141F] border border-white/10 p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-amber-400" />
                      <span>
                        1. Cấu Hình Trực Tiếp Tên Miền, IP Tĩnh & Dải Mạng CIDR
                      </span>
                    </h2>
                    <span className="text-[11px] font-mono text-cyan-300">
                      DIRECT CONFIG
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Tên miền Quản trị (Admin Domain)
                        </label>
                        <input
                          type="text"
                          value={networkPolicy.adminDedicatedDomain}
                          onChange={(e) =>
                            setNetworkPolicy({
                              ...networkPolicy,
                              adminDedicatedDomain: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-amber-500/35 font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">
                          Tên miền Thương mại Công khai (Commercial Domain)
                        </label>
                        <input
                          type="text"
                          value={networkPolicy.commercialDomain}
                          onChange={(e) =>
                            setNetworkPolicy({
                              ...networkPolicy,
                              commercialDomain: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-white/10 font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Địa chỉ IP Tĩnh Quản trị (Static IP Address)
                        </label>
                        <input
                          type="text"
                          value={networkPolicy.adminDedicatedIp}
                          onChange={(e) =>
                            setNetworkPolicy({
                              ...networkPolicy,
                              adminDedicatedIp: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-emerald-500/35 font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">
                          Địa chỉ IP Tĩnh Dự phòng (Secondary Static IP)
                        </label>
                        <input
                          type="text"
                          value={networkPolicy.adminSubnetIp}
                          onChange={(e) =>
                            setNetworkPolicy({
                              ...networkPolicy,
                              adminSubnetIp: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-white/10 font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* CIDR Network Ranges Permitted for Access */}
                    <div className="space-y-2 pt-1">
                      <label className="block text-slate-300 font-semibold">
                        Dải mạng CIDR được phép truy cập (CIDR Firewall Allowlist)
                      </label>
                      <input
                        type="text"
                        value={cidrInput}
                        onChange={(e) => setCidrInput(e.target.value)}
                        placeholder="10.240.0.0/16, 172.16.88.0/24, 192.168.1.0/24"
                        className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-cyan-500/30 font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                      />

                      {/* Active CIDR Rule List & Quick Add */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {parsedCidrs.map((cidr) => (
                          <div
                            key={cidr}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#090C14] border border-white/10 font-mono text-[11px] text-slate-200"
                          >
                            <span>{cidr}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCidrRange(cidr)}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer"
                              title={`Xóa dải mạng ${cidr}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newCidrRange}
                          onChange={(e) => setNewCidrRange(e.target.value)}
                          placeholder="Thêm dải CIDR mới (VD: 10.10.0.0/24)"
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#090B10] border border-white/10 font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCidrRange(newCidrRange)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm CIDR</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                        <span className="text-slate-400">Dải chuẩn gợi ý:</span>
                        {PRESET_CIDRS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddCidrRange(preset)}
                            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono cursor-pointer"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveNetworkPolicy}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Lưu & Áp Dụng Cấu Hình Tên Miền, IP Tĩnh & Tường Lửa CIDR
                    </button>
                  </div>
                </div>

                {/* Right 6 Cols: Connection Authentication Verification via Customizable API Endpoint */}
                <div className="lg:col-span-6 rounded-2xl bg-[#10141F] border border-white/10 p-6 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span>
                          2. Kiểm Chứng Xác Thực Kết Nối Qua API Tùy Chỉnh
                        </span>
                      </h2>
                      <span className="text-[11px] font-mono text-emerald-400">
                        LIVE VERIFIER
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">
                          API Endpoint Xác thực Kết nối Tùy chỉnh (Customizable Verification Endpoint)
                        </label>
                        <input
                          type="text"
                          value={verifyEndpointInput}
                          onChange={(e) =>
                            setVerifyEndpointInput(e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-cyan-500/35 font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">
                            Địa chỉ IP Máy khách Kiểm thử (Client IP)
                          </label>
                          <input
                            type="text"
                            value={testClientIp}
                            onChange={(e) => setTestClientIp(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-white/10 font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">
                            Mã Định danh Quản trị viên (Admin ID)
                          </label>
                          <input
                            type="text"
                            value={testAdminId}
                            onChange={(e) => setTestAdminId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#090B10] border border-white/10 font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Quick Test IP Buttons */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-slate-400">
                          Chọn nhanh IP máy khách để kiểm thử tường lửa CIDR:
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {TEST_CLIENT_IPS.map((item) => (
                            <button
                              key={item.ip}
                              type="button"
                              onClick={() => setTestClientIp(item.ip)}
                              className={`px-2.5 py-1.5 rounded-lg border text-left font-mono text-[11px] truncate transition cursor-pointer ${
                                testClientIp === item.ip
                                  ? "bg-cyan-500/15 border-cyan-400 text-cyan-300"
                                  : "bg-[#090B10] border-white/10 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Real-time Local Bitwise CIDR Pre-Evaluation */}
                      <div
                        className={`p-3 rounded-xl border font-mono text-xs flex items-center justify-between ${
                          localCidrPrecheck.allowed
                            ? "bg-emerald-950/25 border-emerald-500/35 text-emerald-300"
                            : "bg-rose-950/30 border-rose-500/35 text-rose-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {localCidrPrecheck.allowed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span>
                            Kiểm tra Subnet CIDR cho IP {testClientIp}:{" "}
                            <strong>
                              {localCidrPrecheck.allowed
                                ? `HỢP LỆ (Khớp ${localCidrPrecheck.matchedCidr})`
                                : "BỊ CHẶN (Ngoài dải mạng cho phép)"}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyGatewayAccess}
                        disabled={isLoadingGateway}
                        className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Activity className="w-4 h-4" />
                        <span>
                          {isLoadingGateway
                            ? "Đang gửi yêu cầu xác thực..."
                            : `Gửi Yêu Cầu Xác Thực Tới ${verifyEndpointInput}`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Result Output Box */}
                  {gatewayVerifyResult && (
                    <div
                      className={`p-4 rounded-xl border font-mono text-xs space-y-1.5 mt-4 ${
                        gatewayVerifyResult.ok
                          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                          : "bg-rose-950/35 border-rose-500/40 text-rose-300"
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>
                          {gatewayVerifyResult.ok
                            ? "✓ HTTP 200 · ACCESS GRANTED"
                            : "✕ HTTP 403 · ACCESS DENIED"}
                        </span>
                        <span>Endpoint: {gatewayVerifyResult.verifiedEndpoint}</span>
                      </div>
                      <div>{gatewayVerifyResult.message}</div>
                      <div className="text-[11px] opacity-90">
                        • Domain: {gatewayVerifyResult.boundDomain} | Static IP:{" "}
                        {gatewayVerifyResult.boundIp} | Client IP:{" "}
                        {gatewayVerifyResult.clientIp}
                      </div>
                      <div className="text-[11px] opacity-90">
                        • CIDR Match:{" "}
                        {gatewayVerifyResult.cidrMatched
                          ? `ALLOWED (${gatewayVerifyResult.matchedCidr})`
                          : "BLOCKED"}{" "}
                        | Admin RBAC:{" "}
                        {gatewayVerifyResult.isAuthorizedAdmin
                          ? "AUTHORIZED"
                          : "REJECTED"}
                      </div>
                      <div className="text-[11px] truncate opacity-80">
                        • Handshake Token: {gatewayVerifyResult.handshakeToken}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Windows 10 & 11 (32-bit & 64-bit) Support + Nginx Config */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 Cols: Windows 10 & 11 (32-bit & 64-bit) Compatibility Matrix */}
                <div className="lg:col-span-5 rounded-2xl bg-[#10141F] border border-white/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>
                        Hỗ Trợ Hệ Điều Hành Windows 10 & 11 (32-bit & 64-bit)
                      </span>
                    </h3>
                    {onOpenDownloadModal && (
                      <button
                        type="button"
                        onClick={onOpenDownloadModal}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                      >
                        Mở Trung Tâm Tải Về
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hệ thống tương thích hoàn toàn với cả hai kiến trúc vi xử lý{" "}
                    <strong className="text-slate-200">32-bit (x86)</strong> và{" "}
                    <strong className="text-slate-200">64-bit (x64)</strong>{" "}
                    trên Windows 10 và Windows 11.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#090C14] border border-white/10">
                      <div className="text-[10px] text-slate-400">
                        Windows 10 & 11 (64-bit)
                      </div>
                      <div className="text-cyan-300 font-bold mt-0.5">
                        x64 / AMD64 (.exe & .msi)
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-1">
                        ✓ DirectX 12 GPU Hardsub
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#090C14] border border-white/10">
                      <div className="text-[10px] text-slate-400">
                        Windows 10 & 11 (32-bit)
                      </div>
                      <div className="text-amber-300 font-bold mt-0.5">
                        x86 / IA-32 (.exe & .msi)
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-1">
                        ✓ WOW64 & Native 32-bit
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectSubRoute("cross-platform-studio")
                    }
                    className="w-full py-2.5 px-4 rounded-xl bg-[#151C2C] hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition cursor-pointer"
                  >
                    Biên Dịch Bản Windows 10/11 (32-bit & 64-bit) Trong Build Studio
                  </button>
                </div>

                {/* Right 7 Cols: Live Nginx VHost Configuration */}
                <div className="lg:col-span-7 rounded-2xl bg-[#10141F] border border-white/10 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-[#0B0E16]">
                    <div>
                      <div className="text-sm font-bold text-white">
                        Cấu Hình Máy Chủ Định Tuyến Độc Lập (admin.vietsubpro.studio.conf)
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Tự động đồng bộ Domain, Static IP ({networkPolicy.adminDedicatedIp}), CIDR & {verifyEndpointInput}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyNginxConfig}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedNginx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedNginx ? "Đã chép" : "Sao chép"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadNginxConfig}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải tệp .conf</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 text-xs font-mono text-slate-200 bg-[#07090E] overflow-x-auto max-h-[300px] leading-relaxed select-all">
                    {dynamicNginxConfig}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-ROUTE 2: /admin-console/cross-platform-studio               */}
          {/* Cross-Platform User Interface & Build Studio (Exclusive)        */}
          {/* --------------------------------------------------------------- */}
          {activeSubRoute === "cross-platform-studio" && (
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
              <CrossPlatformToolkitModal
                isOpen={true}
                isEmbedded={true}
                detectedOS="windows"
                onNotify={onNotify}
              />
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-ROUTE 3: /admin-console/telegram-ops                        */}
          {/* Service Center & VIP Repository (Exclusive)                     */}
          {/* --------------------------------------------------------------- */}
          {activeSubRoute === "telegram-ops" && (
            <TelegramBotWorkspace
              isActive={true}
              onOpenDownloadModal={onOpenDownloadModal}
              onOpenPipelineConsole={onOpenPipelineConsole}
              onNavigateToAdminWorkspace={() =>
                handleSelectSubRoute("network-gateway")
              }
            />
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-ROUTE 4: /admin-console/infrastructure                      */}
          {/* Docker · Ktor · PostgreSQL Infrastructure (Exclusive)           */}
          {/* --------------------------------------------------------------- */}
          {activeSubRoute === "infrastructure" && (
            <DockerKtorWorkspace
              isActive={true}
              onNavigateHome={onReturnToCommercialStorefront}
              onNavigateToTelegramBot={() =>
                handleSelectSubRoute("telegram-ops")
              }
              onOpenPipelineConsole={onOpenPipelineConsole}
              onNotify={onNotify}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DedicatedAdminRouter;
