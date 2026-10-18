import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  ExternalLink,
  Check,
  Copy,
  Code2,
  Database,
  Play,
  RefreshCw,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import {
  ADMIN_ID,
  MINI_APP_URL,
  WEB_APP_URL,
  CORE_BACKEND_URL,
  BRANDS,
  HENDY_BOT_FULL_SOURCE_CODE,
  sendAdminCommandViaKtorClient,
} from "../services/telegramHendyBot";
import { useWorkspaceRoute } from "../workspace-router";
import {
  generateSignedTelegramInitData,
  verifyTelegramWebAppInitData,
  TelegramWebAppAuthResult,
} from "../utils/edgeCryptoAuth";

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadModal?: () => void;
  onOpenPipelineConsole?: () => void;
  inlineMode?: boolean;
  isWorkspaceActive?: boolean;
  onNavigateAdminWorkspace?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  buttons?: Array<{ text: string; action: string; url?: string }>;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
  onOpenDownloadModal,
  onOpenPipelineConsole,
  inlineMode = false,
  isWorkspaceActive,
  onNavigateAdminWorkspace,
}) => {
  const {
    activeWorkspace,
    isHomeRouteActive,
    isTelegramWorkspaceActive,
    isAdminWorkspaceActive,
    navigateToWorkspace,
  } = useWorkspaceRoute();

  // Workspace-based routing check:
  // Completely hide TelegramBotModal when on the Home route or when its workspace is inactive
  const isBotRouteActive =
    isWorkspaceActive !== undefined
      ? isWorkspaceActive
      : isTelegramWorkspaceActive || isAdminWorkspaceActive;

  const isAdminRouteActive = isAdminWorkspaceActive;

  const [activeTab, setActiveTab] = useState<
    "chat" | "worker" | "kho" | "tma_payments"
  >("chat");
  const [balance, setBalance] = useState<number>(50000);
  const [activeState, setActiveState] = useState<{
    action: string;
    brand?: string;
    platform?: string;
  } | null>(null);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [copiedWorker, setCopiedWorker] = useState(false);
  const [ktorTriggerStatus, setKtorTriggerStatus] = useState<string>("");
  const [tmaAuthResult, setTmaAuthResult] =
    useState<TelegramWebAppAuthResult | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_1",
      sender: "bot",
      text:
        `🤖 *BOT HENDY CYBERTECH 2026* [BOT CHÍNH] 🚀\n` +
        `Buổi chiều vui vẻ nhé, *Khách*\n` +
        `--------------------------------------------------\n` +
        `💎 *VIP 0*\n` +
        `💰 **Ví Chính:** \`50,000 VNĐ\``,
      timestamp: "12:00",
      buttons: [
        { text: "🛍️ TRUNG TÂM MUA CODE MINI TRỰC TIẾP", action: "shop_code_mini" },
        { text: "🌐 DỊCH VỤ MẠNG XÃ HỘI", action: "social_service" },
        { text: "💳 NẠP TIỀN", action: "deposit" },
        { text: "💎 TRUNG TÂM KHÁCH HÀNG", action: "cshk_center" },
        { text: "🤖 BOT DỊCH VỤ VIETSUB (PIPELINE)", action: "bot_vietsub" },
        { text: "🚀 COMPOSE WEB / TMA KTOR ENTRYPOINT", action: "compose_web_tma" },
        { text: "🎧 LIÊN HỆ CSKH", action: "url", url: "https://t.me/your_support" },
        { text: "🛠 ADMIN QUẢN LÝ XÂY DỰNG PHÁT TRIỂN Vietsub", action: "admin_panel" },
      ],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const syncBotState = async () => {
    try {
      const res = await fetch("/api/telegram/bot-state");
      const data = await res.json();
      if (data.ok && data.users?.[ADMIN_ID]) {
        const u = data.users[ADMIN_ID];
        setBalance(u.balance ?? 50000);
        setUserProfileData(u);
        setActiveState(data.activeStates?.[ADMIN_ID] || null);
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen || inlineMode) {
      syncBotState();
    }
  }, [isOpen, inlineMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Workspace-based routing enforcement:
  // Completely hide TelegramBotModal when on the Home route or when inactive
  if (isHomeRouteActive || !isBotRouteActive || (!isOpen && !inlineMode)) {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const displayUserText = text.startsWith("cb:") ? `🔘 [${text.replace(/^cb:/, "")}]` : text;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text: displayUserText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const payload: any = {
        update_id: Date.now(),
      };

      if (text.startsWith("cb:")) {
        payload.callback_query = {
          id: "cq_" + Date.now(),
          from: { id: Number(ADMIN_ID), first_name: "Hendy Admin", username: "hendy_admin" },
          message: {
            message_id: Math.floor(Math.random() * 1000),
            chat: { id: Number(ADMIN_ID), type: "private" },
          },
          data: text.replace(/^cb:/, ""),
        };
      } else {
        payload.message = {
          message_id: Math.floor(Math.random() * 1000),
          from: { id: Number(ADMIN_ID), first_name: "Hendy Admin", username: "hendy_admin" },
          chat: { id: Number(ADMIN_ID), type: "private" },
          date: Math.floor(Date.now() / 1000),
          text,
        };
      }

      const res = await fetch("/api/telegram/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const botResponse = data.result;

      if (data.userProfile) {
        if (typeof data.userProfile.balance === "number") {
          setBalance(data.userProfile.balance);
        }
        setActiveState(data.userProfile.activeState || null);
        setUserProfileData(data.userProfile);
      }

      const inlineButtons: Array<{ text: string; action: string; url?: string }> = [];
      if (botResponse?.reply_markup?.inline_keyboard) {
        botResponse.reply_markup.inline_keyboard.flat().forEach((b: any) => {
          inlineButtons.push({
            text: b.text,
            action: b.callback_data || (b.web_app ? "open_tma" : "url"),
            url: b.url || b.web_app?.url,
          });
        });
      }

      const botMsg: Message = {
        id: "b_" + Date.now(),
        sender: "bot",
        text: botResponse?.text || "Đã nhận lệnh từ bạn.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        buttons: inlineButtons.length > 0 ? inlineButtons : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "bot",
          text: `⚠️ Lỗi kết nối Webhook: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerKtorClient = async () => {
    try {
      setKtorTriggerStatus("Đang gửi lệnh Ktor Client...");
      const data = await sendAdminCommandViaKtorClient("SYNC_KHO_AND_PIPELINE", ADMIN_ID);
      setKtorTriggerStatus(data.message || "200 OK - Ktor Trigger Executed");
      await syncBotState();
    } catch (err: any) {
      setKtorTriggerStatus("Lỗi: " + err.message);
    }
  };

  const handleVerifyTmaHmacAuth = async () => {
    try {
      const signed = await generateSignedTelegramInitData({
        id: ADMIN_ID,
        firstName: "Hendy Admin",
        username: "hendy_admin",
      });
      const verified = await verifyTelegramWebAppInitData(signed.initData);
      setTmaAuthResult(verified);
      // Also verify with backend /api/auth/telegram
      await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: signed.initData }),
      });
    } catch (err) {
      console.error("TMA HMAC verification error:", err);
    }
  };

  const handleCheckoutPayment = async (
    provider: "stripe" | "telegram_stars" | "vietqr",
    amountVnd: number,
    packageTitle: string
  ) => {
    setIsProcessingPayment(true);
    setPaymentMessage("");
    try {
      const res = await fetch("/api/telegram/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: ADMIN_ID,
          provider,
          amountVnd,
          packageTitle,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setBalance(data.newBalance);
        if (data.userProfile) setUserProfileData(data.userProfile);
        setPaymentMessage(data.message);
      }
    } catch (err: any) {
      setPaymentMessage("Lỗi thanh toán: " + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleButtonClick = (btn: { text: string; action: string; url?: string }) => {
    if (btn.action === "open_download") {
      if (!inlineMode) onClose();
      onOpenDownloadModal?.();
    } else if (
      btn.action === "open_pipeline_console" ||
      btn.action === "pipeline_dry_run" ||
      btn.action === "get_pipeline_token" ||
      btn.action === "open_tma"
    ) {
      if (!inlineMode) onClose();
      onOpenPipelineConsole?.();
    } else if (
      btn.action === "admin_panel" ||
      btn.action === "compose_web_tma" ||
      btn.action === "cmd_admin"
    ) {
      if (onNavigateAdminWorkspace) {
        onNavigateAdminWorkspace();
      } else if (activeWorkspace !== "DockerKtor") {
        navigateToWorkspace("DockerKtor");
      } else {
        handleSendMessage("cb:" + btn.action);
      }
    } else if (btn.action === "cmd_status") {
      handleSendMessage("/status");
    } else if (btn.action !== "url") {
      handleSendMessage("cb:" + btn.action);
    }
  };

  const copyWorkerSource = () => {
    navigator.clipboard.writeText(HENDY_BOT_FULL_SOURCE_CODE);
    setCopiedWorker(true);
    setTimeout(() => setCopiedWorker(false), 2000);
  };

  const containerContent = (
    <div
      className={`flex flex-col bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${
        inlineMode ? "w-full h-[calc(100dvh-130px)] min-h-[600px]" : "relative w-full max-w-3xl h-[720px]"
      }`}
    >
      {/* Telegram Bot Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#1A2232] border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#24A1DE] flex items-center justify-center font-bold text-lg shadow-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">
                TRỢ LÝ TELEGRAM HENDY CYBERTECH
              </h3>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2 font-mono tabular-nums">
              {isAdminRouteActive && (
                <>
                  <span>ADMIN_ID: {ADMIN_ID}</span>
                  <span>·</span>
                </>
              )}
              <span className="text-emerald-400 font-semibold">
                Ví Chính: {balance.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 p-1 bg-[#090B10] rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "chat" ? "bg-[#24A1DE] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Trò chuyện Bot
            </button>
            <button
              onClick={() => setActiveTab("kho")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                activeTab === "kho" ? "bg-[#24A1DE] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-3 h-3" />
              <span>Kho Tài Khoản ({BRANDS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("tma_payments")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                activeTab === "tma_payments"
                  ? "bg-[#24A1DE] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>TMA HMAC & Thanh toán</span>
            </button>
            {isAdminRouteActive && (
              <button
                onClick={() => setActiveTab("worker")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  activeTab === "worker" ? "bg-[#24A1DE] text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Cấu hình & Mã nguồn (Admin)</span>
              </button>
            )}
          </div>

          {!inlineMode && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 transition text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {activeTab === "worker" && isAdminRouteActive ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090B10] text-xs text-slate-200">
          <div className="p-4 rounded-xl bg-[#11151F] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400">
                Cấu hình Endpoint, Cloudflare Worker & Ktor Client Bridge
              </span>
              <span className="text-xs font-mono text-emerald-400">ONLINE</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <div>
                • ADMIN_ID: <span className="text-amber-300">{ADMIN_ID}</span>
              </div>
              <div>
                • MINI_APP_URL: <span className="text-sky-300">{MINI_APP_URL}</span>
              </div>
              <div>
                • WEB_APP_URL: <span className="text-sky-300">{WEB_APP_URL}</span>
              </div>
              <div>
                • CORE_BACKEND_URL: <span className="text-emerald-300">{CORE_BACKEND_URL}</span>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={handleTriggerKtorClient}
                className="px-3.5 py-2 rounded-xl bg-[#24A1DE] hover:bg-[#1f8fc5] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Thực thi sendAdminCommandViaKtorClient (/api/bot-trigger)</span>
              </button>
              {ktorTriggerStatus && (
                <span className="text-xs text-emerald-400 font-mono truncate">{ktorTriggerStatus}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">
                Toàn bộ mã nguồn Bot Telegram Hendy Cybertech (Cloudflare Worker & Ktor Bridge)
              </span>
              <button
                onClick={copyWorkerSource}
                className="px-3 py-1.5 rounded-xl bg-[#11151F] hover:bg-slate-800 border border-white/10 text-cyan-300 flex items-center gap-1.5 text-xs cursor-pointer"
              >
                {copiedWorker ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedWorker ? "Đã sao chép" : "Sao chép toàn bộ mã Bot"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#11151F] border border-white/10 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[420px] leading-relaxed select-all">
              {HENDY_BOT_FULL_SOURCE_CODE}
            </pre>
          </div>
        </div>
      ) : activeTab === "kho" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090B10] text-xs text-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">
                {isAdminRouteActive
                  ? "Trạng Thái Kho Acc & Tài Khoản Liên Kết (PostgreSQL + Bot Memory)"
                  : "Trạng Thái Kho Tài Khoản & Danh Mục Liên Kết"}
              </h4>
              <p className="text-xs text-slate-400">
                13 thương hiệu hỗ trợ: {BRANDS.join(" · ")}
              </p>
            </div>
            <button
              onClick={syncBotState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11151F] border border-white/10 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đồng bộ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BRANDS.map((brand) => {
              const khoItems: Array<{ acc: string; checked: boolean }> =
                userProfileData?.accountKho?.[brand] || [];
              const linkedItems: string[] = userProfileData?.linkedAccounts?.[brand] || [];
              return (
                <div
                  key={brand}
                  className="p-3.5 rounded-xl bg-[#11151F] border border-white/10 flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">{brand}</span>
                    <span className="text-xs font-mono text-cyan-400 tabular-nums">
                      Kho: {khoItems.length}/50
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                    <div>• Đã check: {khoItems.filter((i) => i.checked).length}</div>
                    <div>• Liên kết: {linkedItems.length} tài khoản</div>
                  </div>
                  <div className="pt-1 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        handleSendMessage(`cb:shop_kho_detail_${brand}`);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition cursor-pointer"
                    >
                      Mở Kho {brand}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("chat");
                        handleSendMessage(`cb:add_acc_${brand}`);
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-[#24A1DE] hover:bg-[#1f8fc5] text-white text-[11px] font-semibold transition cursor-pointer"
                    >
                      + Thêm Acc
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === "tma_payments" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#090B10] text-xs text-slate-200">
          {/* 1. WebApp SDK Wasm/JS & HMAC-SHA256 Auth */}
          <div className="p-4 rounded-xl bg-[#11151F] border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>WebApp SDK Wasm/JS & Xác Thực HMAC-SHA256</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Xác thực mật mã <span className="font-mono text-cyan-300">Telegram.WebApp.initData</span> bằng Web Crypto API (<span className="font-mono text-slate-300">HMAC-SHA256("WebAppData", BOT_TOKEN)</span>)
                </p>
              </div>
              <button
                type="button"
                onClick={handleVerifyTmaHmacAuth}
                className="px-3.5 py-2 rounded-xl bg-[#24A1DE] hover:bg-[#1f8fc5] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Chạy Xác Thực HMAC-SHA256</span>
              </button>
            </div>

            {tmaAuthResult && (
              <div className="p-3 rounded-xl bg-[#090B10] border border-emerald-500/30 font-mono text-[11px] space-y-1 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">
                    ✓ HMAC-SHA256 SIGNATURE VERIFIED (ZERO-TRUST)
                  </span>
                  <span className="text-slate-400">
                    Freshness: {tmaAuthResult.freshnessSeconds}s
                  </span>
                </div>
                <div>• User ID: {tmaAuthResult.chatId} ({tmaAuthResult.firstName})</div>
                <div className="truncate">• Computed Hash: {tmaAuthResult.computedHash}</div>
              </div>
            )}
          </div>

          {/* 2. Stripe & Telegram Stars (XTR) / VietQR Payments */}
          <div className="p-4 rounded-xl bg-[#11151F] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Cổng Thanh Toán Stripe · Telegram Stars (XTR) · VietQR</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nạp tiền tức thì vào Ví Chính Bot & Mở khóa gói Render Vietsub Pro
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Số dư: {balance.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#090B10] border border-white/10 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-xs font-mono text-sky-400">STRIPE CHECKOUT</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Gói Creator +100,000 VNĐ
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Thanh toán quốc tế Visa/Mastercard qua Stripe Gateway.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() =>
                    handleCheckoutPayment("stripe", 100000, "Gói Creator Stripe")
                  }
                  className="w-full py-2 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition cursor-pointer"
                >
                  Thanh toán Stripe (+100k)
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090B10] border border-white/10 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-xs font-mono text-amber-400">TELEGRAM STARS (XTR)</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    250 ⭐ Stars (+250,000 VNĐ)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Thanh toán trực tiếp bằng Telegram Stars trong Mini App.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() =>
                    handleCheckoutPayment(
                      "telegram_stars",
                      250000,
                      "Gói 250 Telegram Stars"
                    )
                  }
                  className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Nạp bằng ⭐ Stars (+250k)
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090B10] border border-white/10 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-xs font-mono text-emerald-400">VIETQR AUTO BANKING</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    MB Bank Auto (+500,000 VNĐ)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Quét mã VietQR tự động xác nhận qua Webhook trong 3 giây.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() =>
                    handleCheckoutPayment("vietqr", 500000, "Gói VIP Studio VietQR")
                  }
                  className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Nạp nhanh VietQR (+500k)
                </button>
              </div>
            </div>

            {paymentMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                {paymentMessage}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Commands Bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0B0E14] border-b border-white/10 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSendMessage("/start")}
              className="px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-slate-800 border border-white/10 text-sky-400 font-mono shrink-0 transition cursor-pointer"
            >
              /start
            </button>
            <button
              onClick={() => handleSendMessage("cb:shop_code_mini")}
              className="px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-slate-800 border border-white/10 text-amber-300 shrink-0 transition cursor-pointer"
            >
              🛍️ Trung Tâm Mua Code
            </button>
            <button
              onClick={() => handleSendMessage("cb:shop_kjc_cu")}
              className="px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-slate-800 border border-white/10 text-emerald-300 shrink-0 transition cursor-pointer"
            >
              🎮 Liên Minh KJC Cũ
            </button>
            <button
              onClick={() => handleSendMessage("cb:shop_abcvip_group")}
              className="px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-slate-800 border border-white/10 text-rose-300 shrink-0 transition cursor-pointer"
            >
              ❤️ Liên Minh ABCVIP
            </button>
            <button
              onClick={() => handleSendMessage("cb:bot_vietsub")}
              className="px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-slate-800 border border-white/10 text-cyan-300 shrink-0 transition cursor-pointer"
            >
              🤖 Vietsub Pipeline
            </button>
            {isAdminRouteActive && (
              <>
                <button
                  onClick={() => handleSendMessage("cb:compose_web_tma")}
                  className="px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-slate-800 border border-white/10 text-purple-300 shrink-0 transition cursor-pointer"
                >
                  🚀 Ktor TMA
                </button>
                <button
                  onClick={() => handleSendMessage("cb:admin_panel")}
                  className="px-2.5 py-1 rounded-lg bg-[#11151F] hover:bg-slate-800 border border-white/10 text-slate-200 shrink-0 transition cursor-pointer"
                >
                  🛠 Admin Panel
                </button>
              </>
            )}
          </div>

          {activeState && (
            <div className="px-3.5 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
              <span>
                Đang chờ nhập liệu: <strong>{activeState.action}</strong>{" "}
                {activeState.brand ? `(${activeState.brand})` : ""}{" "}
                {activeState.platform ? `(${activeState.platform})` : ""}
              </span>
              <button
                onClick={() => handleSendMessage("/start")}
                className="underline hover:text-white cursor-pointer"
              >
                Hủy trạng thái
              </button>
            </div>
          )}

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090B10]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-[#24A1DE] text-white rounded-br-xs"
                      : "bg-[#11151F] border border-white/10 text-slate-100 rounded-bl-xs"
                  }`}
                >
                  {m.text}
                  <div
                    className={`text-[10px] mt-1.5 text-right font-mono ${
                      m.sender === "user" ? "text-white/75" : "text-slate-500"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {/* Inline Keyboards */}
                {m.buttons && m.buttons.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full max-w-[85%]">
                    {m.buttons
                      .filter(
                        (btn) =>
                          isAdminRouteActive ||
                          (btn.action !== "compose_web_tma" &&
                            btn.action !== "admin_panel" &&
                            btn.action !== "cmd_admin")
                      )
                      .map((btn, idx) =>
                        btn.action === "url" && btn.url ? (
                          <a
                            key={idx}
                            href={btn.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-xl bg-[#11151F] hover:bg-slate-800 border border-white/10 text-sky-300 text-xs font-medium flex items-center justify-center gap-2 transition"
                          >
                            <span className="truncate">{btn.text}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <button
                            key={idx}
                            onClick={() => handleButtonClick(btn)}
                            className="w-full py-2 px-3 rounded-xl bg-[#11151F] hover:bg-slate-800 border border-white/10 text-sky-300 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <span className="truncate">{btn.text}</span>
                          </button>
                        )
                      )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="text-xs text-slate-400 font-mono">
                Đang xử lý phản hồi từ Webhook Bot Hendy Cybertech...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#11151F] border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                activeState
                  ? `Nhập dữ liệu cho ${activeState.action} (${activeState.brand || activeState.platform || ""})...`
                  : isAdminRouteActive
                  ? "Nhập lệnh (/start, /status, /admin) hoặc gửi Link Video / Tài khoản..."
                  : "Nhập lệnh (/start) hoặc gửi Link Video / Tài khoản..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#090B10] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#24A1DE]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#24A1DE] hover:bg-[#1f8fc5] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (inlineMode) {
    return containerContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {containerContent}
    </div>
  );
};
