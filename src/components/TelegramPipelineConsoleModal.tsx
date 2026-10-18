import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Shield,
  Zap,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileVideo,
  Globe,
  Sliders,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  Lock,
  Unlock,
  Radio,
  FileCode,
} from "lucide-react";

interface Step {
  name: string;
  status: string;
  message: string;
  durationMs?: number;
}

interface PipelineResult {
  jobId: string;
  status: string;
  verdict: string;
  durationTotalMs?: number;
  steps: Step[];
  patchedConfig?: string;
  recoveryPath?: string;
}

interface TelegramPipelineConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  onApplyVideoUrl?: (url: string) => void;
  onNotify?: (msg: string, type?: "success" | "error" | "info") => void;
}

export const TelegramPipelineConsoleModal: React.FC<TelegramPipelineConsoleModalProps> = ({
  isOpen,
  onClose,
  initialUrl = "",
  onApplyVideoUrl,
  onNotify,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pixelScale, setPixelScale] = useState(100);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [agentMessage, setAgentMessage] = useState("Local sandbox agent: Sẵn sàng kết nối");
  const [token, setToken] = useState(sessionStorage.getItem("pipeline_token") || "");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState<number | null>(null);
  const [strictMode, setStrictMode] = useState(true);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (initialUrl && !url) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  // Fetch pipeline status on open
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/pipeline/status")
      .then((res) => res.json())
      .then((data) => setPipelineStatus(data))
      .catch(() => {});

    // Check URL parameters for OTP auto-fill (e.g., from Telegram /token web_app URL)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlOtp = params.get("otp");
      if (urlOtp && urlOtp.length === 6) {
        setOtp(urlOtp.toUpperCase());
      }
    } catch (_e) {}
  }, [isOpen]);

  // Keyboard shortcut Ctrl+Z hook for editor undo point
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setAgentMessage("⚡ Phím tắt Ctrl+Z đã được bắt tại UI layer (Undo checkpoint)");
        onNotify?.("Đã hoàn tác thao tác gần nhất trong Pipeline", "info");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onNotify]);

  // OTP Countdown timer
  useEffect(() => {
    if (otpTimer === null) return;
    if (otpTimer <= 0) {
      setOtpTimer(null);
      return;
    }
    const timer = setInterval(() => {
      setOtpTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  if (!isOpen) return null;

  // Authenticate via Telegram WebApp initData
  const handleTelegramAuth = async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initData) {
      setAgentMessage("⚠️ Không phát hiện Telegram.WebApp trong trình duyệt. Vui lòng nhập mã OTP 6 ký tự.");
      onNotify?.("Không phát hiện Telegram context, hãy dùng mã OTP 6 ký tự.", "info");
      return;
    }

    try {
      tg.ready();
      tg.expand();
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xác thực Telegram thất bại");
      setToken(data.token);
      sessionStorage.setItem("pipeline_token", data.token);
      setAgentMessage(`🟢 Đã xác thực người dùng Telegram (${data.user?.first_name || data.user?.id})`);
      onNotify?.("Xác thực Telegram Mini App thành công!", "success");
    } catch (err: any) {
      setAgentMessage(`🔴 Lỗi xác thực Telegram: ${err.message}`);
    }
  };

  // Generate 6-character OTP (simulates /token from bot)
  const handleGenerateOtp = async () => {
    try {
      const res = await fetch("/api/auth/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "telegram_dev_console" }),
      });
      const data = await res.json();
      if (data.ok && data.code) {
        setOtp(data.code);
        setOtpTimer(60);
        setAgentMessage(`🔑 Đã tạo mã OTP mới: ${data.code} (hiệu lực 60 giây)`);
        onNotify?.(`Mã OTP mới: ${data.code} (hiệu lực 60s)`, "success");
      }
    } catch (err: any) {
      onNotify?.("Không thể tạo mã OTP: " + err.message, "error");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otp.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP không hợp lệ");
      setToken(data.token);
      sessionStorage.setItem("pipeline_token", data.token);
      setAgentMessage("🟢 OTP hợp lệ. Phiên Pipeline đã được mở an toàn.");
      onNotify?.("Xác thực OTP thành công! Quyền Pipeline đã mở.", "success");
    } catch (err: any) {
      setAgentMessage(`🔴 ${err.message}`);
      onNotify?.(err.message, "error");
    }
  };

  // Connect to local sandbox agent ws://127.0.0.1:8799
  const handleConnectAgent = () => {
    try {
      ws.current?.close();
      const socket = new WebSocket("ws://127.0.0.1:8799");
      socket.onopen = () => {
        setAgentMessage("🟢 Local sandbox agent :8799 đã kết nối thành công!");
        onNotify?.("Đã kết nối Local Sandbox Agent :8799", "success");
      };
      socket.onmessage = (event) => {
        setAgentMessage(`📩 Agent: ${event.data}`);
      };
      socket.onerror = () => {
        setAgentMessage("🟡 Local agent không phản hồi; tự động chuyển sang Cloud Gateway / Ktor API");
        onNotify?.("Local agent không khả dụng; dùng Cloudflare/Ktor API.", "info");
      };
      socket.onclose = () => {
        if (ws.current === socket) {
          setAgentMessage("Local sandbox agent đã ngắt kết nối.");
        }
      };
      ws.current = socket;
    } catch (err: any) {
      setAgentMessage("🟡 Đang dùng Cloudflare API trực tiếp.");
    }
  };

  // Run dry run gate
  const handleRunDryRun = async () => {
    setBusy(true);
    setResult(null);
    setAgentMessage("⏳ Đang khởi chạy quy trình kiểm tra Pipeline Gate (Dry-Run)...");

    try {
      const res = await fetch("/api/pipeline/dry-run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mode: "dry-run",
          inputType: selectedFile ? "video" : url ? "url" : "none",
          sourceUrl: url || null,
          filename: selectedFile?.name || null,
          strict: strictMode,
          runExtraction: Boolean(url),
          runTranscription: Boolean(selectedFile),
        }),
      });

      const body = await res.json();
      setResult(body);
      setAgentMessage(`✅ Hoàn thành: Trạng thái ${body.status} · Phán quyết ${body.verdict}`);
      onNotify?.(`Pipeline Gate: ${body.verdict}`, "success");
    } catch (err: any) {
      setAgentMessage(`🚨 Lỗi thực thi Dry-Run: ${err.message}`);
      onNotify?.("Dry-Run thất bại: " + err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const copyConfigToClipboard = () => {
    if (!result?.patchedConfig) return;
    navigator.clipboard.writeText(result.patchedConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
    onNotify?.("Đã sao chép cấu hình SOT vào bộ nhớ tạm", "success");
  };

  const handleApplyToStudio = () => {
    if (url && onApplyVideoUrl) {
      onApplyVideoUrl(url);
      onNotify?.("Đã tải video vào Vietsub Studio!", "success");
      onClose();
    }
  };

  const inputSummary = useMemo(() => {
    if (selectedFile) return `Tệp Video: ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)`;
    if (url) return `Đường dẫn URL: ${url}`;
    return "Chưa có đầu vào (sẽ dùng bộ kiểm tra giả lập)";
  }, [selectedFile, url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{ transform: `scale(${pixelScale / 100})`, transformOrigin: "top center", transition: "transform 0.15s ease" }}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Video Pipeline Console
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Ktor + Cloudflare Pages / TMA
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  NOMINAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tích hợp trực tiếp từ kho lưu trữ Telegram Video Editor Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Top Auth & Token Strip */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Xác thực Telegram & Mã OTP 6 ký tự</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium border ${
                    token
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {token ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {token ? "Phiên: ĐÃ KẾT NỐI" : "Phiên: CHƯA CÓ"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <button
                onClick={handleTelegramAuth}
                className="sm:col-span-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
              >
                <Radio className="w-3.5 h-3.5" />
                Xác thực Telegram WebApp
              </button>

              <div className="sm:col-span-5 flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  placeholder="Mã OTP 6 ký tự"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono uppercase tracking-widest text-center text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shrink-0"
                >
                  Xác minh
                </button>
              </div>

              <button
                onClick={handleGenerateOtp}
                className="sm:col-span-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tạo OTP {otpTimer !== null ? `(${otpTimer}s)` : ""}
              </button>
            </div>
          </div>

          {/* Grid: Inputs & Execution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Panel: Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileVideo className="w-3.5 h-3.5 text-cyan-400" />
                  Đầu vào Đa phương tiện
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">URL Mạng xã hội / Video</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://tiktok.com/... hoặc youtube.com/..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Tệp MP4 / Ảnh OCR trích xuất</label>
                  <input
                    type="file"
                    accept="video/mp4,image/*,audio/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600/20 file:text-cyan-300 hover:file:bg-cyan-600/30 file:cursor-pointer cursor-pointer bg-slate-900/60 p-1.5 rounded-xl border border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Độ thu phóng Pixel:</span>
                    <span className="font-mono text-cyan-400">{pixelScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={pixelScale}
                    onChange={(e) => setPixelScale(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs text-slate-400 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strictMode}
                      onChange={(e) => setStrictMode(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    Strict Gate (Nghiêm ngặt)
                  </label>
                  <button
                    onClick={handleConnectAgent}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <Activity className="w-3 h-3" />
                    Sandbox :8799
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRunDryRun}
                    disabled={busy}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                  >
                    {busy ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        ĐANG KIỂM TRA PIPELINE...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        CHẠY THỬ & SỬA LỖI (DRY-RUN)
                      </>
                    )}
                  </button>
                </div>

                {url && (
                  <button
                    onClick={handleApplyToStudio}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2 transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Mở Video này trong Vietsub Studio
                  </button>
                )}
              </div>

              {/* Status pill message */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
                {agentMessage}
              </div>
            </div>

            {/* Right Panel: Pipeline Gate Diagnostics */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Pipeline Gate Status
                  </h3>
                  {result && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {result.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {result.verdict}
                      </span>
                    </div>
                  )}
                </div>

                {result ? (
                  <div className="space-y-2">
                    {result.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          {step.status === "PASS" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-200">
                              {step.name}
                            </div>
                            <div className="text-[11px] text-slate-400 leading-relaxed">
                              {step.message}
                            </div>
                          </div>
                        </div>
                        {step.durationMs !== undefined && (
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {step.durationMs}ms
                          </span>
                        )}
                      </div>
                    ))}

                    {/* SOT Patched Config Inspector */}
                    {result.patchedConfig && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
                          <span className="font-semibold flex items-center gap-1">
                            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                            Cấu hình SOT Patched Configuration
                          </span>
                          <button
                            onClick={copyConfigToClipboard}
                            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                          >
                            {copiedConfig ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedConfig ? "Đã sao chép" : "Sao chép"}
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-36">
                          {result.patchedConfig}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 px-4 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                    <Layers className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs text-slate-400 font-medium">
                      Chưa có kết quả kiểm tra.
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Nhấn nút <strong className="text-cyan-400">"Chạy Thử & Sửa Lỗi (Dry-Run)"</strong> bên trái để chạy toàn bộ 6 bước kiểm tra bảo mật, SOT auto-patch và FFmpeg engine.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span>Đầu vào hiện tại: {inputSummary}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-mono">Release Gate: NOMINAL · RELEASE_UNLOCKED</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Đóng Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
