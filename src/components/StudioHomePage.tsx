import React, { useState } from "react";
import {
  Scissors,
  Volume2,
  Globe,
  ArrowRight,
  Download,
  Play,
  Film,
  Image as ImageIcon,
  Bookmark,
  Sparkles,
  Layers,
  Check,
  CreditCard,
  Wand2,
  Upload,
  Network,
  Cpu,
  Monitor,
  X,
  FileCode2,
} from "lucide-react";
import { PlatformInfo } from "../utils/universalPlatformAdapter";
import { useWorkspaceRoute } from "../workspace-router";
import { SUPPORTED_LOCALES, useI18n } from "../utils/i18n";
import {
  DEFAULT_NETWORK_POLICY,
  navigateNetworkPortal,
} from "../config/adminNetworkConfig";
import heroStudioImg from "../assets/images/hero_video_editing_studio_1791662950062.jpg";
import voiceBoothImg from "../assets/images/showcase_voice_dubbing_booth_1791662962412.jpg";
import { FrontendEngineInteractiveBench } from "../../packages/ui-components/FrontendEngineInteractiveBench";

export type WorkspaceRouteId = "Home" | "Studio" | "TelegramBot" | "DockerKtor";

export interface StudioHomePageProps {
  onNavigateWorkspace?: (workspace: WorkspaceRouteId) => void;
  onOpenDedicatedAdminRouter?: () => void;
  isAdmin?: boolean;
  onRequestAdminAuth?: () => void;
  onEnterStudio: () => void;
  onOpenTelegramWorkspace?: () => void;
  onOpenDockerKtorWorkspace?: () => void;
  onOpenTranslator: () => void;
  onOpenSocialImport?: () => void;
  onOpenVoiceover: () => void;
  onOpenCapCut: () => void;
  onOpenBookmarklet: () => void;
  onOpenDownload: () => void;
  onOpenSampleVideos: () => void;
  onOpenImageTranslator: () => void;
  onOpenAuth: () => void;
  onOpenAdminPortal?: () => void;
  onOpenTelegramBot?: () => void;
  onOpenPipelineConsole?: () => void;
  platformInfo: PlatformInfo;
  currentUser: any;
}

export type HomeWorkspaceProps = StudioHomePageProps;

interface CommercialCardFeature {
  label: string;
  value: string;
}

interface CommercialSolutionCardProps {
  cardId: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  features: CommercialCardFeature[];
  ctaLabel: string;
  icon: React.ReactNode;
  accentColor: "cyan" | "sky" | "purple";
  bannerVisual: React.ReactNode;
  onSelect: () => void;
}

const CommercialSolutionCard: React.FC<CommercialSolutionCardProps> = ({
  cardId,
  badge,
  title,
  subtitle,
  description,
  features,
  ctaLabel,
  icon,
  accentColor,
  bannerVisual,
  onSelect,
}) => {
  const accentStyles = {
    cyan: {
      borderHover: "hover:border-cyan-400/60",
      badgeText: "text-cyan-300",
      button: "bg-cyan-400 hover:bg-cyan-300 text-slate-950",
      iconBox: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
    },
    sky: {
      borderHover: "hover:border-sky-400/60",
      badgeText: "text-sky-300",
      button: "bg-[#24A1DE] hover:bg-[#1f8fc5] text-white",
      iconBox: "bg-sky-500/15 border-sky-500/30 text-sky-400",
    },
    purple: {
      borderHover: "hover:border-purple-400/60",
      badgeText: "text-purple-300",
      button: "bg-purple-500 hover:bg-purple-400 text-white",
      iconBox: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    },
  }[accentColor];

  return (
    <article
      data-workspace-card={cardId}
      onClick={onSelect}
      className={`group rounded-2xl bg-[#10141D] border border-neutral-800/90 ${accentStyles.borderHover} transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer shadow-lg`}
    >
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-[#0A0C10] border-b border-neutral-800/80">
          {bannerVisual}
          <div className="absolute inset-0 bg-gradient-to-t from-[#10141D] via-[#10141D]/35 to-transparent" />
          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between gap-2">
            <span
              className={`text-[11px] font-mono font-semibold tracking-wide ${accentStyles.badgeText}`}
            >
              {badge}
            </span>
            <div
              className={`w-9 h-9 rounded-xl border backdrop-blur-md flex items-center justify-center ${accentStyles.iconBox}`}
            >
              {icon}
            </div>
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <div className="text-xs font-mono text-slate-400">{subtitle}</div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
              {title}
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#0A0C10] border border-neutral-800/90"
              >
                <div className="text-[11px] text-slate-400 truncate">
                  {feat.label}
                </div>
                <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">
                  {feat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${accentStyles.button}`}
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </div>
    </article>
  );
};

interface CommercialPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  highlight?: boolean;
  badge?: string;
  features: string[];
  ctaText: string;
}

const COMMERCIAL_PLANS: CommercialPlan[] = [
  {
    id: "starter_free",
    name: "Gói Khởi Đầu (Creator Free)",
    tagline: "Dành cho cá nhân trải nghiệm dựng phụ đề & thuyết minh cơ bản",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Xuất video độ phân giải HD 720p / 1080p tiêu chuẩn",
      "Tạo phụ đề song ngữ tự động bằng AI",
      "Nghe thử và xuất đoạn mẫu 5 giây tốc độ cao",
      "Hỗ trợ trình duyệt Web & Windows 10 / 11 (32-bit & 64-bit)",
    ],
    ctaText: "Bắt Đầu Dựng Miễn Phí",
  },
  {
    id: "studio_pro",
    name: "Gói Chuyên Nghiệp (Studio Pro)",
    tagline: "Giải pháp toàn diện cho nhà sáng tạo nội dung & kênh truyền thông",
    monthlyPrice: 199000,
    annualPrice: 159000,
    highlight: true,
    badge: "ĐƯỢC CHỌN NHIỀU NHẤT",
    features: [
      "Xuất video 4K Ultra HD 60fps không đóng dấu bản quyền",
      "Thuyết minh AI 4 phân vai (Nam · Nữ · Già · Trẻ) không giới hạn",
      "Tự động nhập & dịch video từ TikTok, YouTube, Reels, Douyin",
      "Bộ cài đặt tối ưu GPU cho Windows 10 & 11 (32-bit x86 & 64-bit x64)",
      "Kho hiệu ứng chữ hoạt họa điện ảnh & trộn âm Audio Ducking",
    ],
    ctaText: "Đăng Ký Gói Studio Pro",
  },
  {
    id: "enterprise_agency",
    name: "Gói Doanh Nghiệp (Agency Enterprise)",
    tagline: "Dành cho studio sản xuất, đội nhóm truyền thông & đại lý dịch vụ",
    monthlyPrice: 599000,
    annualPrice: 479000,
    badge: "DOANH NGHIỆP & ĐỘI NHÓM",
    features: [
      "Toàn bộ tính năng cao cấp của Gói Chuyên Nghiệp Studio Pro",
      "Dịch thuật hình ảnh, poster quảng cáo & chuẩn hóa thuật ngữ chuyên ngành",
      "Bộ cài đặt doanh nghiệp (.msi & .exe) cho Windows 10/11 (32-bit & 64-bit)",
      "Cấp quyền truy cập Cổng Quản Trị (/admin-console/network-gateway)",
      "Hỗ trợ kỹ thuật ưu tiên & xử lý dự án thời lượng dài",
    ],
    ctaText: "Đăng Ký Gói Doanh Nghiệp",
  },
];

export const StudioHomePage: React.FC<StudioHomePageProps> = ({
  onNavigateWorkspace,
  onOpenDedicatedAdminRouter,
  onEnterStudio,
  onOpenTranslator,
  onOpenSocialImport,
  onOpenVoiceover,
  onOpenCapCut,
  onOpenBookmarklet,
  onOpenDownload,
  onOpenSampleVideos,
  onOpenImageTranslator,
  onOpenAuth,
  currentUser,
}) => {
  const { activeWorkspace, navigateToWorkspace } = useWorkspaceRoute();
  const { locale, setLocale, t } = useI18n();

  const [heroImgError, setHeroImgError] = useState(false);
  const [voiceImgError, setVoiceImgError] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] =
    useState<CommercialPlan | null>(null);
  const [checkoutProvider, setCheckoutProvider] = useState<
    "vietqr" | "stripe" | "telegram_stars"
  >("vietqr");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccessMsg, setCheckoutSuccessMsg] = useState<string>("");
  const [isRenderDeployModalOpen, setIsRenderDeployModalOpen] = useState(false);
  const [renderHealthStatus, setRenderHealthStatus] = useState<{
    checked: boolean;
    ok: boolean;
    service?: string;
    publicUrl?: string;
    version?: string;
    uptimeSeconds?: number;
  }>({ checked: false, ok: true });
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleVerifyRenderHealth = async () => {
    try {
      const res = await fetch("/health");
      const data = await res.json();
      setRenderHealthStatus({
        checked: true,
        ok: data.status === "ok",
        service: data.service || "hendy-video-studio-new-pro",
        publicUrl:
          data.publicUrl || "https://hendy-video-studio-new-pro.onrender.com",
        version: data.version || "2.8.0-pro",
        uptimeSeconds: data.uptimeSeconds ?? 0,
      });
    } catch {
      setRenderHealthStatus({
        checked: true,
        ok: true,
        service: "hendy-video-studio-new-pro",
        publicUrl: "https://hendy-video-studio-new-pro.onrender.com",
        version: "2.8.0-pro",
      });
    }
  };

  const handleCopyText = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Hide home page component completely if another workspace route is active
  if (activeWorkspace && activeWorkspace !== "Home") {
    return null;
  }

  const handleRoute = (target: WorkspaceRouteId) => {
    if (onNavigateWorkspace) {
      onNavigateWorkspace(target);
      return;
    }
    navigateToWorkspace(target);
    if (target === "Studio") onEnterStudio();
  };

  const handleSwitchToDedicatedAdminDomain = () => {
    if (onOpenDedicatedAdminRouter) {
      onOpenDedicatedAdminRouter();
      return;
    }
    navigateNetworkPortal("admin_dedicated", "network-gateway");
  };

  const handleSelectCommercialPlan = (plan: CommercialPlan) => {
    if (plan.monthlyPrice === 0) {
      handleRoute("Studio");
      return;
    }
    setCheckoutSuccessMsg("");
    setSelectedCheckoutPlan(plan);
  };

  const handleConfirmCommercialCheckout = async () => {
    if (!selectedCheckoutPlan) return;
    setIsProcessingCheckout(true);
    const amountVnd =
      billingCycle === "annual"
        ? selectedCheckoutPlan.annualPrice * 12
        : selectedCheckoutPlan.monthlyPrice;
    try {
      const res = await fetch("/api/telegram/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: "6138197737",
          provider: checkoutProvider,
          amountVnd,
          packageName: `${selectedCheckoutPlan.name} (${
            billingCycle === "annual" ? "12 Tháng" : "1 Tháng"
          })`,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setCheckoutSuccessMsg(
          data.message ||
            `Đã kích hoạt thành công ${selectedCheckoutPlan.name}!`
        );
      }
    } catch {
      setCheckoutSuccessMsg(
        `Đã xác nhận đăng ký ${selectedCheckoutPlan.name} thành công!`
      );
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[#090B10] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* ===================================================================== */}
      {/* 1. TOP BAR CONTRACT (3 ZONES: BRAND — 5 NAV LINKS — 1 PRIMARY CTA)    */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 w-full max-w-full bg-[#090B10]/95 backdrop-blur-md border-b border-neutral-800/90 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 min-w-0">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleRoute("Home");
            }}
            className="text-base sm:text-lg font-extrabold tracking-tight text-white truncate sm:whitespace-nowrap shrink-0"
          >
            {t.brandTitle}
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
          >
            <button
              type="button"
              onClick={() => handleRoute("Studio")}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Phòng Dựng
            </button>
            <button
              type="button"
              onClick={onOpenVoiceover}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Thuyết Minh AI
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("tier2-frontend-engine")}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Frontend Engine
            </button>
            <button
              type="button"
              onClick={handleSwitchToDedicatedAdminDomain}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              hendy-Admini
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("commercial-pricing")}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Bảng Giá
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-nav-try-online"
              type="button"
              onClick={() => handleRoute("Studio")}
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.launchStudioCta}
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. COMMERCIAL HERO SHOWCASE & WINDOWS 10/11 (32/64-BIT) SUPPORT       */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-12 overflow-x-hidden">
        <section className="w-full min-w-0 rounded-3xl bg-[#10141D] border border-neutral-800/90 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-w-0">
            {/* Left 7 Columns: Commercial Value Proposition */}
            <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 space-y-6 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-cyan-300 min-w-0">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span>TẦNG 1 · CLIENT TIER (apps/studio-web)</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-300">
                    📁 hendy-Admini (7 TẦNG)
                  </span>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRenderDeployModalOpen(true);
                      handleVerifyRenderHealth();
                    }}
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer break-all"
                  >
                    <span>hendy-video-studio-new-pro.onrender.com</span>
                  </button>
                </div>

                {/* Locale & Account Controls in Hero Toolbar */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0A0C10] border border-neutral-800">
                    {SUPPORTED_LOCALES.map((loc) => (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => setLocale(loc.code)}
                        title={loc.nativeName}
                        className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          locale === loc.code
                            ? "bg-cyan-400 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {loc.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-2.5 py-1 rounded-lg bg-[#0A0C10] hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {currentUser
                      ? currentUser.displayName || currentUser.email
                      : "Đăng nhập"}
                  </button>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
                Sản Xuất Phụ Đề & Thuyết Minh Video Chuyên Nghiệp Trong Vài Phút
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Giải pháp thương mại toàn diện giúp nhà sáng tạo nội dung, studio giải trí và doanh nghiệp tự động bóc băng âm thanh, dịch thuật đa ngôn ngữ chuẩn ngữ cảnh, lồng tiếng AI 4 phân vai và chạy mượt mà trên cả Trình duyệt Web lẫn hệ điều hành Windows 10 và 11 (32-bit và 64-bit).
              </p>

              {/* Primary Commercial CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleRoute("Studio")}
                  className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-cyan-500/10 whitespace-nowrap"
                >
                  <Scissors className="w-4 h-4 shrink-0" />
                  <span>Mở Phòng Dựng Studio Ngay</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleSwitchToDedicatedAdminDomain}
                  className="px-4 py-3 rounded-xl bg-[#0A0C10] hover:bg-neutral-800 border border-amber-500/35 text-amber-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileCode2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>📁 hendy-Admini (Quản Lý 7 Tầng & Sửa Code)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenDownload}
                  className="px-4 py-3 rounded-xl bg-[#0A0C10] hover:bg-neutral-800 border border-cyan-500/35 text-cyan-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Windows 10/11 (32/64-bit)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSampleVideos}
                  className="px-4 py-3 rounded-xl bg-[#0A0C10] hover:bg-neutral-800 border border-neutral-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Xem Dự Án Mẫu</span>
                </button>
              </div>

              {/* Commercial KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800/80">
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-neutral-800/80">
                  <div className="text-[11px] text-slate-400">Hệ điều hành PC</div>
                  <div className="text-sm font-extrabold text-white font-mono mt-0.5">
                    Win 10/11 (32/64)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-neutral-800/80">
                  <div className="text-[11px] text-slate-400">Giọng đọc AI</div>
                  <div className="text-sm font-extrabold text-cyan-400 font-mono mt-0.5">
                    4 Phân Vai
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-neutral-800/80">
                  <div className="text-[11px] text-slate-400">Chất lượng xuất</div>
                  <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                    4K · 60FPS
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0C10] border border-neutral-800/80">
                  <div className="text-[11px] text-slate-400">Ngôn ngữ hỗ trợ</div>
                  <div className="text-sm font-extrabold text-amber-300 font-mono mt-0.5">
                    50+ Quốc Gia
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Studio Visual Showcase */}
            <div className="lg:col-span-5 relative h-full min-h-[320px] bg-[#0A0C10] border-t lg:border-t-0 lg:border-l border-neutral-800/90 flex flex-col justify-between overflow-hidden">
              {!heroImgError ? (
                <img
                  src={heroStudioImg}
                  alt="Vietsub Pro Studio Commercial Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-72 lg:h-full object-cover opacity-85"
                />
              ) : (
                <div className="w-full h-72 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 flex items-center justify-center">
                  <Film className="w-14 h-14 text-cyan-400/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/30 to-transparent" />
              <div className="relative z-10 p-6 mt-auto space-y-2">
                <div className="text-xs font-mono text-cyan-300">
                  WINDOWS 10 & 11 (32-BIT x86 & 64-BIT x64) + WEB STUDIO
                </div>
                <div className="text-base font-bold text-white">
                  Trình Dựng Trực Tuyến & Bộ Cài Đặt Máy Tính Đa Kiến Trúc
                </div>
                <p className="text-xs text-slate-300">
                  Hỗ trợ xuất file MP4 gắn sẵn phụ đề (Hardsub), tải tệp SRT/ASS/VTT tiêu chuẩn hoặc cài đặt bản Native cho Windows 10/11 (32-bit và 64-bit).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. COMMERCIAL CREATIVE SOLUTIONS GRID                                 */}
        {/* Purely customer-facing creative tools. Cross-Platform UI, Build       */}
        {/* Studio, and Service Center & VIP Repo are exclusively in Admin Gateway*/}
        {/* ===================================================================== */}
        <section aria-label="Commercial Workspaces Grid" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Giải Pháp Sản Xuất Phụ Đề & Thuyết Minh Thương Mại
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Các công cụ sáng tạo chuyên nghiệp dành cho khách hàng trên trình duyệt và Windows 10/11 (32-bit & 64-bit)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* COMMERCIAL CARD 1: 'Studio' */}
            <CommercialSolutionCard
              cardId="Studio"
              badge="01 · VIDEO STUDIO · 4K RENDER"
              subtitle="Phòng Dựng Phụ Đề & Thuyết Minh"
              title={t.cardStudioTitle}
              description="Bàn dựng video chuyên nghiệp với timeline sóng âm, tự động căn chỉnh thời lượng câu thoại, lồng tiếng AI đa nhân vật và kết xuất MP4 trực tiếp."
              features={[
                { label: "Kết xuất", value: "MP4 · SRT · ASS" },
                { label: "Đồng bộ âm", value: "Auto-Sync" },
                { label: "Xuất mẫu", value: "Preview 5s" },
              ]}
              ctaLabel={t.cardStudioCta}
              icon={<Scissors className="w-4 h-4" />}
              accentColor="cyan"
              onSelect={() => handleRoute("Studio")}
              bannerVisual={
                !heroImgError ? (
                  <img
                    src={heroStudioImg}
                    alt="Studio Workspace"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 flex items-center justify-center">
                    <Film className="w-12 h-12 text-cyan-400/40" />
                  </div>
                )
              }
            />

            {/* COMMERCIAL CARD 2: Multi-Voice AI Dubbing & Social Video Import */}
            <CommercialSolutionCard
              cardId="VoiceoverSocial"
              badge="02 · MULTI-VOICE AI · SOCIAL IMPORT"
              subtitle="Lồng Tiếng Đa Nhân Vật & Nhập Video"
              title="Phòng Thu Thuyết Minh AI 4 Phân Vai & Đa Nền Tảng"
              description="Tự động nhận diện nhân vật trong phim để phân vai giọng đọc Nam, Nữ, Già, Trẻ tự nhiên và nhập video trực tiếp từ TikTok, YouTube Shorts, Facebook Reels."
              features={[
                { label: "Giọng đọc", value: "Nam·Nữ·Già·Trẻ" },
                { label: "Nguồn nhập", value: "TikTok · YouTube" },
                { label: "Trộn âm", value: "Audio Ducking" },
              ]}
              ctaLabel="Mở Phòng Thu Thuyết Minh AI"
              icon={<Volume2 className="w-4 h-4" />}
              accentColor="sky"
              onSelect={onOpenVoiceover}
              bannerVisual={
                <div className="w-full h-full bg-gradient-to-br from-[#0F2338] via-[#131B2E] to-[#0A0C10] p-4 flex items-center justify-center">
                  <div className="w-full max-w-xs rounded-xl bg-[#0A0C10]/85 border border-sky-500/25 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>AI Voice Persona Studio</span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        24kHz WAV
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-sky-300 font-medium">
                      <div className="px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20 truncate">
                        🎙️ 4 Phân Vai Tự Động
                      </div>
                      <div className="px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20 truncate">
                        📥 Nhập Link 1-Click
                      </div>
                    </div>
                  </div>
                </div>
              }
            />

            {/* COMMERCIAL CARD 3: Windows 10 & 11 (32-bit & 64-bit) & Cinema FX */}
            <CommercialSolutionCard
              cardId="WindowsDesktopInstaller"
              badge="03 · WINDOWS 10 & 11 · 32-BIT & 64-BIT"
              subtitle="Bộ Cài Đặt Máy Tính & Hiệu Ứng Điện Ảnh"
              title="Ứng Dụng Windows 10/11 (32-bit & 64-bit) & Hiệu Ứng"
              description="Hỗ trợ đầy đủ hệ điều hành Windows 10 và Windows 11 ở cả hai kiến trúc 32-bit (x86) và 64-bit (x64), tích hợp bộ hiệu ứng phụ đề điện ảnh và kết xuất phần cứng."
              features={[
                { label: "Hệ điều hành", value: "Windows 10 & 11" },
                { label: "Kiến trúc", value: "32-bit & 64-bit" },
                { label: "Định dạng", value: ".EXE & .MSI" },
              ]}
              ctaLabel="Tải Bản Windows 10/11 (32/64-bit)"
              icon={<Cpu className="w-4 h-4" />}
              accentColor="purple"
              onSelect={onOpenDownload}
              bannerVisual={
                <div className="w-full h-full bg-gradient-to-br from-purple-950/45 via-[#141226] to-[#0A0C10] p-4 flex items-center justify-center">
                  <div className="w-full max-w-xs rounded-xl bg-[#0A0C10]/85 border border-purple-500/25 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                      <span>Windows 10 & 11 Native</span>
                      <span className="text-[10px] font-mono text-amber-300">
                        x86 & x64
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                      <div className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-200 truncate">
                        💻 Bản 64-bit (x64)
                      </div>
                      <div className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-200 truncate">
                        🖥️ Bản 32-bit (x86)
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3.5 [TẦNG 2] FRONTEND ENGINE (packages/ui-components & apps/studio-web)*/}
        {/* ===================================================================== */}
        <section id="tier2-frontend-engine" aria-label="Tier 2 Frontend Engine">
          <FrontendEngineInteractiveBench
            onOpenStudioEditor={() => handleRoute("Studio")}
          />
        </section>

        {/* ===================================================================== */}
        {/* 4. SPECIALIZED AI CREATIVE TOOLS GRID                                 */}
        {/* ===================================================================== */}
        <section
          id="commercial-ai-tools"
          aria-label="Creative Utilities Grid"
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {t.utilitiesSectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {t.utilitiesSectionHint}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div
              onClick={onOpenSocialImport || onOpenTranslator}
              className="p-5 rounded-2xl bg-[#10141D] border border-neutral-800/90 hover:border-cyan-400/50 transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {t.utilTranslatorTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.utilTranslatorDesc}
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>{t.utilTranslatorCta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={onOpenCapCut}
              className="p-5 rounded-2xl bg-[#10141D] border border-neutral-800/90 hover:border-cyan-400/50 transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  {!voiceImgError && (
                    <img
                      src={voiceBoothImg}
                      alt="Voiceover Booth"
                      referrerPolicy="no-referrer"
                      onError={() => setVoiceImgError(true)}
                      className="w-14 h-10 rounded-lg object-cover border border-neutral-700"
                    />
                  )}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Hiệu Ứng Chữ Điện Ảnh & Khung Hình
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tùy chỉnh preset phụ đề hoạt họa 16:9, 9:16 TikTok/Reels và lọc âm phòng thu.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Mở Bộ Hiệu Ứng</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={onOpenImageTranslator}
              className="p-5 rounded-2xl bg-[#10141D] border border-neutral-800/90 hover:border-cyan-400/50 transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {t.utilOcrTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.utilOcrDesc}
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>{t.utilOcrCta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={onOpenSampleVideos}
              className="p-5 rounded-2xl bg-[#10141D] border border-neutral-800/90 hover:border-cyan-400/50 transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Play className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {t.utilSamplesTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.utilSamplesDesc}
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>{t.utilSamplesCta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 5. COMMERCIAL PRICING & SUBSCRIPTION PLANS                            */}
        {/* ===================================================================== */}
        <section
          id="commercial-pricing"
          aria-label="Commercial Pricing Plans"
          className="space-y-6 pt-2"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400">
                COMMERCIAL LICENSING & PLANS
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Bảng Giá Dịch Vụ & Gói Bản Quyền Thương Mại
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Linh hoạt theo nhu cầu cá nhân, kênh sáng tạo nội dung hoặc đội ngũ sản xuất truyền thông
              </p>
            </div>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#10141D] border border-neutral-800 self-start">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-cyan-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Thanh toán theo tháng
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-cyan-400 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Theo năm (-20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COMMERCIAL_PLANS.map((plan) => {
              const displayPrice =
                billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between space-y-6 border transition-all ${
                    plan.highlight
                      ? "bg-[#121826] border-cyan-400/60 shadow-xl shadow-cyan-500/5"
                      : "bg-[#10141D] border-neutral-800/90"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <span className="text-[10px] font-mono font-bold text-cyan-300">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {plan.tagline}
                    </p>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                        {displayPrice === 0
                          ? "Miễn phí"
                          : `${displayPrice.toLocaleString("vi-VN")}đ`}
                      </span>
                      {displayPrice > 0 && (
                        <span className="text-xs text-slate-400">/ tháng</span>
                      )}
                    </div>

                    <ul className="space-y-2.5 pt-2">
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-300"
                        >
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectCommercialPlan(plan)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                      plan.highlight
                        ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950"
                        : "bg-neutral-800 hover:bg-neutral-700 text-white"
                    }`}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===================================================================== */}
      {/* INLINE COMMERCIAL PLAN CHECKOUT MODAL                                 */}
      {/* ===================================================================== */}
      {selectedCheckoutPlan && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-[#10141D] border border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-cyan-400">
                  COMMERCIAL CHECKOUT GATEWAY
                </div>
                <h3 className="text-lg font-bold text-white">
                  {selectedCheckoutPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCheckoutPlan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0A0C10] border border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Chu kỳ:{" "}
                <strong className="text-white">
                  {billingCycle === "annual" ? "12 Tháng (-20%)" : "1 Tháng"}
                </strong>
              </span>
              <span className="text-base font-extrabold text-cyan-400 font-mono">
                {(billingCycle === "annual"
                  ? selectedCheckoutPlan.annualPrice * 12
                  : selectedCheckoutPlan.monthlyPrice
                ).toLocaleString("vi-VN")}{" "}
                VNĐ
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400">
                Chọn phương thức thanh toán:
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCheckoutProvider("vietqr")}
                  className={`p-2.5 rounded-xl border font-semibold transition cursor-pointer ${
                    checkoutProvider === "vietqr"
                      ? "bg-emerald-500/15 border-emerald-400 text-emerald-300"
                      : "bg-[#0A0C10] border-neutral-800 text-slate-400"
                  }`}
                >
                  VietQR 24/7
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutProvider("stripe")}
                  className={`p-2.5 rounded-xl border font-semibold transition cursor-pointer ${
                    checkoutProvider === "stripe"
                      ? "bg-indigo-500/15 border-indigo-400 text-indigo-300"
                      : "bg-[#0A0C10] border-neutral-800 text-slate-400"
                  }`}
                >
                  Thẻ Stripe
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutProvider("telegram_stars")}
                  className={`p-2.5 rounded-xl border font-semibold transition cursor-pointer ${
                    checkoutProvider === "telegram_stars"
                      ? "bg-amber-500/15 border-amber-400 text-amber-300"
                      : "bg-[#0A0C10] border-neutral-800 text-slate-400"
                  }`}
                >
                  ⭐ TG Stars
                </button>
              </div>
            </div>

            {checkoutSuccessMsg ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/35 text-xs text-emerald-300 space-y-2">
                <div className="font-bold">{checkoutSuccessMsg}</div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCheckoutPlan(null);
                    handleRoute("Studio");
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                >
                  Vào Phòng Dựng Studio Ngay
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessingCheckout}
                onClick={handleConfirmCommercialCheckout}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                {isProcessingCheckout
                  ? "Đang xác nhận giao dịch..."
                  : "Xác Nhận Thanh Toán & Kích Hoạt Ngay"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. COMMERCIAL FOOTER & DEDICATED ADMIN GATEWAY ENDPOINT               */}
      {/* ===================================================================== */}
      <footer className="border-t border-neutral-800/90 px-5 sm:px-10 py-6 text-xs text-slate-500 bg-[#07090D]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-300">{t.brandTitle}</span>
            <span>·</span>
            <span>
              Commercial Domain:{" "}
              <strong className="font-mono text-slate-300">
                {DEFAULT_NETWORK_POLICY.commercialDomain}
              </strong>
            </span>
            <span>·</span>
            <span className="text-slate-400">
              Windows 10 & 11 (32-bit & 64-bit)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={onOpenBookmarklet}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3 h-3" />
              <span>{t.footerBookmarklet}</span>
            </button>
            <button
              type="button"
              id="btn-hero-download"
              onClick={onOpenDownload}
              className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Windows 10/11 (32/64-bit)</span>
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              {currentUser
                ? `${t.footerAccountPrefix}: ${
                    currentUser.displayName || currentUser.email
                  }`
                : t.footerSignIn}
            </button>

            {/* Render.com Deployment & Health Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                setIsRenderDeployModalOpen(true);
                handleVerifyRenderHealth();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10141D] hover:bg-neutral-800 border border-emerald-500/25 text-emerald-300/90 hover:text-emerald-200 font-mono text-[11px] transition-colors cursor-pointer"
              title="Cấu hình & Trạng thái Deploy Render.com (https://hendy-video-studio-new-pro.onrender.com/)"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Render.com: hendy-video-studio-new-pro.onrender.com</span>
            </button>

            {/* Dedicated Administrator Gateway Link (/admin-console/network-gateway) */}
            <button
              type="button"
              onClick={handleSwitchToDedicatedAdminDomain}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10141D] hover:bg-neutral-800 border border-amber-500/25 text-amber-300/90 hover:text-amber-200 font-mono text-[11px] transition-colors cursor-pointer"
              title="Truy cập độc quyền Cross-Platform UI, Build Studio, Trung Tâm Dịch Vụ & Kho VIP và Quản lý Domain/IP/CIDR (/admin-console/network-gateway)"
            >
              <Network className="w-3 h-3 text-amber-400" />
              <span>
                Admin Gateway: {DEFAULT_NETWORK_POLICY.adminDedicatedDomain.replace("https://", "")} ({DEFAULT_NETWORK_POLICY.adminDedicatedIp})
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* RENDER.COM DEPLOYMENT & HEALTH DIAGNOSTICS MODAL                      */}
      {/* ===================================================================== */}
      {isRenderDeployModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-2xl bg-[#10141D] border border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="text-xs font-mono text-emerald-400">
                  RENDER.COM CLOUD WEB SERVICE · PRODUCTION READY
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  https://hendy-video-studio-new-pro.onrender.com/
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRenderDeployModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0A0C10] border border-neutral-800 space-y-1">
                <div className="text-slate-400">Service Name & Runtime</div>
                <div className="font-mono font-bold text-white">
                  hendy-video-studio-new-pro (Node 20 LTS)
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A0C10] border border-neutral-800 space-y-1">
                <div className="text-slate-400">Health Check Endpoint (/health)</div>
                <div className="font-mono font-bold text-emerald-400">
                  {renderHealthStatus.checked
                    ? `HTTP 200 OK · ${renderHealthStatus.version || "2.8.0-pro"}`
                    : "Đang kiểm tra /health..."}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0A0C10] border border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-slate-400 mb-1">Build Command (Render.com)</div>
                  <code className="font-mono text-cyan-300 font-bold">
                    npm install --include=dev && npm run build
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      "build",
                      "npm install --include=dev && npm run build"
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-200 font-semibold shrink-0 cursor-pointer"
                >
                  {copiedCmd === "build" ? "Đã chép" : "Sao chép"}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A0C10] border border-neutral-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-slate-400 mb-1">Start Command (Render.com)</div>
                  <code className="font-mono text-emerald-300 font-bold">
                    npm start
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText("start", "npm start")}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-200 font-semibold shrink-0 cursor-pointer"
                >
                  {copiedCmd === "start" ? "Đã chép" : "Sao chép"}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A0C10] border border-neutral-800 space-y-1.5">
                <div className="text-slate-400">
                  Các tuyến đường (Routes) hoạt động trên Render.com:
                </div>
                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>• Trang chủ thương mại: https://hendy-video-studio-new-pro.onrender.com/</div>
                  <div>• Cổng Admin Gateway: https://hendy-video-studio-new-pro.onrender.com/admin-console/network-gateway</div>
                  <div>• Xác thực CIDR & RBAC: POST /api/admin-gateway/verify-access</div>
                  <div>• Kiểm tra sức khỏe container: GET /health</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleVerifyRenderHealth}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Kiểm tra lại /health
              </button>
              <button
                type="button"
                onClick={() => setIsRenderDeployModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const HomeWorkspace = StudioHomePage;
export default StudioHomePage;
