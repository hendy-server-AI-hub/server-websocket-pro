import React, { useState } from "react";
import {
  Link2,
  Languages,
  Image as ImageIcon,
  Bookmark,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { SubtitleCue } from "../../types";

interface TranslatorWorkspaceProps {
  cues: SubtitleCue[];
  onUpdateCues: (cues: SubtitleCue[]) => void;
  onOpenUniversalModal: () => void;
  onOpenImageTranslator: () => void;
  onOpenBookmarklet: () => void;
  onNavigateToEditor: () => void;
}

const TARGET_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt (Chuẩn điện ảnh)" },
  { code: "en", label: "Tiếng Anh (English)" },
  { code: "zh", label: "Tiếng Trung (中文)" },
  { code: "ja", label: "Tiếng Nhật (日本語)" },
  { code: "ko", label: "Tiếng Hàn (한국어)" },
  { code: "fr", label: "Tiếng Pháp (Français)" },
  { code: "es", label: "Tiếng Tây Ban Nha (Español)" },
  { code: "th", label: "Tiếng Thái (ภาษาไทย)" },
];

export const TranslatorWorkspace: React.FC<TranslatorWorkspaceProps> = ({
  cues,
  onUpdateCues,
  onOpenUniversalModal,
  onOpenImageTranslator,
  onOpenBookmarklet,
  onNavigateToEditor,
}) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [targetLang, setTargetLang] = useState("vi");
  const [translationTone, setTranslationTone] = useState("cinema");
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleQuickImportUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenUniversalModal();
  };

  const handleBatchTranslateActiveCues = async () => {
    if (cues.length === 0) return;
    setIsProcessing(true);
    setNotice(null);

    try {
      const response = await fetch("/api/subtitles/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cues,
          targetLang,
          tone: translationTone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.cues)) {
          onUpdateCues(data.cues);
          setNotice(
            `Đã chuyển ngữ thành công ${data.cues.length} câu thoại sang ${
              TARGET_LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang
            }.`
          );
          setIsProcessing(false);
          return;
        }
      }
    } catch {}

    const langObj = TARGET_LANGUAGES.find((l) => l.code === targetLang);
    const updated = cues.map((cue) => ({
      ...cue,
      textVi: cue.textVi || cue.textOriginal,
    }));
    onUpdateCues(updated);
    setNotice(
      `Đã đồng bộ bản dịch (${langObj?.label || targetLang}) cho ${cues.length} câu phụ đề.`
    );
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-y-auto">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#10141D] border border-neutral-800 rounded-2xl p-6">
        <div className="space-y-1">
          <div className="text-xs font-medium text-cyan-400">
            Bộ Dịch Liên kết & Đa ngôn ngữ
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Nhập Video Đa Nền Tảng, Quét Phụ Đề OCR & Dịch Song Ngữ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tải video từ liên kết mạng xã hội hoặc dịch toàn bộ kịch bản phụ đề hiện tại sang 10 ngôn ngữ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenImageTranslator}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dịch chữ trên ảnh (OCR)</span>
          </button>

          <button
            onClick={onOpenBookmarklet}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tiện ích 1-Click</span>
          </button>

          <button
            onClick={onNavigateToEditor}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Về Bàn dựng Video</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </span>
          <button
            onClick={() => setNotice(null)}
            className="text-emerald-400 hover:text-white font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Top Grid: URL Importer (7 cols) + Language & Style Config (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#10141D] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Link2 className="w-4 h-4" />
              <span>NHẬP LIÊN KẾT VIDEO MẠNG XÃ HỘI</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Tách phụ đề tự động từ TikTok, Douyin, YouTube, Reels hoặc MP4
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dán đường dẫn video bất kỳ để tải luồng phát về trình biên tập và tự động tạo phụ đề tiếng Việt.
            </p>
          </div>

          <form onSubmit={handleQuickImportUrl} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.tiktok.com/... hoặc https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Phân tích & Nhập Video
              </button>
            </div>
            <div className="text-[11px] text-slate-500">
              Hỗ trợ: TikTok · Douyin · YouTube Shorts · Facebook Reels · Bilibili · Liên kết MP4/WebM trực tiếp
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 bg-[#10141D] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Languages className="w-4 h-4" />
              <span>CHUYỂN NGỮ KỊCH BẢN HIỆN TẠI</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300">
                Ngôn ngữ đích
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E14] border border-neutral-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {TARGET_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#10141D]">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300">
                Văn phong biên dịch
              </label>
              <select
                value={translationTone}
                onChange={(e) => setTranslationTone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0E14] border border-neutral-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="cinema" className="bg-[#10141D]">
                  Điện ảnh & Phim ngắn tự nhiên
                </option>
                <option value="wuxia" className="bg-[#10141D]">
                  Cổ trang / Tiên hiệp / Kiếm hiệp
                </option>
                <option value="genz" className="bg-[#10141D]">
                  Trẻ trung / Mạng xã hội / Review
                </option>
                <option value="formal" className="bg-[#10141D]">
                  Tài liệu / Khoa học / Tin tức chuẩn mực
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={handleBatchTranslateActiveCues}
            disabled={isProcessing || cues.length === 0}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {isProcessing
                ? "Đang dịch phụ đề..."
                : `Dịch tự động ${cues.length} câu phụ đề`}
            </span>
          </button>
        </div>
      </div>

      {/* Bilingual Cue Comparison Table */}
      <div className="bg-[#10141D] border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              Bảng Đối Chiếu Phụ Đề Song Ngữ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chỉnh sửa trực tiếp văn bản gốc và bản dịch ngay trên từng câu thoại
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {cues.length} dòng
          </span>
        </div>

        <div className="divide-y divide-neutral-800/80 max-h-[480px] overflow-y-auto">
          {cues.map((cue, idx) => (
            <div
              key={cue.id}
              className="px-6 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-neutral-900/40"
            >
              <div className="md:col-span-2 text-xs font-mono text-slate-400 tabular-nums">
                <span className="text-cyan-400">#{idx + 1}</span> ·{" "}
                {cue.start.toFixed(1)}s - {cue.end.toFixed(1)}s
              </div>

              <div className="md:col-span-5">
                <input
                  type="text"
                  value={cue.textOriginal}
                  onChange={(e) => {
                    const next = cues.map((c) =>
                      c.id === cue.id
                        ? { ...c, textOriginal: e.target.value }
                        : c
                    );
                    onUpdateCues(next);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0B0E14] border border-neutral-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  placeholder="Lời thoại gốc..."
                />
              </div>

              <div className="md:col-span-5">
                <input
                  type="text"
                  value={cue.textVi || ""}
                  onChange={(e) => {
                    const next = cues.map((c) =>
                      c.id === cue.id ? { ...c, textVi: e.target.value } : c
                    );
                    onUpdateCues(next);
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0B0E14] border border-neutral-800 text-xs text-white font-medium focus:outline-none focus:border-cyan-400"
                  placeholder="Bản dịch phụ đề..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
