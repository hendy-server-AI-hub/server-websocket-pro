import React, { useState } from "react";
import {
  X,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Type,
  Maximize,
  Smartphone,
  Monitor,
  Flame,
  Music,
  Check,
  Disc,
  Zap,
  Play,
  RotateCcw,
  Activity,
  Mic,
  Smile,
  Layers,
  Palette,
  TrendingUp,
  MessageSquare,
  Volume1,
} from "lucide-react";
import {
  SubtitleStyle,
  CapCutPreset,
  CapCutAnimation,
  CapCutBubbleStyle,
  CapCutSpeedCurvePreset,
  AspectRatio,
  AudioEditConfig,
} from "../types";

interface CapCutEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: SubtitleStyle;
  onChangeStyle: (newStyle: SubtitleStyle) => void;
  audioConfig: AudioEditConfig;
  onChangeAudioConfig: (newAudioConfig: AudioEditConfig) => void;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

export const CapCutEditorModal: React.FC<CapCutEditorModalProps> = ({
  isOpen,
  onClose,
  style,
  onChangeStyle,
  audioConfig,
  onChangeAudioConfig,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<
    "capcut-subtitles" | "speed-curve" | "capcut-voices" | "audio-editing" | "canvas-ratio"
  >("capcut-subtitles");

  const [previewPlaying, setPreviewPlaying] = useState(false);

  if (!isOpen) return null;

  // Preset definitions based on CapCut Vietnam trending designs
  const CAPCUT_PRESETS: {
    id: CapCutPreset;
    name: string;
    tag: string;
    icon: string;
    description: string;
    styleProps: Partial<SubtitleStyle>;
  }[] = [
    {
      id: "tiktok-bold",
      name: "TikTok 3D Bold Stroke",
      tag: "Trending CapCut",
      icon: "🔥",
      description: "Chữ trắng viền đen dày 3D đặc trưng video triệu view TikTok / Shorts",
      styleProps: {
        capcutPreset: "tiktok-bold",
        textColor: "#FFFFFF",
        strokeColor: "#000000",
        strokeWidth: 3,
        bold: true,
        uppercase: true,
        backgroundColor: "none",
        textShadow: true,
        fontFamily: "sans",
        fontSize: "xl",
        animation: "bounce",
        bubbleStyle: "none",
        textCurveRadius: 0,
      },
    },
    {
      id: "karaoke-glow",
      name: "Karaoke Glow Wave",
      tag: "Âm nhạc & Lời hát",
      icon: "✨",
      description: "Hiệu ứng chữ phát sáng neon rực rỡ đổi màu theo từng nhịp điệu phát",
      styleProps: {
        capcutPreset: "karaoke-glow",
        textColor: "#FACC15",
        glowColor: "rgba(250, 204, 21, 0.9)",
        strokeColor: "#000000",
        strokeWidth: 2,
        bold: true,
        backgroundColor: "translucent-black",
        textShadow: true,
        fontSize: "xl",
        animation: "karaoke-glow",
        bubbleStyle: "none",
        textCurveRadius: 0,
      },
    },
    {
      id: "cinema-yellow",
      name: "Cinema Yellow (Điện Ảnh)",
      tag: "Netflix / Phim Rạp",
      icon: "🎬",
      description: "Màu vàng điện ảnh kinh điển chuẩn Netflix, dễ đọc trên mọi cảnh quay",
      styleProps: {
        capcutPreset: "cinema-yellow",
        textColor: "#FACC15",
        strokeColor: "#000000",
        strokeWidth: 2,
        bold: true,
        backgroundColor: "shadow-only",
        textShadow: true,
        fontFamily: "sans",
        fontSize: "lg",
        animation: "fade",
        bubbleStyle: "none",
        textCurveRadius: 0,
      },
    },
    {
      id: "cyberpunk-neon",
      name: "Cyberpunk Neon Pop",
      tag: "Vlog / EDM / Gaming",
      icon: "⚡",
      description: "Viền tím hồng Neon tương phản xanh Cyan cực kỳ nổi bật",
      styleProps: {
        capcutPreset: "cyberpunk-neon",
        textColor: "#06B6D4",
        strokeColor: "#D946EF",
        strokeWidth: 2,
        glowColor: "rgba(217, 70, 239, 0.8)",
        bold: true,
        uppercase: true,
        backgroundColor: "none",
        textShadow: true,
        fontSize: "xl",
        animation: "zoom-in",
        bubbleStyle: "neon-border",
        textCurveRadius: 0,
      },
    },
    {
      id: "vtv-news",
      name: "VTV Tin Tức Headline",
      tag: "Thời Sự / Báo Chí",
      icon: "📺",
      description: "Khung nền đỏ đậm chữ trắng sắc nét chuẩn bản tin thời sự truyền hình",
      styleProps: {
        capcutPreset: "vtv-news",
        textColor: "#FFFFFF",
        strokeWidth: 0,
        backgroundColor: "solid-black",
        bold: true,
        uppercase: true,
        fontSize: "lg",
        animation: "typewriter",
        bubbleStyle: "minimal-pill",
        textCurveRadius: 0,
      },
    },
    {
      id: "pastel-anime",
      name: "Pastel Douyin Soft",
      tag: "Vlog Đời Sống / Tình Cảm",
      icon: "🌸",
      description: "Tone màu hồng phấn thanh lịch, nhẹ nhàng phù hợp vlog cuộc sống",
      styleProps: {
        capcutPreset: "pastel-anime",
        textColor: "#FDF2F8",
        strokeColor: "#F472B6",
        strokeWidth: 2,
        glowColor: "rgba(244, 114, 182, 0.6)",
        bold: true,
        fontSize: "lg",
        animation: "pop-up",
        bubbleStyle: "rounded-glass",
        textCurveRadius: 0,
      },
    },
  ];

  // CapCut Bubble Styles
  const BUBBLE_STYLES: {
    id: CapCutBubbleStyle;
    name: string;
    description: string;
    preview: string;
  }[] = [
    { id: "none", name: "Không Khung", description: "Hiển thị chữ nguyên bản", preview: "Chữ tự do" },
    { id: "comic", name: "Truyện Tranh (Comic)", description: "Nền trắng viền đen đậm phong cách manga", preview: "💬 Manga" },
    { id: "neon-border", name: "Neon Viền Sáng", description: "Khung viền dạ quang phát sáng", preview: "✨ Neon" },
    { id: "rounded-glass", name: "Kính Mờ (Glass)", description: "Nền kính mờ bo tròn cao cấp", preview: "💎 Glass" },
    { id: "retro-badge", name: "Huy Hiệu Retro", description: "Khung vát góc thập niên 80s", preview: "📼 Retro" },
    { id: "minimal-pill", name: "Viên Nhộng Tối Giản", description: "Khung bo tròn đen mờ thanh lịch", preview: "💊 Pill" },
  ];

  // CapCut Speed Curve Presets
  const SPEED_CURVES: {
    id: CapCutSpeedCurvePreset;
    name: string;
    icon: string;
    description: string;
    curvePoints: { x: number; y: number }[];
    speedLabel: string;
  }[] = [
    {
      id: "standard",
      name: "Tiêu Chuẩn (1.0x)",
      icon: "⏱",
      description: "Tốc độ đều 100%, tự nhiên và chân thực",
      curvePoints: [{ x: 0, y: 1 }, { x: 50, y: 1 }, { x: 100, y: 1 }],
      speedLabel: "1.0x Đều",
    },
    {
      id: "montage",
      name: "Montage (Uốn Lượn)",
      icon: "🌊",
      description: "Chậm mở đầu -> Tăng tốc giữa đoạn -> Chậm kết thúc",
      curvePoints: [{ x: 0, y: 0.5 }, { x: 45, y: 3.2 }, { x: 100, y: 0.6 }],
      speedLabel: "0.5x ➔ 3.2x ➔ 0.6x",
    },
    {
      id: "hero",
      name: "Hero Time (Cao Trào)",
      icon: "🦸‍♂️",
      description: "Chậm lại siêu thực ở khoảnh khắc hành động rồi phóng vút",
      curvePoints: [{ x: 0, y: 1.2 }, { x: 40, y: 0.25 }, { x: 75, y: 0.25 }, { x: 100, y: 2.5 }],
      speedLabel: "1.2x ➔ 0.25x ➔ 2.5x",
    },
    {
      id: "bullet",
      name: "Bullet Time (Ma Trận)",
      icon: "🎯",
      description: "Điểm nhấn đóng băng thời gian cực chậm",
      curvePoints: [{ x: 0, y: 1.5 }, { x: 50, y: 0.15 }, { x: 100, y: 1.8 }],
      speedLabel: "1.5x ➔ 0.15x ➔ 1.8x",
    },
    {
      id: "jump-cut",
      name: "Jump Cut (Nhịp Điệu)",
      icon: "⚡",
      description: "Biến thiên ngắt nhịp liên tục theo giai điệu EDM",
      curvePoints: [{ x: 0, y: 2.0 }, { x: 30, y: 0.7 }, { x: 70, y: 2.2 }, { x: 100, y: 0.8 }],
      speedLabel: "2.0x ➔ 0.7x ➔ 2.2x",
    },
    {
      id: "flash",
      name: "Flash (Chớp Nhoáng)",
      icon: "💥",
      description: "Tăng tốc cực nhanh tạo cảm giác chuyển cảnh tức thì",
      curvePoints: [{ x: 0, y: 0.8 }, { x: 50, y: 4.5 }, { x: 100, y: 1.0 }],
      speedLabel: "0.8x ➔ 4.5x ➔ 1.0x",
    },
  ];

  // Vietnamese CapCut TTS Voices
  const CAPCUT_VOICES = [
    { id: "ban_mai", name: "Ban Mai (Nữ Miền Bắc)", role: "Truyền cảm, dịu dàng, tự nhiên", tag: "Hot TikTok", sample: "Xin chào bạn, chúc bạn một ngày tràn đầy năng lượng." },
    { id: "nam_than", name: "Nam Thần (Nam Trầm Ấm)", role: "Trầm lắng, cuốn hút, review phim", tag: "Triệu View", sample: "Chào mừng các bạn đã quay trở lại với kênh phim hôm nay." },
    { id: "co_giao", name: "Cô Giáo (Nữ Sư Phạm)", role: "Trong trẻo, rõ ràng, giáo dục", tag: "Thanh Lịch", sample: "Hôm nay chúng ta sẽ cùng khám phá những điều thú vị này nhé." },
    { id: "mc_hanoi", name: "MC Thời Sự (Nam Tin Tức)", role: "Chuẩn giọng đài truyền hình, đĩnh đạc", tag: "Thời Sự", sample: "Kính chào quý vị và các bạn đang theo dõi bản tin đặc biệt." },
    { id: "hotgirl_tiktok", name: "Hotgirl TikTok (Nữ Sôi Nổi)", role: "Trẻ trung, tươi tắn, review đồ ăn", tag: "Trending", sample: "Hé lô mọi người! Hôm nay cùng mình trải nghiệm món này nhé!" },
    { id: "ke_chuyen", name: "Kể Chuyện Đêm (Nam Ấm)", role: "Thủ thỉ, sâu lắng, tâm sự", tag: "Podcast", sample: "Đêm đã về khuya, hãy cùng lắng nghe câu chuyện sau đây." },
  ];

  const handleApplyPreset = (preset: (typeof CAPCUT_PRESETS)[0]) => {
    onChangeStyle({
      ...style,
      ...preset.styleProps,
    });
    if (onNotify) onNotify(`Đã áp dụng mẫu chữ CapCut: "${preset.name}"!`, "success");
  };

  const handleSelectSpeedCurve = (preset: (typeof SPEED_CURVES)[0]) => {
    onChangeStyle({
      ...style,
      speedCurvePreset: preset.id,
      speedCurvePoints: preset.curvePoints,
    });
    // Adjust audio playback speed average
    const avgSpeed = preset.id === "standard" ? 1.0 : preset.id === "hero" ? 0.85 : 1.25;
    onChangeAudioConfig({
      ...audioConfig,
      playbackSpeed: avgSpeed,
    });
    if (onNotify) onNotify(`Đã chọn đường cong tốc độ: "${preset.name}"!`, "success");
  };

  const handleAuditionVoice = (voice: (typeof CAPCUT_VOICES)[0]) => {
    onChangeStyle({
      ...style,
      capcutVoiceId: voice.id,
    });

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voice.sample);
      utterance.lang = "vi-VN";
      utterance.rate = 1.0;
      utterance.pitch = voice.id.includes("nam") ? 0.85 : 1.1;
      window.speechSynthesis.speak(utterance);
    }

    if (onNotify) onNotify(`Đang thử giọng CapCut: "${voice.name}"`, "info");
  };

  // Render bubble styling classes
  const getBubbleContainerStyle = () => {
    switch (style.bubbleStyle) {
      case "comic":
        return "bg-white text-black font-bold border-2 border-black rounded-2xl px-5 py-2.5 shadow-[4px_4px_0px_#000000]";
      case "neon-border":
        return "bg-slate-950/80 text-cyan-300 border-2 border-fuchsia-500 rounded-2xl px-5 py-2.5 shadow-[0_0_15px_rgba(217,70,239,0.7)]";
      case "rounded-glass":
        return "bg-slate-900/60 backdrop-blur-md text-white border border-white/20 rounded-3xl px-6 py-2.5 shadow-xl";
      case "retro-badge":
        return "bg-amber-400 text-slate-950 font-black border-2 border-amber-600 rounded-lg px-4 py-2 uppercase tracking-wider";
      case "minimal-pill":
        return "bg-black/80 text-white rounded-full px-6 py-2 border border-slate-700/80";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="capcut-modal-dialog"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Bộ Công Cụ CapCut Pro Studio</h3>
                <span className="text-[10px] bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Chuẩn CapCut Việt Nam
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mẫu chữ 3D, Bong bóng hội thoại, Đường cong tốc độ, Lồng tiếng AI & Khung hình TikTok
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "capcut-subtitles", label: "Mẫu Chữ & Bong Bóng", icon: Type },
            { id: "speed-curve", label: "Đường Cong Tốc Độ", icon: TrendingUp },
            { id: "capcut-voices", label: "Lồng Tiếng AI CapCut", icon: Mic },
            { id: "audio-editing", label: "Âm Thanh & Lọc Ồn", icon: Volume2 },
            { id: "canvas-ratio", label: "Tỷ Lệ & Safe Zone", icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? "border-rose-500 text-rose-400 bg-rose-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: SUBTITLES & BUBBLES */}
          {activeTab === "capcut-subtitles" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Live Preview Card */}
              <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 p-6 flex flex-col items-center justify-center min-h-[140px] overflow-hidden shadow-inner">
                <span className="absolute top-2 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  Xem Trước Kiểu Chữ Trực Tiếp
                </span>

                <div
                  className={`transition-all duration-300 text-center ${getBubbleContainerStyle()}`}
                  style={{
                    transform: style.textCurveRadius ? `scale(1.05)` : undefined,
                  }}
                >
                  <p
                    className={`font-black tracking-wide ${
                      style.uppercase ? "uppercase" : ""
                    } ${style.bold ? "font-bold" : ""} ${style.italic ? "italic" : ""}`}
                    style={{
                      color: style.textColor,
                      fontSize: "1.35rem",
                      WebkitTextStroke: style.strokeWidth
                        ? `${style.strokeWidth}px ${style.strokeColor || "#000"}`
                        : undefined,
                      textShadow: style.glowColor
                        ? `0 0 16px ${style.glowColor}, 0 0 8px ${style.glowColor}`
                        : style.textShadow
                        ? "2px 2px 4px rgba(0,0,0,0.8)"
                        : undefined,
                    }}
                  >
                    Vietsub Video Studio · Phong Cách CapCut
                  </p>
                  <p className="text-xs opacity-80 mt-1">Phụ đề tự động thông minh chuẩn nhịp điệu</p>
                </div>
              </div>

              {/* CapCut Trending Presets */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Mẫu Chữ Thịnh Hành (Trending Presets):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CAPCUT_PRESETS.map((preset) => {
                    const isSelected = style.capcutPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-base">{preset.icon}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-rose-300 border border-slate-700">
                              {preset.tag}
                            </span>
                          </div>
                          <div className="font-bold text-sm text-white">{preset.name}</div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-rose-400">
                            <Check className="w-3.5 h-3.5" /> Đang Áp Dụng
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bubble Captions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Bong Bóng Hội Thoại (CapCut Bubbles):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {BUBBLE_STYLES.map((b) => {
                    const isSelected = (style.bubbleStyle || "none") === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onChangeStyle({ ...style, bubbleStyle: b.id });
                          if (onNotify) onNotify(`Đã chọn bong bóng: ${b.name}`, "info");
                        }}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-purple-950/60 border-purple-500 text-purple-200 font-bold"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-sm mb-1">{b.preview}</div>
                        <div className="text-xs font-semibold">{b.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Curve & Text Animation Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>Uốn Cong Dòng Chữ (Text Curve):</span>
                    <span className="font-mono text-rose-400">{style.textCurveRadius || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={style.textCurveRadius || 0}
                    onChange={(e) => onChangeStyle({ ...style, textCurveRadius: Number(e.target.value) })}
                    className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Uốn Xuống (-50%)</span>
                    <span>Thẳng (0%)</span>
                    <span>Uốn Lên (+50%)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Hiệu Ứng Chữ Động (Animation):</label>
                  <select
                    value={style.animation || "none"}
                    onChange={(e) => onChangeStyle({ ...style, animation: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="none">Tĩnh (Không chuyển động)</option>
                    <option value="karaoke-glow">Karaoke Glow (Sáng theo nhịp điệu)</option>
                    <option value="bounce">Nhún Nảy 3D (Bounce TikTok)</option>
                    <option value="typewriter">Máy Đánh Chữ (Typewriter)</option>
                    <option value="fade">Mờ Dần Điện Ảnh (Cinematic Fade)</option>
                    <option value="zoom-in">Phóng To Bùng Nổ (Zoom In)</option>
                    <option value="pop-up">Bật Nảy Pop-Up (Trending)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPEED CURVE RAMPING */}
          {activeTab === "speed-curve" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-800/60 space-y-2">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Đường Cong Tốc Độ (Speed Curve / Curve Speed Ramping)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cơ chế uốn cong tốc độ độc quyền của CapCut cho phép biến thiên nhịp độ video mượt mà, tạo điểm nhấn cao trào và nhịp điệu cuốn hút cho TikTok và Reels.
                </p>
              </div>

              {/* Speed Curves Preset Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SPEED_CURVES.map((curve) => {
                  const isSelected = (style.speedCurvePreset || "standard") === curve.id;
                  return (
                    <div
                      key={curve.id}
                      onClick={() => handleSelectSpeedCurve(curve)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? "bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{curve.icon}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {curve.speedLabel}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-white">{curve.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {curve.description}
                        </p>
                      </div>

                      {/* Mini SVG Curve Visualization */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80">
                        <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 40">
                          <path
                            d={`M 0,${40 - (curve.curvePoints[0]?.y || 1) * 10} Q 45,${
                              40 - (curve.curvePoints[1]?.y || 1) * 10
                            } 100,${40 - (curve.curvePoints[curve.curvePoints.length - 1]?.y || 1) * 10}`}
                            fill="none"
                            stroke={isSelected ? "#06B6D4" : "#64748B"}
                            strokeWidth="3"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: VIETNAMESE CAPCUT TTS VOICES */}
          {activeTab === "capcut-voices" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-pink-950/40 border border-purple-800/60 space-y-2">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Giọng Đọc Lồng Tiếng AI Chuẩn CapCut Việt Nam
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tuyển tập các giọng thuyết minh thịnh hành trên TikTok và CapCut Việt Nam. Nghe thử trực tiếp và áp dụng vào toàn bộ phụ đề video.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CAPCUT_VOICES.map((voice) => {
                  const isSelected = style.capcutVoiceId === voice.id;
                  return (
                    <div
                      key={voice.id}
                      className={`rounded-xl p-4 border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/60">
                            {voice.tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAuditionVoice(voice)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition"
                            title="Nghe thử giọng"
                          >
                            <Volume1 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h5 className="font-bold text-sm text-white">{voice.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {voice.role}
                        </p>
                        <p className="text-[10px] italic text-slate-500 mt-2 bg-slate-900/80 p-2 rounded-lg">
                          "{voice.sample}"
                        </p>
                      </div>

                      <div className="mt-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onChangeStyle({ ...style, capcutVoiceId: voice.id });
                            if (onNotify) onNotify(`Đã chọn giọng đọc CapCut: ${voice.name}`, "success");
                          }}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          {isSelected ? "Đã Chọn Giọng Này" : "Chọn Giọng"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIO EDITING */}
          {activeTab === "audio-editing" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Volume Multiplier */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-400" />
                    <span>Khuếch đại âm lượng thoại (Volume Boost):</span>
                  </label>
                  <span className="font-mono text-sm font-bold text-purple-400">
                    {Math.round(audioConfig.volumeMultiplier * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.05"
                  value={audioConfig.volumeMultiplier}
                  onChange={(e) =>
                    onChangeAudioConfig({
                      ...audioConfig,
                      volumeMultiplier: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Tăng độ trong lời thoại</div>
                    <p className="text-[11px] text-slate-400">Làm rõ nét giọng nói nhân vật</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioConfig.vocalEnhance}
                    onChange={(e) =>
                      onChangeAudioConfig({ ...audioConfig, vocalEnhance: e.target.checked })
                    }
                    className="w-4 h-4 accent-purple-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Khử tiếng ồn môi trường</div>
                    <p className="text-[11px] text-slate-400">Khử tiếng gió, tạp âm ngoài trời</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioConfig.noiseReduction}
                    onChange={(e) =>
                      onChangeAudioConfig({ ...audioConfig, noiseReduction: e.target.checked })
                    }
                    className="w-4 h-4 accent-purple-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Audio Ducking</div>
                    <p className="text-[11px] text-slate-400">Tự động giảm nhạc nền khi nói</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioConfig.audioDucking}
                    onChange={(e) =>
                      onChangeAudioConfig({ ...audioConfig, audioDucking: e.target.checked })
                    }
                    className="w-4 h-4 accent-purple-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Tăng âm trầm (Bass Boost)</div>
                    <p className="text-[11px] text-slate-400">Giúp giọng nói dày và ấm hơn</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioConfig.bassBoost}
                    onChange={(e) =>
                      onChangeAudioConfig({ ...audioConfig, bassBoost: e.target.checked })
                    }
                    className="w-4 h-4 accent-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CANVAS & ASPECT RATIO */}
          {activeTab === "canvas-ratio" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Tỷ Lệ Khung Hình Video (Aspect Ratio Presets):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: "9:16", label: "9:16 Dọc", sub: "TikTok / Shorts / Reels" },
                    { id: "16:9", label: "16:9 Ngang", sub: "YouTube / Phim" },
                    { id: "1:1", label: "1:1 Vuông", sub: "Instagram Feed" },
                    { id: "4:5", label: "4:5 Dọc Nhẹ", sub: "Facebook Feed" },
                    { id: "21:9", label: "21:9 Điện Ảnh", sub: "Cinema Anamorphic" },
                  ].map((ratio) => {
                    const isSelected = (style.aspectRatio || "16:9") === ratio.id;
                    return (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => {
                          onChangeStyle({ ...style, aspectRatio: ratio.id as any });
                          if (onNotify) onNotify(`Đã đặt tỷ lệ khung hình: ${ratio.id}`, "info");
                        }}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-rose-950/60 border-rose-500 text-rose-200 font-bold"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-base font-bold mb-1">{ratio.label}</div>
                        <div className="text-[10px] text-slate-500">{ratio.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TikTok Safe Zone Grid */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Bật Lưới Vùng An Toàn TikTok (Safe Zone Grid)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tránh để phụ đề bị che bởi nút Like, Comment, Share và thanh mô tả của TikTok
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={style.showTikTokSafeZone ?? true}
                  onChange={(e) =>
                    onChangeStyle({ ...style, showTikTokSafeZone: e.target.checked })
                  }
                  className="w-4 h-4 accent-rose-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 shrink-0">
          <button
            type="button"
            onClick={() => {
              onChangeAudioConfig({
                volumeMultiplier: 1.0,
                vocalEnhance: false,
                bassBoost: false,
                noiseReduction: false,
                audioDucking: false,
                playbackSpeed: 1.0,
                reverb: "none",
              });
              onChangeStyle({
                ...style,
                bubbleStyle: "none",
                textCurveRadius: 0,
                speedCurvePreset: "standard",
              });
              if (onNotify) onNotify("Đã đặt lại thông số về mặc định!", "info");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại mặc định</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
          >
            Hoàn tất & Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
