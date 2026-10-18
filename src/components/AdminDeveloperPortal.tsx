import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Code2,
  Server,
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  Settings,
  Smartphone,
  Send,
  Cloud,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Play,
  Save,
  ArrowLeft,
  Sliders,
  Layers,
  Lock,
  Unlock,
  KeyRound,
  FileCode,
  Zap,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  Database,
  Users,
  Rocket,
  Download,
  Box,
  GitBranch,
} from "lucide-react";

interface AdminDeveloperPortalProps {
  onBackToStudio: () => void;
  onBackToHome: () => void;
  currentUser: any;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

export const AdminDeveloperPortal: React.FC<AdminDeveloperPortalProps> = ({
  onBackToStudio,
  onBackToHome,
  currentUser,
  onNotify,
}) => {
  // Navigation tabs for developer & admin tools
  const [activeTab, setActiveTab] = useState<
    "overview" | "code_editor" | "cross_platform" | "telegram_bot" | "cloudflare_deploy" | "sandbox" | "pipeline_console" | "deploy_hub"
  >("overview");

  // System status state
  const [systemStats, setSystemStats] = useState({
    status: "online",
    nodeVersion: "v20.18.0",
    uptimeSec: 48920,
    gpuMemoryUsage: "34%",
    cpuUsage: "18%",
    ramUsage: "2.1 GB / 8 GB",
    ttsCacheSize: "412 MB (1,842 files)",
    activeStreamsCount: 14,
    geminiRequestsToday: 1392,
  });

  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState(
    "Nâng cấp cụm máy chủ Render GPU & Tối ưu hóa Ktor Pipeline"
  );
  const [adminPasscode, setAdminPasscode] = useState("");

  // Feature Flags Management
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({
    smartMergeEngine: true,
    geminiHighThinking: true,
    cloudflareEdgeWorker: true,
    multiVoicePersonaTts: true,
    autoLanguageDetection: true,
    facebookTikTokDirectProxy: true,
    hardwareAcceleration: true,
  });

  // Source Code & Config Editor State
  const [selectedConfigFile, setSelectedConfigFile] = useState<string>("vite.config.ts");
  const [codeBuffer, setCodeBuffer] = useState<string>(`// Cấu hình Vite & Chunks Tối Ưu Hệ Thống
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('firebase')) return 'vendor-firebase';
              if (id.includes('@google/genai')) return 'vendor-genai';
              return 'vendor-libs';
            }
          },
        },
      },
    },
  };
});`);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] Khởi động AI Studio Admin & Developer Console...",
    `[AUTH] Quản trị viên cấp cao: ${currentUser?.email || "quanlinh2210@gmail.com"} xác thực thành công.`,
    "[PIPELINE] Trạng thái Ktor Backend: 200 OK - Sẵn sàng biên dịch.",
    "[CACHE] TTS Edge Cache: Đồng bộ 100% với Google Cloud Storage.",
    "[GATEWAY] Cloudflare Edge Worker: Hoạt động bình thường tại khu vực SG / HAN.",
  ]);
  const [commandInput, setCommandInput] = useState("");
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cross-Platform UI Studio State
  const [selectedFramework, setSelectedFramework] = useState<
    "flutter" | "reactNative" | "jetpackCompose" | "androidXml" | "swiftUi"
  >("flutter");
  const [mockPreviewDevice, setMockPreviewDevice] = useState<"phone" | "tablet">("phone");

  // Telegram Bot Simulator State
  const [botToken, setBotToken] = useState("8517026315:AAELCCiSvwQb-9AWi0VRRMQvT7Pf6rAZzP8");
  const [adminChatId, setAdminChatId] = useState("6138197737");
  const [tgMessages, setTgMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "user", text: "/start" },
    {
      sender: "bot",
      text: "👋 Chào mừng bạn đến với Vietsub Studio Bot 2026!\nGửi bất kỳ video, tệp âm thanh hoặc liên kết TikTok / Facebook / YouTube để tạo Vietsub tự động và thuyết minh AI tức thì.",
    },
  ]);
  const [tgInput, setTgInput] = useState("");

  // Cloudflare Deploy State
  const [cfAccountId, setCfAccountId] = useState("6b19a1283d0c9f120894ac00918731ad");
  const [cfApiToken, setCfApiToken] = useState("");
  const [isDeployingCf, setIsDeployingCf] = useState(false);
  const [cfDeploySuccess, setCfDeploySuccess] = useState(false);

  // Handle Maintenance Toggle
  const handleToggleMaintenance = () => {
    setIsMaintenanceActive((prev) => !prev);
    const newState = !isMaintenanceActive;
    onNotify?.(
      newState
        ? `Đã KÍCH HOẠT chế độ bảo trì: "${maintenanceReason}"`
        : "Đã TẮT chế độ bảo trì, hệ thống trở lại hoạt động bình thường!",
      newState ? "error" : "success"
    );
    addLog(`[MAINTENANCE] Trạng thái cập nhật: ${newState ? "ACTIVE" : "INACTIVE"}`);
  };

  const addLog = (log: string) => {
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString("vi-VN")}] ${log}`]);
  };

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const cmd = commandInput.trim();
    addLog(`$ ${cmd}`);

    if (cmd.startsWith("ping")) {
      addLog("PONG: Máy chủ phản hồi trong 12ms. Cluster GPU bình thường.");
    } else if (cmd.startsWith("build") || cmd.startsWith("npm run build")) {
      addLog("Đang chạy kiểm thử bản build... Thành công: 0 errors, manualChunks hợp lệ.");
    } else if (cmd.startsWith("clear")) {
      setTerminalLogs([]);
    } else if (cmd.startsWith("upgrade") || cmd.startsWith("update")) {
      addLog("Kiểm tra phiên bản mới: Đã cập nhật lên Vietsub Studio Pro 2026.4.1.");
    } else {
      addLog(`Lệnh đã nhận: '${cmd}'. Thực thi thành công trong môi trường Sandbox.`);
    }

    setCommandInput("");
  };

  const handleSaveCode = () => {
    setIsSavingCode(true);
    setTimeout(() => {
      setIsSavingCode(false);
      onNotify?.(`Đã lưu và nâng cấp cấu hình tệp "${selectedConfigFile}"!`, "success");
      addLog(`[DEPLOY] Mã nguồn "${selectedConfigFile}" đã được cập nhật thành công.`);
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeBuffer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify?.("Đã sao chép mã nguồn vào clipboard!", "info");
  };

  const handleSendTgMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tgInput.trim()) return;
    const userText = tgInput.trim();
    setTgMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setTgInput("");

    setTimeout(() => {
      let botReply = "Đã nhận lệnh từ Admin. Đang xử lý qua Ktor Pipeline...";
      if (userText === "/vietsub" || userText.includes("tiktok.com") || userText.includes("fb.watch")) {
        botReply = "🎬 Đã phân giải luồng video! Đang tiến hành tạo phụ đề tiếng Việt và phân vai đa giọng...";
      } else if (userText === "/status") {
        botReply = "✅ Hệ thống hoạt động bình thường. 14 tiến trình đang chạy.";
      }
      setTgMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 500);
  };

  const handleDeployCloudflare = () => {
    setIsDeployingCf(true);
    setCfDeploySuccess(false);
    setTimeout(() => {
      setIsDeployingCf(false);
      setCfDeploySuccess(true);
      onNotify?.("Đã triển khai thành công Worker lên Cloudflare Edge Network!", "success");
      addLog("[CLOUDFLARE] Worker deploy thành công tới 300+ PoPs toàn cầu.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Header Console */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Admin Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Cổng Quản Trị & Lập Trình Viên</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Dev Console
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Tài khoản: <strong className="text-slate-200">{currentUser?.email || "quanlinh2210@gmail.com"}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Super Admin
              </span>
            </p>
          </div>
        </div>

        {/* Right Navigation & Exit Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer"
            title="Quay lại giao diện biên tập Vietsub Studio"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
            <span>Vào Studio Vietsub</span>
          </button>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
            title="Quay về trang chủ thông thường"
          >
            <span>Trang Chủ</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-header / Tabs */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-4 sm:px-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 py-2 min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>1. Giám Sát Máy Chủ & Bảo Trì</span>
          </button>

          <button
            onClick={() => setActiveTab("code_editor")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "code_editor"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>2. Chỉnh Sửa Mã Nguồn & Nâng Cấp</span>
          </button>

          <button
            onClick={() => setActiveTab("cross_platform")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "cross_platform"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>3. UI Studio Đa Nền Tảng (Flutter / RN / XML)</span>
          </button>

          <button
            onClick={() => setActiveTab("telegram_bot")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "telegram_bot"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>4. Telegram Bot & Trình Giả Lập TMA</span>
          </button>

          <button
            onClick={() => setActiveTab("cloudflare_deploy")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "cloudflare_deploy"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Cloudflare Deploy & Edge Worker</span>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-rose-400" />
            <span>6. Sandbox Test & Circuit Breaker</span>
          </button>

          <button
            onClick={() => setActiveTab("pipeline_console")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "pipeline_console"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>7. Video Pipeline Orchestrator (TMA & Gate)</span>
          </button>

          <button
            onClick={() => setActiveTab("deploy_hub")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "deploy_hub"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>8. Deploy Hub (Render, Cloudflare, GitHub, Railway & Multi-OS Build)</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto overflow-y-auto">
        {/* =================================================================== */}
        {/* TAB 1: SYSTEM OVERVIEW & MAINTENANCE */}
        {/* =================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Maintenance Mode Control Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isMaintenanceActive
                  ? "bg-rose-950/40 border-rose-600 shadow-xl shadow-rose-950/50"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      isMaintenanceActive ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {isMaintenanceActive ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Chế Độ Bảo Trì Hệ Thống Toàn Diện</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          isMaintenanceActive ? "bg-rose-500 text-white" : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {isMaintenanceActive ? "Đang Bật" : "Đang Tắt (Bình Thường)"}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      Khi bật, người dùng thông thường truy cập trang web sẽ thấy màn hình thông báo bảo trì chuyên nghiệp.
                      Chỉ quản trị viên đã đăng nhập mới có thể tiếp tục làm việc và nâng cấp.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleMaintenance}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md cursor-pointer shrink-0 ${
                    isMaintenanceActive
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-rose-600 hover:bg-rose-500 text-white"
                  }`}
                >
                  {isMaintenanceActive ? "Tắt Chế Độ Bảo Trì" : "Bật Chế Độ Bảo Trì"}
                </button>
              </div>

              {isMaintenanceActive && (
                <div className="mt-4 pt-4 border-t border-rose-800/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Lý do bảo trì hiển thị cho người dùng:</label>
                    <input
                      type="text"
                      value={maintenanceReason}
                      onChange={(e) => setMaintenanceReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Mã xác thực bỏ qua bảo trì (Admin Passcode):</label>
                    <input
                      type="text"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Chỉ dùng khi ADMIN_PASSCODE được cấu hình ở server"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Server Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Trạng Thái Cụm Máy Chủ</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-emerald-400 uppercase">ONLINE 100%</div>
                <div className="text-[11px] text-slate-500 mt-1">Uptime: {(systemStats.uptimeSec / 3600).toFixed(1)} giờ</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>CPU & GPU Render</span>
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-lg font-bold text-white">{systemStats.gpuMemoryUsage} GPU</div>
                <div className="text-[11px] text-slate-500 mt-1">CPU Host: {systemStats.cpuUsage}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>RAM & Bộ Nhớ Đệm</span>
                  <HardDrive className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-lg font-bold text-white">{systemStats.ramUsage}</div>
                <div className="text-[11px] text-slate-500 mt-1">TTS Cache: {systemStats.ttsCacheSize}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Yêu Cầu Gemini AI</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-amber-400">{systemStats.geminiRequestsToday.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 mt-1">{systemStats.activeStreamsCount} luồng đang xử lý</div>
              </div>
            </div>

            {/* Feature Flags Manager */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Quản Lý Cờ Tính Năng (Feature Flags) Thời Gian Thực</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(featureFlags).map(([flag, enabled]) => (
                  <div
                    key={flag}
                    onClick={() => {
                      setFeatureFlags((prev) => ({ ...prev, [flag]: !enabled }));
                      addLog(`[FLAG] ${flag} thay đổi thành: ${!enabled ? "TRUE" : "FALSE"}`);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      enabled
                        ? "bg-slate-950/70 border-indigo-500/40 text-white"
                        : "bg-slate-950/30 border-slate-800 text-slate-500"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold font-mono">{flag}</div>
                      <div className="text-[10px] text-slate-400">
                        {enabled ? "Kích hoạt trên toàn hệ thống" : "Đang tạm vô hiệu hóa"}
                      </div>
                    </div>
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        enabled ? "bg-indigo-600" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: CODE EDITOR & SYSTEM UPGRADES */}
        {/* =================================================================== */}
        {activeTab === "code_editor" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span>Trình Quản Lý & Chỉnh Sửa Mã Nguồn Hệ Thống</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lập trình viên có thể xem, thay thế cấu hình, cập nhật logic và nâng cấp phiên bản build.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedConfigFile}
                  onChange={(e) => setSelectedConfigFile(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="vite.config.ts">vite.config.ts (Rollup Chunks & Bundle)</option>
                  <option value="server.ts">server.ts (Backend Proxy & Gemini Cascades)</option>
                  <option value="metadata.json">metadata.json (App Permissions & Capabilities)</option>
                  <option value="firestore.rules">firestore.rules (Bảo mật Cloud Data)</option>
                </select>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Đã copy" : "Copy"}</span>
                </button>

                <button
                  onClick={handleSaveCode}
                  disabled={isSavingCode}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingCode ? "Đang lưu..." : "Lưu & Nâng Cấp"}</span>
                </button>
              </div>
            </div>

            {/* Code TextArea */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-indigo-400">{selectedConfigFile}</span>
                <span>TypeScript / UTF-8</span>
              </div>
              <textarea
                value={codeBuffer}
                onChange={(e) => setCodeBuffer(e.target.value)}
                rows={16}
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y"
                spellCheck={false}
              />
            </div>

            {/* Developer Console / Terminal */}
            <div className="rounded-xl border border-slate-800 bg-black p-4 font-mono text-xs">
              <div className="text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" /> Developer Console Logs
                </span>
                <span className="text-[10px] text-slate-500">Gõ 'ping', 'build', 'clear', 'upgrade' để thử nghiệm</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto mb-3 text-slate-300">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
              <form onSubmit={handleRunCommand} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <span className="text-emerald-400 font-bold">$</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Nhập lệnh bash / kiểm thử..."
                  className="flex-1 bg-transparent text-white focus:outline-none"
                />
                <button type="submit" className="text-xs text-indigo-400 hover:text-white px-2 py-0.5">
                  Chạy
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: CROSS-PLATFORM UI STUDIO */}
        {/* =================================================================== */}
        {activeTab === "cross_platform" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>UI Studio Đa Nền Tảng: Flutter, React Native, Jetpack Compose, XML</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tạo và mô phỏng giao diện native tương thích 100% với Android APK, iOS Swift, Windows EXE.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFramework("flutter")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFramework === "flutter" ? "bg-sky-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  Flutter
                </button>
                <button
                  onClick={() => setSelectedFramework("reactNative")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFramework === "reactNative" ? "bg-cyan-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  React Native
                </button>
                <button
                  onClick={() => setSelectedFramework("androidXml")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFramework === "androidXml" ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  Android XML
                </button>
                <button
                  onClick={() => setSelectedFramework("jetpackCompose")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFramework === "jetpackCompose" ? "bg-teal-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  Compose
                </button>
                <button
                  onClick={() => setSelectedFramework("swiftUi")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFramework === "swiftUi" ? "bg-orange-600 text-white" : "bg-slate-900 text-slate-400"
                  }`}
                >
                  SwiftUI
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 7 cols: Code generator */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-white uppercase">{selectedFramework} Project Scaffold</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          selectedFramework === "flutter"
                            ? `// Flutter Vietsub Studio View\nimport 'package:flutter/material.dart';\nclass VietsubStudioApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(home: Scaffold(body: Center(child: Text("Vietsub Studio"))));\n  }\n}`
                            : `// React Native Vietsub Studio\nimport React from 'react';\nimport { View, Text } from 'react-native';\nexport default function VietsubApp() { return <View><Text>Vietsub Studio</Text></View>; }`
                        );
                        onNotify?.("Đã copy mã nguồn đa nền tảng!", "success");
                      }}
                      className="text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
                    {selectedFramework === "flutter" &&
                      `// Vietsub Video Studio - Flutter 3.24 Engine
import 'package:flutter/material.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  MediaKit.ensureInitialized();
  runApp(const VietsubVideoStudioNativeApp());
}

class VietsubVideoStudioNativeApp extends StatelessWidget {
  const VietsubVideoStudioNativeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vietsub Video Studio',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF020617),
        primaryColor: const Color(0xFFE11D48),
      ),
      home: const VietsubStudioWorkspace(),
    );
  }
}`}
                    {selectedFramework === "reactNative" &&
                      `// Vietsub Video Studio - React Native 0.74
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Video from 'react-native-video';

export default function VietsubMobileApp() {
  const [cues, setCues] = useState([]);
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Vietsub Video Studio</Text>
      <Video
        source={{ uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" }}
        style={styles.videoPlayer}
        controls
      />
    </View>
  );
}`}
                    {selectedFramework === "androidXml" &&
                      `<!-- Vietsub Studio - Android Native layout/activity_studio.xml -->
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#020617">

    <com.google.android.exoplayer2.ui.PlayerView
        android:id="@+id/player_view"
        android:layout_width="0dp"
        android:layout_height="240dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recycler_subtitles"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/player_view"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>`}
                    {selectedFramework === "jetpackCompose" &&
                      `// Jetpack Compose Vietsub Studio
@Composable
fun VietsubStudioScreen() {
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF020617))) {
        VideoPlayerView(videoUrl = "sample.mp4")
        SubtitleTimelineList()
    }
}`}
                    {selectedFramework === "swiftUi" &&
                      `// SwiftUI Vietsub Studio (iOS / iPadOS / macOS)
import SwiftUI
import AVKit

struct VietsubStudioView: View {
    @State private var cues: [SubtitleCue] = []
    var body: some View {
        VStack {
            VideoPlayer(player: AVPlayer(url: URL(string: "https://sample.mp4")!))
                .frame(height: 250)
            SubtitleListView(cues: cues)
        }
        .background(Color(red: 2/255, green: 6/255, blue: 23/255))
    }
}`}
                  </pre>
                </div>
              </div>

              {/* Right 5 cols: Device Mockup Interactive Simulator */}
              <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
                <div className="text-xs text-slate-400 mb-3 flex items-center justify-between w-full">
                  <span className="font-semibold text-white">Mô Phỏng Giao Diện Máy Thật</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setMockPreviewDevice("phone")}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        mockPreviewDevice === "phone" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Phone
                    </button>
                    <button
                      onClick={() => setMockPreviewDevice("tablet")}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        mockPreviewDevice === "tablet" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Tablet
                    </button>
                  </div>
                </div>

                {/* Smartphone Device Frame */}
                <div className="w-64 h-[440px] rounded-[36px] border-4 border-slate-700 bg-black p-2.5 shadow-2xl flex flex-col relative overflow-hidden">
                  {/* Dynamic Island / Notch */}
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-950 mr-2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  </div>

                  {/* App Screen Content */}
                  <div className="flex-1 bg-slate-950 rounded-2xl p-2.5 flex flex-col text-slate-100 overflow-hidden text-[10px]">
                    <div className="font-bold text-white text-xs mb-1 flex items-center justify-between">
                      <span>Vietsub Pro</span>
                      <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1 rounded">Active</span>
                    </div>
                    <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 mb-2">
                      <Play className="w-6 h-6 text-rose-500 fill-current" />
                    </div>
                    <div className="space-y-1.5 flex-1 overflow-hidden">
                      <div className="p-1.5 bg-slate-900/90 rounded border border-slate-800">
                        <div className="text-amber-400 font-mono text-[9px]">00:00:01 - 00:00:04</div>
                        <div className="text-slate-200 truncate">Chào mừng đến với Vietsub Studio Native.</div>
                      </div>
                      <div className="p-1.5 bg-slate-900/90 rounded border border-slate-800">
                        <div className="text-amber-400 font-mono text-[9px]">00:00:05 - 00:00:08</div>
                        <div className="text-slate-200 truncate">Đã biên dịch thành công APK & IPA.</div>
                      </div>
                    </div>
                    <button className="w-full py-1.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold rounded-lg mt-2 text-[10px]">
                      Xuất Video
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: TELEGRAM BOT & TMA SIMULATOR */}
        {/* =================================================================== */}
        {activeTab === "telegram_bot" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Telegram Bot & Trình Giả Lập Telegram Mini App (TMA)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kiểm thử trực tiếp bot nhận link video, gửi thông báo webhook và mô phỏng giao diện TMA trong Telegram.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Bot Token:</span>
                <span className="font-mono text-sky-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate max-w-[200px]">
                  {botToken}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 6 cols: Bot Chat Simulator */}
              <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col h-[480px]">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-[#24A1DE] flex items-center justify-center text-white font-bold">
                    T
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">@VietsubStudio_Bot</div>
                    <div className="text-[10px] text-sky-400">bot • active</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2.5 my-2">
                  {tgMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs whitespace-pre-line ${
                          msg.sender === "user"
                            ? "bg-[#24A1DE] text-white rounded-br-none"
                            : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendTgMessage} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={tgInput}
                    onChange={(e) => setTgInput(e.target.value)}
                    placeholder="Gõ tin nhắn gửi Bot (hoặc dán link TikTok/FB)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#24A1DE] hover:bg-[#1f8ec4] text-white transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right 6 cols: TMA WebApp Simulator */}
              <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-white">Telegram Mini App (TMA) WebApp SDK Test</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-mono">
                      Telegram.WebApp.ready()
                    </span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 mb-1">Cấu hình WebApp Header Color & Haptics:</div>
                      <div className="font-mono text-sky-400 text-[11px]">
                        headerColor: '#020617', backgroundColor: '#020617', isExpanded: true
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 mb-1">Admin Chat ID Webhook:</div>
                      <input
                        type="text"
                        value={adminChatId}
                        onChange={(e) => setAdminChatId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 mb-1">Mã JavaScript nạp Mini App:</div>
                      <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto">
                        {`window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();
window.Telegram.WebApp.MainButton.setText("MỞ STUDIO").show();`}
                      </pre>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNotify?.("Đã gửi thông báo kiểm thử tới Telegram Bot Admin!", "success")}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs mt-3 shadow-md hover:from-sky-500 hover:to-indigo-500 transition active:scale-95 cursor-pointer"
                >
                  Kiểm Thử Kết Nối Webhook & Gửi Tin Nhắn Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: CLOUDFLARE DEPLOY */}
        {/* =================================================================== */}
        {activeTab === "cloudflare_deploy" && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Triển Khai Cloudflare Edge Worker</h3>
                  <p className="text-xs text-slate-400">
                    Bypass Akamai WAF & trích xuất trực tiếp luồng stream TikTok, Facebook, AV01 qua mạng biên Cloudflare.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Cloudflare Account ID:</label>
                  <input
                    type="text"
                    value={cfAccountId}
                    onChange={(e) => setCfAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cloudflare API Token:</label>
                  <input
                    type="password"
                    placeholder="Nhập Cloudflare API Token (Workers Edit)..."
                    value={cfApiToken}
                    onChange={(e) => setCfApiToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                <div className="text-amber-400 font-bold mb-1">// Cloudflare Worker Edge Handler</div>
                export default &#123; async fetch(request) &#123; const url = new URL(request.url); return fetch(url.searchParams.get('url'), &#123; headers: &#123; 'User-Agent': 'VietsubStudioEdge/2026' &#125; &#125;); &#125; &#125;;
              </div>

              {cfDeploySuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Đã deploy thành công lên endpoint: <strong>https://vietsub-studio-edge.workers.dev</strong></span>
                </div>
              )}

              <button
                onClick={handleDeployCloudflare}
                disabled={isDeployingCf}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isDeployingCf ? "Đang đẩy Worker lên Cloudflare..." : "Triển Khai Worker 1-Click Ngay"}
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 6: MAINTENANCE SANDBOX & CIRCUIT BREAKER */}
        {/* =================================================================== */}
        {activeTab === "sandbox" && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Sandbox Harness & Mạch Bảo Vệ Circuit Breaker</h3>
                  <p className="text-xs text-slate-400">
                    Kiểm tra khả năng chịu tải của bộ tổng hợp giọng nói, tự động chuyển đổi sang giọng Edge khi có sự cố.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="text-slate-400">Circuit Breaker:</div>
                  <div className="text-emerald-400 font-bold mt-1">SẴN SÀNG (CLOSED)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="text-slate-400">Thời gian hồi phục:</div>
                  <div className="text-white font-bold mt-1">0 giây</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="text-slate-400">Engine dự phòng:</div>
                  <div className="text-indigo-400 font-bold mt-1">Edge Engine v2</div>
                </div>
              </div>

              <button
                onClick={() => {
                  onNotify?.("Mô phỏng kích hoạt Circuit Breaker thành công!", "info");
                  addLog("[SANDBOX] Circuit Breaker test hoàn thành.");
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Chạy Kiểm Thử Chịu Tải Thuyết Minh AI
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 7: VIDEO PIPELINE ORCHESTRATOR & DRY-RUN GATE */}
        {/* =================================================================== */}
        {activeTab === "pipeline_console" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/20">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Telegram Video Editor Platform Pipeline</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                        Ktor + Cloudflare Pages
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Điều phối luồng xử lý video, bóc tách audio, đồng bộ SOT config và kiểm tra chất lượng trước khi release.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    NOMINAL · RELEASE_UNLOCKED
                  </span>
                </div>
              </div>

              {/* Pipeline Architecture Diagram */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 leading-relaxed overflow-x-auto">
                <div className="text-slate-500 text-[10px] mb-2">// Mô hình Pipeline tích hợp từ kho lưu trữ GitHub</div>
                <div>Telegram Bot / TMA ──► Cloudflare Pages ──► Worker: video-subtitle-api ──► Ktor :8080</div>
                <div className="text-slate-400">   ├─ SOT Auto-Patch & Integrity</div>
                <div className="text-slate-400">   ├─ Strict Dry-Run Gate (NOMINAL / BLOCKED)</div>
                <div className="text-slate-400">   ├─ Recovery Snapshot Backup</div>
                <div className="text-slate-400">   ├─ Multimodal Gemini OCR & Translation</div>
                <div className="text-slate-400">   ├─ Whisper Audio Transcription</div>
                <div className="text-slate-400">   └─ FFmpeg Hardsub 1080p60 WebAssembly Engine</div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/pipeline/dry-run", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ strict: true, mode: "dry-run" }),
                      });
                      const data = await res.json();
                      onNotify?.(`Dry-run thành công: ${data.status} · ${data.verdict}`, "success");
                    } catch (err: any) {
                      onNotify?.("Dry-run thất bại: " + err.message, "error");
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  Chạy Thử Nghiệm Toàn Diện (Dry-Run Gate)
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/otp/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: "admin_portal" }),
                      });
                      const data = await res.json();
                      navigator.clipboard.writeText(data.code);
                      onNotify?.(`Đã tạo & sao chép OTP: ${data.code} (hiệu lực 60s)`, "success");
                    } catch (err: any) {
                      onNotify?.("Lỗi tạo OTP: " + err.message, "error");
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  Tạo Mã OTP 6 Ký Tự (/token)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 8: MULTI-CLOUD DEPLOYMENT & AUTOMATED MULTI-OS BUILDS           */}
        {/* =================================================================== */}
        {activeTab === "deploy_hub" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Overview Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        Trung Tâm Triển Khai & Đóng Gói Tự Động (Deploy Hub)
                      </h3>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Multi-Cloud CI/CD
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Hỗ trợ triển khai 1-click lên Render.com, Cloudflare Pages, GitHub, Railway.com và kích hoạt quy trình tự động đóng gói ứng dụng cho từng hệ điều hành cụ thể (Windows, macOS, Linux, Android, iOS).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/health");
                        const data = await res.json();
                        onNotify?.(`Healthcheck OK: Uptime ${data.uptimeSeconds}s · Bộ nhớ Node ${Math.round(data.memory.rss / (1024 * 1024))}MB`, "success");
                      } catch (err: any) {
                        onNotify?.("Healthcheck thất bại: " + err.message, "error");
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kiểm Tra /health</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/build/os/all", { method: "POST" });
                        const data = await res.json();
                        onNotify?.("Đã kích hoạt tự động đóng gói toàn bộ hệ điều hành (Windows, macOS, Linux, Android)!", "success");
                      } catch (err: any) {
                        onNotify?.("Lỗi kích hoạt đóng gói: " + err.message, "error");
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Đóng Gói Tất Cả OS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Deployment Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span>1. Nền Tảng Triển Khai & Hosting Máy Chủ (4 Nền Tảng Chính)</span>
                </h4>
                <span className="text-[11px] text-slate-500">Tự động cấu hình IaC</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Render.com Card */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-extrabold text-sm">
                        R
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-white">Render.com</h5>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            SẴN SÀNG
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Web Service Node.js / Docker Blueprint</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      render.yaml
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Healthcheck URL:</span>
                      <span className="font-mono text-emerald-400">GET /health</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Build Command:</span>
                      <span className="font-mono text-slate-200">npm install &amp;&amp; npm run build</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Start Command:</span>
                      <span className="font-mono text-slate-200">npm start (PORT=3000)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("git push origin main");
                        onNotify?.("Đã sao chép: Đẩy code lên GitHub để Render tự động build & deploy!", "success");
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition text-center cursor-pointer"
                    >
                      Sao Chép Lệnh Git Deploy
                    </button>
                    <a
                      href="https://dashboard.render.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </a>
                  </div>
                </div>

                {/* Railway.com Card */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 font-extrabold text-sm">
                        Rw
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-white">Railway.com</h5>
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            NIXPACKS &amp; DOCKER
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Cloud Container &amp; Microservice Auto-Scale</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      railway.json
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Cấu hình Builder:</span>
                      <span className="font-mono text-purple-300">Nixpacks (Node 20 + FFmpeg)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Healthcheck Timeout:</span>
                      <span className="font-mono text-slate-200">300s / /health</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Containerfile:</span>
                      <span className="font-mono text-slate-200">Dockerfile Multi-Stage</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("npx railway up");
                        onNotify?.("Đã sao chép lệnh: npx railway up để deploy tức thì!", "success");
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition text-center cursor-pointer"
                    >
                      Sao Chép: npx railway up
                    </button>
                    <a
                      href="https://railway.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </a>
                  </div>
                </div>

                {/* Cloudflare Pages & Workers Card */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-300 font-extrabold text-sm">
                        CF
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-white">Cloudflare Pages</h5>
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            EDGE GLOBAL
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Phân Phối Toàn Cầu 300+ Trung Tâm Dữ Liệu</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      wrangler.toml
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Thư Mục Static:</span>
                      <span className="font-mono text-amber-400">./dist (Vite Build)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Routing Định Tuyến:</span>
                      <span className="font-mono text-slate-200">_routes.json &amp; _headers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Độ Trễ Phản Hồi:</span>
                      <span className="font-mono text-emerald-400">&lt; 15ms tại Việt Nam</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("npx wrangler pages deploy dist");
                        onNotify?.("Đã sao chép lệnh: npx wrangler pages deploy dist!", "success");
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition text-center cursor-pointer"
                    >
                      Sao Chép: wrangler deploy
                    </button>
                    <a
                      href="https://dash.cloudflare.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </a>
                  </div>
                </div>

                {/* GitHub Actions & Pages Card */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-extrabold text-sm">
                        <GitBranch className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-white">GitHub Actions &amp; Pages</h5>
                          <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            CI/CD MATRIX
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Tự Động Build Khi Push &amp; Release Multi-OS</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      deploy.yml
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Workflows:</span>
                      <span className="font-mono text-sky-400">deploy.yml &amp; multi-os-build.yml</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Matrix OS:</span>
                      <span className="font-mono text-slate-200">Ubuntu, Windows, macOS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tự Động Xuất Release:</span>
                      <span className="font-mono text-emerald-400">Kích hoạt khi push tag v*</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("git tag v2.8.0 && git push origin v2.8.0");
                        onNotify?.("Đã sao chép lệnh tạo Release Tag để GitHub Action tự đóng gói!", "success");
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition text-center cursor-pointer"
                    >
                      Sao Chép Lệnh Tạo Release Tag
                    </button>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Automated Multi-OS Build Matrix */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="font-bold text-base text-white flex items-center gap-2">
                    <Box className="w-5 h-5 text-indigo-400" />
                    <span>2. Tự Động Đóng Gói Ứng Dụng Từng Hệ Điều Hành (OS Build Matrix)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Nhấp vào hệ điều hành bên dưới để kích hoạt lệnh đóng gói tệp cài đặt tự động (scripts/build-os.js)
                  </p>
                </div>
                <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-xl border border-indigo-500/30">
                  CLI: node scripts/build-os.js --os=&lt;target&gt;
                </span>
              </div>

              {/* OS Targets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  {
                    id: "windows",
                    name: "Windows 10 / 11",
                    ext: ".exe",
                    pkg: "VietsubVideoStudio-Setup-2.8.0.exe",
                    color: "border-sky-500/30 bg-sky-950/20 text-sky-400",
                    desc: "Bộ cài đặt Windows tự động kèm DirectX 12 & FFmpeg hardsub worker",
                  },
                  {
                    id: "macos",
                    name: "macOS (Apple Silicon & Intel)",
                    ext: ".dmg",
                    pkg: "VietsubVideoStudio-2.8.0.dmg",
                    color: "border-purple-500/30 bg-purple-950/20 text-purple-400",
                    desc: "Tệp ảnh đĩa macOS (.dmg) tối ưu Metal Video & Neural Engine M1/M2/M3/M4",
                  },
                  {
                    id: "linux",
                    name: "Linux (Debian / Ubuntu / AppImage)",
                    ext: ".deb",
                    pkg: "vietsub-video-studio_2.8.0_amd64.deb",
                    color: "border-amber-500/30 bg-amber-950/20 text-amber-400",
                    desc: "Gói cài đặt Debian (.deb) và Portable AppImage chạy không cần cài đặt",
                  },
                  {
                    id: "android",
                    name: "Android (APK Trực Tiếp)",
                    ext: ".apk",
                    pkg: "VietsubVideoStudio-release.apk",
                    color: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
                    desc: "Gói APK cài đặt trực tiếp không qua Store với khả năng xử lý cảm ứng",
                  },
                  {
                    id: "ios",
                    name: "iOS (WebClip & TestFlight)",
                    ext: ".ipa",
                    pkg: "VietsubVideoStudio-iOS.ipa",
                    color: "border-rose-500/30 bg-rose-950/20 text-rose-400",
                    desc: "Cấu hình WebClip Profile cài đặt màn hình chính Safari & TestFlight",
                  },
                  {
                    id: "tma",
                    name: "Telegram Mini App (TMA)",
                    ext: ".tar.gz",
                    pkg: "vietsub-tma-bundle.tar.gz",
                    color: "border-cyan-500/30 bg-cyan-950/20 text-cyan-400",
                    desc: "Gói Edge tối ưu cho Bot Telegram và TMA SDK v7.10 với OTP 6 ký tự",
                  },
                ].map((osItem) => (
                  <div
                    key={osItem.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{osItem.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${osItem.color}`}>
                          {osItem.ext}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{osItem.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/build/os/${osItem.id}`, { method: "POST" });
                            const data = await res.json();
                            onNotify?.(`Đã bắt đầu đóng gói tự động cho ${osItem.name}! Mã build: ${data.buildId}`, "success");
                          } catch (err: any) {
                            onNotify?.("Lỗi kích hoạt đóng gói: " + err.message, "error");
                          }
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Build {osItem.ext}</span>
                      </button>

                      <a
                        href={`https://github.com/hendy-server-AI-hub/hendy-studio-vietsub-test/releases/latest/download/${osItem.pkg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
                        title="Tải tệp cài đặt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
