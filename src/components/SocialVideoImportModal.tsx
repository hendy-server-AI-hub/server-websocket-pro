import React, { useState } from "react";
import {
  X,
  Link,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Video,
  Flame,
  Users,
  Zap,
  Globe,
  Share2,
  ArrowRight,
  Tv,
} from "lucide-react";
import { SubtitleCue } from "../types";

export interface SocialImportResult {
  videoUrl: string;
  title: string;
  initialCues?: SubtitleCue[];
  autoStartTranslate?: boolean;
  platform?: string;
}

interface SocialVideoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (result: SocialImportResult) => void;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

export const SocialVideoImportModal: React.FC<SocialVideoImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onNotify,
}) => {
  const [platformTab, setPlatformTab] = useState<"tiktok" | "facebook" | "youtube" | "capcut">("tiktok");
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings
  const [autoVietsubOnImport, setAutoVietsubOnImport] = useState(true);
  const [autoVoiceoverOnImport, setAutoVoiceoverOnImport] = useState(true);

  // Pre-configured Viral Samples for immediate 1-click test
  const VIRAL_SAMPLES = [
    {
      id: "tiktok-drama-1",
      platform: "tiktok",
      title: "TikTok Short Drama: Tổng Tài Bá Đạo (Douyin)",
      url: "https://shortdrama.tiktok.com/t/ZSb1YsoJV/",
      author: "@douyin_dramashort",
      duration: "00:45",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
      cues: [
        {
          id: 1,
          start: 0.5,
          end: 4.2,
          startTime: "00:00:00.500",
          endTime: "00:00:04.200",
          textOriginal: "你真的以为能一辈子瞒着我吗？",
          textVi: "Em thật sự nghĩ rằng có thể che giấu bí mật này với tôi cả đời sao?",
          speakerGender: "male" as const,
          speakerRole: "Tổng tài (Nam chính)",
          voicePersona: "male_young" as const,
        },
        {
          id: 2,
          start: 4.8,
          end: 9.5,
          startTime: "00:00:04.800",
          endTime: "00:00:09.500",
          textOriginal: "我所做的一切，都是为了守护这个家！",
          textVi: "Tất cả những gì tôi làm, đều chỉ để bảo vệ gia đình này!",
          speakerGender: "female" as const,
          speakerRole: "Nữ chính (Nữ trẻ)",
          voicePersona: "female_young" as const,
        },
      ],
    },
    {
      id: "facebook-reel-1",
      platform: "facebook",
      title: "Facebook Reel: Phóng Sự Ẩm Thực Đường Phố Sài Gòn",
      url: "https://www.facebook.com/reel/1049281729182",
      author: "Sài Gòn Phố Food",
      duration: "00:38",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      cues: [
        {
          id: 1,
          start: 0.8,
          end: 4.5,
          startTime: "00:00:00.800",
          endTime: "00:00:04.500",
          textOriginal: "Welcome to Saigon street food adventure today!",
          textVi: "Chào mừng mọi người đến với hành trình khám phá ẩm thực đường phố Sài Gòn hôm nay!",
          speakerGender: "female" as const,
          speakerRole: "Food Reviewer",
          voicePersona: "female_young" as const,
        },
        {
          id: 2,
          start: 5.0,
          end: 8.8,
          startTime: "00:00:05.000",
          endTime: "00:00:08.800",
          textOriginal: "This grilled pork noodle bowl looks incredible.",
          textVi: "Tô bún thịt nướng này nhìn thực sự rất hấp dẫn và đầy ắp thịt.",
          speakerGender: "female" as const,
          speakerRole: "Food Reviewer",
          voicePersona: "female_young" as const,
        },
      ],
    },
    {
      id: "youtube-shorts-1",
      platform: "youtube",
      title: "YouTube Shorts: Đột Phá Trí Tuệ Nhân Tạo 2026",
      url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      author: "@TechFutureAI",
      duration: "00:42",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      cues: [
        {
          id: 1,
          start: 0.5,
          end: 3.8,
          startTime: "00:00:00.500",
          endTime: "00:00:03.800",
          textOriginal: "AI models in 2026 can now process multimodal live video seamlessly.",
          textVi: "Các mô hình AI năm 2026 hiện có thể xử lý video trực tiếp đa phương thức cực kỳ mượt mà.",
          speakerGender: "male" as const,
          speakerRole: "Tech Speaker",
          voicePersona: "male_adult" as const,
        },
      ],
    },
    {
      id: "capcut-trend-1",
      platform: "capcut",
      title: "CapCut Trend: Mẫu Chữ Karaoke TikTok Động",
      url: "https://www.capcut.com/template-detail/7182910283",
      author: "@CapCutCreatorPro",
      duration: "00:30",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      cues: [
        {
          id: 1,
          start: 1.0,
          end: 5.5,
          startTime: "00:00:01.000",
          endTime: "00:00:05.500",
          textOriginal: "Nắng vàng trên góc phố quen, nụ cười em dịu êm.",
          textVi: "Nắng vàng trên góc phố quen, nụ cười em dịu êm.",
          speakerGender: "female" as const,
          speakerRole: "Ca sĩ AI",
          voicePersona: "female_young" as const,
        },
      ],
    },
  ];

  if (!isOpen) return null;

  // Auto detect platform when user pastes URL
  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    const low = val.toLowerCase();
    if (low.includes("tiktok.com") || low.includes("douyin.com")) {
      setPlatformTab("tiktok");
    } else if (low.includes("facebook.com") || low.includes("fb.watch") || low.includes("fb.com")) {
      setPlatformTab("facebook");
    } else if (low.includes("youtube.com") || low.includes("youtu.be")) {
      setPlatformTab("youtube");
    } else if (low.includes("capcut.com") || low.includes("instagram.com")) {
      setPlatformTab("capcut");
    }
  };

  const handleImportSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage("Vui lòng dán liên kết video TikTok, Facebook hoặc YouTube vào ô trống.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/video/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Không thể phân giải video từ liên kết này.");
      }

      onNotify?.(`Đã nhập thành công video từ ${platformTab.toUpperCase()}!`, "success");
      onImportSuccess?.({
        videoUrl: data.videoUrl,
        title: data.title || `Video ${platformTab.toUpperCase()}`,
        initialCues: data.initialCues || [],
        autoStartTranslate: autoVietsubOnImport,
        platform: platformTab,
      });

      onClose();
    } catch (err: any) {
      console.warn("[Social Import] Error:", err);
      setErrorMessage(err.message || "Lỗi khi nhập liên kết. Vui lòng thử lại hoặc chọn video mẫu có sẵn.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof VIRAL_SAMPLES[0]) => {
    onNotify?.(`Đã tải video mẫu "${sample.title}"!`, "success");
    onImportSuccess?.({
      videoUrl: sample.videoUrl,
      title: sample.title,
      initialCues: sample.cues,
      autoStartTranslate: false,
      platform: sample.platform,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-slate-100 max-h-[90dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-pink-600/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Nhập Video Từ TikTok, Facebook & Mạng Xã Hội</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Smart Extract
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dán link TikTok, Facebook Reels, YouTube Shorts để tự động tạo Vietsub và lồng tiếng AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setPlatformTab("tiktok")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              platformTab === "tiktok"
                ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🎵 TikTok / Douyin</span>
          </button>

          <button
            onClick={() => setPlatformTab("facebook")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              platformTab === "facebook"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>📘 Facebook Reels & Watch</span>
          </button>

          <button
            onClick={() => setPlatformTab("youtube")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              platformTab === "youtube"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>▶️ YouTube Shorts</span>
          </button>

          <button
            onClick={() => setPlatformTab("capcut")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              platformTab === "capcut"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>⚡ CapCut & Instagram</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* URL Input Form */}
          <form onSubmit={handleImportSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={
                  platformTab === "tiktok"
                    ? "Dán link TikTok (vd: https://vt.tiktok.com/... hoặc shortdrama.tiktok.com/...)"
                    : platformTab === "facebook"
                    ? "Dán link Facebook (vd: https://www.facebook.com/reel/... hoặc fb.watch/...)"
                    : platformTab === "youtube"
                    ? "Dán link YouTube (vd: https://youtube.com/shorts/...)"
                    : "Dán link mẫu CapCut hoặc Instagram Reel..."
                }
                className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none transition-colors pr-28 shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>{isLoading ? "Đang nạp..." : "Nhập Video"}</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Auto Action Options */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoVietsubOnImport}
                  onChange={(e) => setAutoVietsubOnImport(e.target.checked)}
                  className="rounded border-slate-700 text-pink-600 focus:ring-0"
                />
                <span>Tự động tạo phụ đề Vietsub sau khi tải</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoVoiceoverOnImport}
                  onChange={(e) => setAutoVoiceoverOnImport(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>Bật thuyết minh AI đa giọng (Nam/Nữ)</span>
              </label>
            </div>
          </form>

          {/* Quick Viral Presets (1-Click Test) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>Video Mẫu Hot Trend Có Sẵn (Thử Nhanh 1-Click)</span>
              </span>
              <span className="text-[11px] text-slate-400">Không cần tìm link</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VIRAL_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-900/90 transition flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {sample.platform === "tiktok"
                          ? "TT"
                          : sample.platform === "facebook"
                          ? "FB"
                          : sample.platform === "youtube"
                          ? "YT"
                          : "CC"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                          {sample.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{sample.author} • {sample.duration}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-pink-400 font-semibold">
                    <span className="text-slate-400 text-[10px]">{sample.cues.length} câu thoại sẵn</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Nạp & Dịch Ngay <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
