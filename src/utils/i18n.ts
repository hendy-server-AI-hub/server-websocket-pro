import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLocale = "vi" | "en" | "ja" | "ko" | "zh";

export interface LocaleMetadata {
  code: SupportedLocale;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleMetadata[] = [
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ja", label: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "zh", label: "Chinese", nativeName: "简体中文", flag: "🇨🇳" },
];

export interface TranslationDictionary {
  brandTitle: string;
  brandSubtitle: string;
  navStudio: string;
  navAssistant: string;
  navAdmin: string;
  navDashboard: string;
  launchStudioCta: string;
  routerBadge: string;
  routerSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  metricWorkspacesLabel: string;
  metricWorkspacesValue: string;
  metricRenderLabel: string;
  metricRenderValue: string;
  metricPreviewLabel: string;
  metricPreviewValue: string;
  workspacesSectionTitle: string;
  workspacesSectionHint: string;
  cardStudioTitle: string;
  cardStudioDesc: string;
  cardStudioCta: string;
  cardTelegramTitle: string;
  cardTelegramDesc: string;
  cardTelegramCta: string;
  cardAdminTitle: string;
  cardAdminDesc: string;
  cardAdminCta: string;
  utilitiesSectionTitle: string;
  utilitiesSectionHint: string;
  utilTranslatorTitle: string;
  utilTranslatorDesc: string;
  utilTranslatorCta: string;
  utilVoiceoverTitle: string;
  utilVoiceoverDesc: string;
  utilVoiceoverCta: string;
  utilOcrTitle: string;
  utilOcrDesc: string;
  utilOcrCta: string;
  utilSamplesTitle: string;
  utilSamplesDesc: string;
  utilSamplesCta: string;
  footerTagline: string;
  footerBookmarklet: string;
  footerDownloadApp: string;
  footerSignIn: string;
  footerAccountPrefix: string;
  rbacGuardrailProtected: string;
  rbacAdminVerified: string;
  rbacStandardUser: string;
}

export const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  vi: {
    brandTitle: "Hendy Studio",
    brandSubtitle: "Bảng Điều Khiển Không Gian Làm Việc (PWA)",
    navStudio: "Studio",
    navAssistant: "Trợ lý TMA & Bot",
    navAdmin: "Quản trị hệ thống",
    navDashboard: "Bảng điều khiển",
    launchStudioCta: "Mở Studio Ngay",
    routerBadge: "WORKSPACE ROUTER · RBAC GUARDRAIL",
    routerSubtitle: "Điều hướng không gian làm việc độc lập · Đa ngôn ngữ i18n",
    heroTitle: "Trung Tâm Điều Phối Không Gian Làm Việc",
    heroDescription:
      "Chọn thẻ không gian làm việc bên dưới để mở trình biên tập phụ đề FFmpeg.wasm ngay trên trình duyệt, tương tác với Telegram Mini App (TMA) hoặc truy cập trung tâm điều hành hệ thống.",
    metricWorkspacesLabel: "Không gian",
    metricWorkspacesValue: "03 Khu vực",
    metricRenderLabel: " kết xuất trình duyệt",
    metricRenderValue: "FFmpeg.wasm",
    metricPreviewLabel: "Chế độ xuất mẫu",
    metricPreviewValue: "Preview 5s",
    workspacesSectionTitle: "Danh Mục Không Gian Làm Việc",
    workspacesSectionHint: "Chọn thẻ để chuyển sang không gian tương ứng",
    cardStudioTitle: "Studio Biên Tập & FFmpeg.wasm Render",
    cardStudioDesc:
      "Không gian dựng video PWA tích hợp FFmpeg.wasm (Local Browser Render), thuật toán Auto-Sync căn chỉnh phụ đề theo sóng âm, xuất mẫu thử 5 giây và lồng tiếng AI đa nhân vật.",
    cardStudioCta: "Mở Không Gian Studio",
    cardTelegramTitle: "Telegram Mini App (TMA) & Bot Tự Động",
    cardTelegramDesc:
      "Không gian tương tác trực tiếp với Telegram WebApp SDK, xác thực chữ ký HMAC-SHA256, hướng dẫn Onboarding, cổng thanh toán Stripe/Telegram Stars và quản lý 13 kho liên minh.",
    cardTelegramCta: "Mở Không Gian TMA & Bot",
    cardAdminTitle: "Trung Tâm Quản Trị & Điều Phối (RBAC)",
    cardAdminDesc:
      "Không gian điều hành bảo vệ bởi RBAC Guardrail dành riêng cho quản trị viên: giám sát Cloudflare Edge HMAC-SHA256, bộ nhớ đệm KV, Ktor 3.6 và cơ sở dữ liệu hệ thống.",
    cardAdminCta: "Mở Không Gian Quản Trị",
    utilitiesSectionTitle: "Tiện Ích Sáng Tạo & Đa Nền Tảng",
    utilitiesSectionHint: "Khởi chạy trực tiếp các mô-đun biên tập chuyên dụng",
    utilTranslatorTitle: "Dịch Liên Kết Đa Nền Tảng",
    utilTranslatorDesc:
      "Nhập liên kết TikTok, YouTube, Reels để tự động trích xuất phụ đề và dịch sang 10 ngôn ngữ.",
    utilTranslatorCta: "Mở trình dịch liên kết",
    utilVoiceoverTitle: "Phòng Thu Lồng Tiếng AI",
    utilVoiceoverDesc:
      "Gán giọng đọc riêng cho từng nhân vật (Nam, Nữ, Già, Trẻ) kèm tự động giảm âm nhạc nền.",
    utilVoiceoverCta: "Mở phòng thu AI",
    utilOcrTitle: "Quét & Dịch Chữ Ảnh OCR",
    utilOcrDesc:
      "Nhận diện chữ nằm cứng trên khung hình video hoặc poster phim và chuyển thẳng thành câu phụ đề.",
    utilOcrCta: "Quét chữ trên ảnh",
    utilSamplesTitle: "Kho Video Mẫu & Ứng Dụng Native",
    utilSamplesDesc:
      "Khởi tạo nhanh dự án với các video mẫu có sẵn để trải nghiệm ngay FFmpeg.wasm, Auto-Sync và Preview 5s.",
    utilSamplesCta: "Chọn video mẫu",
    footerTagline: "Kiến Trúc Đa Tầng PWA · FFmpeg.wasm · Edge HMAC-SHA256",
    footerBookmarklet: "Tiện ích trình duyệt",
    footerDownloadApp: "Tải App Native (Android/iOS/.msi)",
    footerSignIn: "Đăng nhập RBAC",
    footerAccountPrefix: "Tài khoản",
    rbacGuardrailProtected: "RBAC Guardrail: Bảo vệ",
    rbacAdminVerified: "Quản trị viên (ID: 6138197737)",
    rbacStandardUser: "Thành viên tiêu chuẩn",
  },
  en: {
    brandTitle: "Hendy Studio",
    brandSubtitle: "Multi-Workspace Control Center (PWA)",
    navStudio: "Studio",
    navAssistant: "TMA & Bot Hub",
    navAdmin: "System Admin",
    navDashboard: "Dashboard",
    launchStudioCta: "Launch Studio",
    routerBadge: "WORKSPACE ROUTER · RBAC GUARDRAIL",
    routerSubtitle: "Isolated Workspace Routing · Multi-Language i18n",
    heroTitle: "Master Workspace Orchestration Hub",
    heroDescription:
      "Select a workspace card below to launch the browser-native FFmpeg.wasm subtitle studio, interact with the Telegram Mini App (TMA) & Bot, or access the RBAC-protected administration center.",
    metricWorkspacesLabel: "Workspaces",
    metricWorkspacesValue: "03 Zones",
    metricRenderLabel: "Browser Render",
    metricRenderValue: "FFmpeg.wasm",
    metricPreviewLabel: "Sample Export",
    metricPreviewValue: "Preview 5s",
    workspacesSectionTitle: "Isolated Workspace Directory",
    workspacesSectionHint: "Click any card to switch to its isolated route",
    cardStudioTitle: "AI Subtitle Studio & FFmpeg.wasm Render",
    cardStudioDesc:
      "PWA video production suite with local browser FFmpeg.wasm rendering, waveform Auto-Sync alignment, 5-second instant preview export, and multi-persona AI voiceover dubbing.",
    cardStudioCta: "Open Studio Workspace",
    cardTelegramTitle: "Telegram Mini App (TMA) & Bot Hub",
    cardTelegramDesc:
      "Integrated Telegram WebApp SDK with HMAC-SHA256 cryptographic auth, interactive onboarding, Stripe & Telegram Stars payments, and 13-brand account inventory.",
    cardTelegramCta: "Open TMA & Bot Workspace",
    cardAdminTitle: "System Administration & RBAC Control",
    cardAdminDesc:
      "Restricted administration workspace protected by RBAC Guardrail: monitor Cloudflare Edge HMAC-SHA256 security, transient AI KV caching, Ktor 3.6, and PostgreSQL.",
    cardAdminCta: "Open Admin Workspace",
    utilitiesSectionTitle: "Creative Utilities & Native Clients",
    utilitiesSectionHint: "Launch specialized production tools directly",
    utilTranslatorTitle: "Universal Link Translator",
    utilTranslatorDesc:
      "Import TikTok, YouTube, or Reels links to extract and translate subtitles into 10 languages.",
    utilTranslatorCta: "Open Link Translator",
    utilVoiceoverTitle: "Multi-Voice AI Dubbing Booth",
    utilVoiceoverDesc:
      "Assign distinct voice personas (Male, Female, Elder, Youth) with automatic -14 LUFS BGM ducking.",
    utilVoiceoverCta: "Open Voice Booth",
    utilOcrTitle: "Video Frame & Poster OCR",
    utilOcrDesc:
      "Detect hardcoded text on video frames or movie posters and convert directly into timed cues.",
    utilOcrCta: "Scan Image Text",
    utilSamplesTitle: "Sample Videos & Native Clients",
    utilSamplesDesc:
      "Start immediately with curated sample videos to test FFmpeg.wasm, Auto-Sync, and 5s Preview.",
    utilSamplesCta: "Browse Sample Videos",
    footerTagline: "Master PWA Architecture · FFmpeg.wasm · Edge HMAC-SHA256",
    footerBookmarklet: "Browser Bookmarklet",
    footerDownloadApp: "Native Clients (Android/iOS/.msi)",
    footerSignIn: "RBAC Sign In",
    footerAccountPrefix: "Account",
    rbacGuardrailProtected: "RBAC Guardrail: Active",
    rbacAdminVerified: "Authorized Admin (6138197737)",
    rbacStandardUser: "Standard Member",
  },
  ja: {
    brandTitle: "Hendy Studio",
    brandSubtitle: "マルチワークスペース管理ボード (PWA)",
    navStudio: "スタジオ",
    navAssistant: "TMA & Bot",
    navAdmin: "システム管理",
    navDashboard: "ダッシュボード",
    launchStudioCta: "スタジオを開く",
    routerBadge: "WORKSPACE ROUTER · RBAC GUARDRAIL",
    routerSubtitle: "独立ワークスペースルーティング · 多言語 i18n",
    heroTitle: "ワークスペース統合コントロールセンター",
    heroDescription:
      "下のカードを選択して、ブラウザ内 FFmpeg.wasm 字幕スタジオ、Telegram Mini App (TMA)、または管理者専用コンソールを起動します。",
    metricWorkspacesLabel: "ワークスペース",
    metricWorkspacesValue: "03 ゾーン",
    metricRenderLabel: "ローカルレンダー",
    metricRenderValue: "FFmpeg.wasm",
    metricPreviewLabel: "サンプル出力",
    metricPreviewValue: "5秒プレビュー",
    workspacesSectionTitle: "ワークスペース一覧",
    workspacesSectionHint: "カードを選択してワークスペースを切り替え",
    cardStudioTitle: "AI字幕スタジオ & FFmpeg.wasm",
    cardStudioDesc:
      "FFmpeg.wasm ローカルブラウザレンダリング、音声波形 Auto-Sync、5秒プレビュー出力、マルチボイスAI吹き替えを搭載。",
    cardStudioCta: "スタジオを開く",
    cardTelegramTitle: "Telegram Mini App (TMA) & Bot",
    cardTelegramDesc:
      "WebApp SDK、HMAC-SHA256 署名検証、オンボーディング、Stripe/Telegram決済、13ブランドのアカウント在庫管理。",
    cardTelegramCta: "TMA & Bot を開く",
    cardAdminTitle: "システム管理 & RBAC コンソール",
    cardAdminDesc:
      "RBAC ガードレールで保護された管理者専用ビュー：Cloudflare Edge HMAC検証、KVキャッシュ、インフラ監視。",
    cardAdminCta: "管理画面を開く",
    utilitiesSectionTitle: "クリエイティブツール & ネイティブアプリ",
    utilitiesSectionHint: "専用モジュールを直接起動",
    utilTranslatorTitle: "マルチリンク自動翻訳",
    utilTranslatorDesc: "TikTok、YouTube、Reels のリンクから字幕を抽出し10言語へ翻訳。",
    utilTranslatorCta: "リンク翻訳を開く",
    utilVoiceoverTitle: "AI マルチボイス録音室",
    utilVoiceoverDesc: "登場人物ごとに最適な声を割り当て、BGM音量を自動調整。",
    utilVoiceoverCta: "録音室を開く",
    utilOcrTitle: "画像・映像フレーム OCR",
    utilOcrDesc: "映像内の焼き込み文字やポスターのテキストを認識して字幕に変換。",
    utilOcrCta: "OCRスキャンを開く",
    utilSamplesTitle: "サンプル動画ライブラリ",
    utilSamplesDesc: "サンプル動画を使って FFmpeg.wasm と 5秒プレビューを今すぐ体験。",
    utilSamplesCta: "サンプルを選択",
    footerTagline: "PWA アーキテクチャ · FFmpeg.wasm · Edge HMAC-SHA256",
    footerBookmarklet: "ブックマークレット",
    footerDownloadApp: "ネイティブ版 (Android/iOS/.msi)",
    footerSignIn: "RBAC ログイン",
    footerAccountPrefix: "アカウント",
    rbacGuardrailProtected: "RBAC 保護有効",
    rbacAdminVerified: "管理者 (6138197737)",
    rbacStandardUser: "一般メンバー",
  },
  ko: {
    brandTitle: "Hendy Studio",
    brandSubtitle: "멀티 워크스페이스 대시보드 (PWA)",
    navStudio: "스튜디오",
    navAssistant: "TMA & 봇",
    navAdmin: "시스템 관리",
    navDashboard: "대시보드",
    launchStudioCta: "스튜디오 열기",
    routerBadge: "WORKSPACE ROUTER · RBAC GUARDRAIL",
    routerSubtitle: "독립 워크스페이스 라우팅 · 다국어 i18n",
    heroTitle: "워크스페이스 통합 제어 센터",
    heroDescription:
      "아래 카드를 선택하여 FFmpeg.wasm 브라우저 렌더링 스튜디오, Telegram Mini App (TMA) 또는 RBAC 관리자 센터로 이동하세요.",
    metricWorkspacesLabel: "워크스페이스",
    metricWorkspacesValue: "03 구역",
    metricRenderLabel: "브라우저 렌더",
    metricRenderValue: "FFmpeg.wasm",
    metricPreviewLabel: "샘플 내보내기",
    metricPreviewValue: "5초 프리뷰",
    workspacesSectionTitle: "워크스페이스 디렉토리",
    workspacesSectionHint: "카드를 클릭하여 워크스페이스 전환",
    cardStudioTitle: "AI 자막 스튜디오 & FFmpeg.wasm",
    cardStudioDesc:
      "FFmpeg.wasm 로컬 브라우저 렌더링, 파형 기반 Auto-Sync, 5초 미리보기 렌더링 및 다중 캐릭터 AI 더빙 지원.",
    cardStudioCta: "스튜디오 열기",
    cardTelegramTitle: "Telegram Mini App (TMA) & 봇",
    cardTelegramDesc:
      "WebApp SDK, HMAC-SHA256 인증, 온보딩, Stripe/Telegram 결제 및 13개 브랜드 계정 보관함 관리.",
    cardTelegramCta: "TMA & 봇 열기",
    cardAdminTitle: "시스템 관리 & RBAC 센터",
    cardAdminDesc:
      "RBAC 가드레일로 보호되는 관리자 전용 뷰: Cloudflare Edge HMAC 보안, KV 캐시 및 인프라 제어.",
    cardAdminCta: "관리자 공간 열기",
    utilitiesSectionTitle: "크리에이티브 도구 & 네이티브 클라이언트",
    utilitiesSectionHint: "전용 편집 모듈 즉시 실행",
    utilTranslatorTitle: "멀티 플랫폼 링크 번역",
    utilTranslatorDesc: "TikTok, YouTube, Reels 링크에서 자막을 추출하여 10개 국어로 번역.",
    utilTranslatorCta: "링크 번역기 열기",
    utilVoiceoverTitle: "AI 멀티보이스 더빙 부스",
    utilVoiceoverDesc: "캐릭터별 맞춤 음성을 지정하고 배경음악 볼륨을 자동으로 조절.",
    utilVoiceoverCta: "더빙 부스 열기",
    utilOcrTitle: "이미지 & 비디오 프레임 OCR",
    utilOcrDesc: "비디오 프레임이나 포스터의 텍스트를 인식하여 자막으로 변환.",
    utilOcrCta: "OCR 스캔 열기",
    utilSamplesTitle: "샘플 비디오 라이브러리",
    utilSamplesDesc: "제공된 샘플 비디오로 FFmpeg.wasm과 5초 프리뷰를 즉시 테스트.",
    utilSamplesCta: "샘플 비디오 선택",
    footerTagline: "마스터 PWA 아키텍처 · FFmpeg.wasm · Edge HMAC-SHA256",
    footerBookmarklet: "브라우저 북마클릿",
    footerDownloadApp: "네이티브 앱 (Android/iOS/.msi)",
    footerSignIn: "RBAC 로그인",
    footerAccountPrefix: "계정",
    rbacGuardrailProtected: "RBAC 보호 활성",
    rbacAdminVerified: "관리자 인증 (6138197737)",
    rbacStandardUser: "일반 회원",
  },
  zh: {
    brandTitle: "Hendy Studio",
    brandSubtitle: "多工作区控制台 (PWA)",
    navStudio: "工作室",
    navAssistant: "TMA 与机器人",
    navAdmin: "系统管理",
    navDashboard: "仪表盘",
    launchStudioCta: "打开工作室",
    routerBadge: "WORKSPACE ROUTER · RBAC GUARDRAIL",
    routerSubtitle: "独立工作区路由 · 多语言 i18n",
    heroTitle: "工作区总控调度中心",
    heroDescription:
      "选择下方工作区卡片以启动浏览器本地 FFmpeg.wasm 字幕渲染工作室、Telegram 小程序 (TMA) 或受 RBAC 保护的系统管理中心。",
    metricWorkspacesLabel: "工作区",
    metricWorkspacesValue: "03 区域",
    metricRenderLabel: "浏览器渲染",
    metricRenderValue: "FFmpeg.wasm",
    metricPreviewLabel: "样片导出",
    metricPreviewValue: "5秒预览",
    workspacesSectionTitle: "工作区目录",
    workspacesSectionHint: "点击卡片切换到对应独立工作区",
    cardStudioTitle: "AI 字幕工作室 & FFmpeg.wasm 渲染",
    cardStudioDesc:
      "集成 FFmpeg.wasm 本地浏览器渲染、声波 Auto-Sync 自动对齐、5秒快速预览导出及多角色 AI 配音。",
    cardStudioCta: "进入工作室",
    cardTelegramTitle: "Telegram Mini App (TMA) 与机器人",
    cardTelegramDesc:
      "集成 Telegram WebApp SDK、HMAC-SHA256 签名验证、新用户引导、Stripe/Telegram 支付与13品牌库存管理。",
    cardTelegramCta: "进入 TMA 工作区",
    cardAdminTitle: "系统管理与 RBAC 控制中心",
    cardAdminDesc:
      "受 RBAC Guardrail 保护的管理员专属空间：监控 Cloudflare Edge HMAC-SHA256 安全验证、KV 缓存与后端集群。",
    cardAdminCta: "进入管理中心",
    utilitiesSectionTitle: "创意工具与原生客户端",
    utilitiesSectionHint: "直接启动专业编辑模块",
    utilTranslatorTitle: "全平台链接翻译",
    utilTranslatorDesc: "输入 TikTok、YouTube、Reels 链接自动提取字幕并翻译为10种语言。",
    utilTranslatorCta: "打开链接翻译",
    utilVoiceoverTitle: "AI 多角色配音室",
    utilVoiceoverDesc: "为不同角色分配专属声线，支持背景音乐自动闪避 (-14 LUFS)。",
    utilVoiceoverCta: "打开配音室",
    utilOcrTitle: "画面与海报 OCR 识别",
    utilOcrDesc: "识别视频画面硬字幕或海报文字并直接转化为时间轴字幕。",
    utilOcrCta: "扫描画面文字",
    utilSamplesTitle: "示例视频库",
    utilSamplesDesc: "使用内置高质量样片立即体验 FFmpeg.wasm、Auto-Sync 和 5秒预览。",
    utilSamplesCta: "选择示例视频",
    footerTagline: "全栈 PWA 架构 · FFmpeg.wasm · Edge HMAC-SHA256",
    footerBookmarklet: "浏览器书签工具",
    footerDownloadApp: "下载原生应用 (Android/iOS/.msi)",
    footerSignIn: "RBAC 登录",
    footerAccountPrefix: "账户",
    rbacGuardrailProtected: "RBAC 护栏已启用",
    rbacAdminVerified: "授权管理员 (6138197737)",
    rbacStandardUser: "标准成员",
  },
};

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "vi",
  setLocale: () => {},
  t: TRANSLATIONS.vi,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    try {
      const saved = localStorage.getItem("hendy_studio_locale") as SupportedLocale;
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch {}
    return "vi";
  });

  const setLocale = (next: SupportedLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem("hendy_studio_locale", next);
      document.documentElement.lang = next;
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {}
  }, [locale]);

  return React.createElement(
    I18nContext.Provider,
    {
      value: {
        locale,
        setLocale,
        t: TRANSLATIONS[locale] || TRANSLATIONS.vi,
      },
    },
    children
  );
};

export const useI18n = (): I18nContextValue => useContext(I18nContext);
