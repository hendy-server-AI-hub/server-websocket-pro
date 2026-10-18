import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Clock,
  Search,
  ArrowDownNarrowWide,
  Check,
  ChevronDown,
  Sparkles,
  MoveRight,
  RotateCcw,
  GitMerge,
  Volume2,
  Users,
  Wand2,
  Activity,
  Loader2,
  Sliders,
} from "lucide-react";
import { SubtitleCue, SpeakerVoicePersona } from "../types";
import { formatSecondsToDisplay, formatSecondsToSrtTime } from "../utils/subtitleFormatters";
import { useDeviceOptimization } from "../hooks/useDeviceOptimization";
import {
  previewVoice,
  stopVoicePreview,
  previewSpeakerPersona,
  getPersonaInfo,
  SPEAKER_PERSONAS,
} from "../utils/voiceoverEngine";
import {
  autoSyncSubtitleCues,
  AutoSyncResult,
  CueSyncDetail,
} from "../utils/audioSyncEngine";

export interface SubtitleListProps {
  cues: SubtitleCue[];
  currentTime: number;
  onSelectCue: (time: number) => void;
  onUpdateCue: (updatedCue: SubtitleCue) => void;
  onDeleteCue: (id: number) => void;
  onAddCue: (atTime?: number) => void;
  onShiftAllCues: (offsetSeconds: number) => void;
  onOpenRefineModal: () => void;
  onSaveEdits?: () => void;
  onMergeCues?: (firstCueId: number, secondCueId: number) => void;
  onOpenVoiceoverModal?: () => void;
  onOpenSmartMerge?: () => void;
  onDetectSpeakers?: () => void;
  isDetectingSpeakers?: boolean;
  onUpdateCues?: (updatedCues: SubtitleCue[]) => void;
  videoUrl?: string;
  audioFile?: File | null;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

export const SubtitleList: React.FC<SubtitleListProps> = ({
  cues,
  currentTime,
  onSelectCue,
  onUpdateCue,
  onDeleteCue,
  onAddCue,
  onShiftAllCues,
  onOpenRefineModal,
  onSaveEdits,
  onMergeCues,
  onOpenVoiceoverModal,
  onOpenSmartMerge,
  onDetectSpeakers,
  isDetectingSpeakers,
  onUpdateCues,
  videoUrl,
  audioFile,
  onNotify,
}) => {
  const platformInfo = useDeviceOptimization();
  const [searchQuery, setSearchQuery] = useState("");
  // Subtitle list browsing is independent from video playback per user specification
  const [autoScroll, setAutoScroll] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [timeShiftVal, setTimeShiftVal] = useState<number>(0.2);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);
  const [selectedCueIds, setSelectedCueIds] = useState<number[]>([]);
  const [activePlayingCueId, setActivePlayingCueId] = useState<number | null>(null);

  // Auto-Sync Vocal Alignment State
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [autoSyncStep, setAutoSyncStep] = useState("");
  const [autoSyncPercent, setAutoSyncPercent] = useState(0);
  const [showAutoSyncPanel, setShowAutoSyncPanel] = useState(false);
  const [syncSensitivity, setSyncSensitivity] = useState<"low" | "medium" | "high">("medium");
  const [syncLeadInMs, setSyncLeadInMs] = useState<number>(50);
  const [syncLeadOutMs, setSyncLeadOutMs] = useState<number>(110);
  const [lastSyncResult, setLastSyncResult] = useState<AutoSyncResult | null>(null);
  const [preSyncSnapshot, setPreSyncSnapshot] = useState<SubtitleCue[] | null>(null);

  const activeCardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Toggle selection of a cue (supports selecting multiple cues for Auto-Sync and 2 adjacent cues for Merge)
  const handleToggleSelectCue = (cueId: number) => {
    setSelectedCueIds((prev) => {
      if (prev.includes(cueId)) {
        return prev.filter((id) => id !== cueId);
      }
      return [...prev, cueId];
    });
  };

  const handleToggleSelectAllCues = () => {
    if (selectedCueIds.length === cues.length) {
      setSelectedCueIds([]);
    } else {
      setSelectedCueIds(cues.map((c) => c.id));
    }
  };

  // Run Audio Analysis Vocal Start/End Auto-Sync on selected cues (or specified cue IDs / all cues)
  const handleRunAutoSync = async (overrideCueIds?: number[]) => {
    if (cues.length === 0 || isAutoSyncing) return;

    const targetIds =
      overrideCueIds && overrideCueIds.length > 0
        ? overrideCueIds
        : selectedCueIds.length > 0
        ? selectedCueIds
        : cues.map((c) => c.id);

    setPreSyncSnapshot(cues.map((c) => ({ ...c })));
    setIsAutoSyncing(true);
    setAutoSyncStep("Đang phân tích phổ âm thanh giọng nói...");
    setAutoSyncPercent(10);

    try {
      const result = await autoSyncSubtitleCues(
        cues,
        targetIds,
        audioFile || videoUrl || null,
        {
          sensitivity: syncSensitivity,
          leadInMs: syncLeadInMs,
          leadOutMs: syncLeadOutMs,
          onProgress: (step, pct) => {
            setAutoSyncStep(step);
            setAutoSyncPercent(pct);
          },
        }
      );

      if (onUpdateCues) {
        onUpdateCues(result.updatedCues);
      } else {
        result.updatedCues.forEach((updated) => onUpdateCue(updated));
      }

      setLastSyncResult(result);
      onNotify?.(
        `Auto-Sync hoàn tất: Đã căn chỉnh ${result.alignedCount} câu phụ đề khớp điểm bắt đầu/kết thúc giọng nói (lệch TB ±${result.averageShiftMs}ms)!`,
        "success"
      );
    } catch (err: any) {
      console.error("Auto-Sync error:", err);
      onNotify?.(err.message || "Không thể đồng bộ âm thanh tự động.", "error");
    } finally {
      setIsAutoSyncing(false);
      setAutoSyncStep("");
      setAutoSyncPercent(0);
    }
  };

  const handleUndoAutoSync = () => {
    if (!preSyncSnapshot) return;
    if (onUpdateCues) {
      onUpdateCues(preSyncSnapshot);
    } else {
      preSyncSnapshot.forEach((c) => onUpdateCue(c));
    }
    setPreSyncSnapshot(null);
    setLastSyncResult(null);
    onNotify?.("Đã hoàn tác Auto-Sync về mốc thời gian trước đó.", "info");
  };

  const syncDetailsMap = useMemo(() => {
    const map = new Map<number, CueSyncDetail>();
    if (lastSyncResult?.details) {
      for (const d of lastSyncResult.details) {
        map.set(d.cueId, d);
      }
    }
    return map;
  }, [lastSyncResult]);

  // Analyze selected cues to determine if they are adjacent
  const selectedCuesAnalysis = useMemo(() => {
    if (selectedCueIds.length !== 2) {
      return {
        isAdjacent: false,
        firstCue: null as SubtitleCue | null,
        secondCue: null as SubtitleCue | null,
        firstIndex: -1,
        secondIndex: -1,
      };
    }

    const idx0 = cues.findIndex((c) => c.id === selectedCueIds[0]);
    const idx1 = cues.findIndex((c) => c.id === selectedCueIds[1]);

    if (idx0 === -1 || idx1 === -1) {
      return { isAdjacent: false, firstCue: null, secondCue: null, firstIndex: -1, secondIndex: -1 };
    }

    const firstIndex = Math.min(idx0, idx1);
    const secondIndex = Math.max(idx0, idx1);
    const isAdjacent = secondIndex - firstIndex === 1;

    return {
      isAdjacent,
      firstCue: cues[firstIndex],
      secondCue: cues[secondIndex],
      firstIndex,
      secondIndex,
    };
  }, [cues, selectedCueIds]);

  // Handle merging the two adjacent cues
  const handleMergeSelected = () => {
    if (!selectedCuesAnalysis.isAdjacent || !selectedCuesAnalysis.firstCue || !selectedCuesAnalysis.secondCue) {
      return;
    }

    const { firstCue, secondCue } = selectedCuesAnalysis;
    if (onMergeCues) {
      onMergeCues(firstCue.id, secondCue.id);
    } else {
      const mergedCue: SubtitleCue = {
        ...firstCue,
        end: secondCue.end,
        endTime: secondCue.endTime,
        textVi: `${firstCue.textVi.trim()} ${secondCue.textVi.trim()}`.trim(),
        textOriginal: [firstCue.textOriginal?.trim(), secondCue.textOriginal?.trim()]
          .filter(Boolean)
          .join(" ")
          .trim(),
      };
      onUpdateCue(mergedCue);
      onDeleteCue(secondCue.id);
    }

    setSelectedCueIds([]);
  };

  // Note: Synchronization with video playback is not required.
  // The list position remains completely stable while the user scrolls, reads, or edits cues.
  const filteredCues = cues.filter(
    (c) =>
      c.textVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.textOriginal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Detection for cues with overlapping text, extremely short durations (<0.8s), or overlapping timestamps
  const detectionIssues = useMemo(() => {
    const issues: Array<{
      cueId: number;
      cueIndex: number;
      duration: number;
      isExtremelyShort: boolean;
      hasOverlappingTime: boolean;
      overlapSeconds: number;
      hasOverlappingText: boolean;
      nextCueId?: number;
    }> = [];

    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i];
      const duration = Math.max(0, cue.end - cue.start);
      const isExtremelyShort = duration < 0.75;
      const next = cues[i + 1];

      let hasOverlappingTime = false;
      let overlapSeconds = 0;
      let hasOverlappingText = false;

      if (next) {
        if (cue.end > next.start + 0.05) {
          hasOverlappingTime = true;
          overlapSeconds = Number((cue.end - next.start).toFixed(2));
        }
        const t1 = cue.textVi.trim().toLowerCase();
        const t2 = next.textVi.trim().toLowerCase();
        if (t1 && t2) {
          if (t1 === t2 || (t1.length >= 3 && (t2.startsWith(t1) || t1.endsWith(t2)))) {
            hasOverlappingText = true;
          }
        }
        const orig1 = cue.textOriginal?.trim().toLowerCase();
        const orig2 = next.textOriginal?.trim().toLowerCase();
        if (orig1 && orig2 && orig1 === orig2) {
          hasOverlappingText = true;
        }
      }

      if (isExtremelyShort || hasOverlappingTime || hasOverlappingText) {
        issues.push({
          cueId: cue.id,
          cueIndex: i,
          duration,
          isExtremelyShort,
          hasOverlappingTime,
          overlapSeconds,
          hasOverlappingText,
          nextCueId: next?.id,
        });
      }
    }

    return issues;
  }, [cues]);

  // Merge and clean overlapping text and short cues to significantly improve readability
  const handleAutoMergeAndCleanIssues = () => {
    if (cues.length === 0) return;

    const result: SubtitleCue[] = [];
    let i = 0;

    while (i < cues.length) {
      let current = { ...cues[i] };
      let j = i + 1;

      while (j < cues.length) {
        const next = cues[j];
        const duration = current.end - current.start;
        const isShort = duration < 0.8;
        const overlapsTime = current.end > next.start;

        const t1 = current.textVi.trim();
        const t2 = next.textVi.trim();
        const textMatches =
          t1 &&
          t2 &&
          (t1.toLowerCase() === t2.toLowerCase() ||
            t2.toLowerCase().startsWith(t1.toLowerCase()) ||
            t1.toLowerCase().endsWith(t2.toLowerCase()));

        if (isShort || overlapsTime || textMatches) {
          let mergedVi = t1;
          if (t1.toLowerCase() === t2.toLowerCase()) {
            mergedVi = t1;
          } else if (t2.toLowerCase().startsWith(t1.toLowerCase())) {
            mergedVi = t2;
          } else if (t1.toLowerCase().endsWith(t2.toLowerCase())) {
            mergedVi = t1;
          } else {
            mergedVi = `${t1} ${t2}`;
          }

          let mergedOrig = [current.textOriginal?.trim(), next.textOriginal?.trim()]
            .filter(Boolean)
            .join(" ")
            .trim();
          if (
            current.textOriginal &&
            next.textOriginal &&
            current.textOriginal.trim().toLowerCase() === next.textOriginal.trim().toLowerCase()
          ) {
            mergedOrig = current.textOriginal.trim();
          }

          const newEnd = Math.max(current.end, next.end);
          current = {
            ...current,
            end: newEnd,
            endTime: formatSecondsToSrtTime(newEnd).replace(",", "."),
            textVi: mergedVi,
            textOriginal: mergedOrig,
          };
          j++;
        } else {
          break;
        }
      }

      result.push(current);
      i = j;
    }

    // Ensure strictly chronological non-overlapping timestamps
    for (let k = 0; k < result.length - 1; k++) {
      if (result[k].end > result[k + 1].start) {
        result[k].end = Math.max(result[k].start + 0.3, result[k + 1].start);
        result[k].endTime = formatSecondsToSrtTime(result[k].end).replace(",", ".");
      }
    }

    if (onUpdateCues) {
      onUpdateCues(result);
    }
  };

  const handleTimeAdjust = (cue: SubtitleCue, field: "start" | "end", delta: number) => {
    const newStart = field === "start" ? Math.max(0, Number((cue.start + delta).toFixed(2))) : cue.start;
    const newEnd = field === "end" ? Math.max(newStart + 0.2, Number((cue.end + delta).toFixed(2))) : cue.end;

    onUpdateCue({
      ...cue,
      start: newStart,
      end: newEnd,
      startTime: formatSecondsToSrtTime(newStart).replace(",", "."),
      endTime: formatSecondsToSrtTime(newEnd).replace(",", "."),
    });
  };

  return (
    <div
      id="subtitle-list-container"
      className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl"
    >
      {/* List Header */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/95 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-1.5">
              <span>Danh sách phụ đề</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30">
                {cues.length} câu
              </span>
            </h3>
            <span
              className="hidden xl:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
              title={`Nhấn ${platformInfo.modifierKeyLabel} + Enter để lưu chỉnh sửa`}
            >
              <kbd className="font-mono text-[10px] text-amber-400 font-semibold">{platformInfo.modifierKeyLabel}+Enter</kbd> Lưu
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Auto-Sync Vocal Start/End Button */}
            <div className="flex items-center">
              <button
                id="btn-trigger-auto-sync"
                type="button"
                disabled={isAutoSyncing || cues.length === 0}
                onClick={() => handleRunAutoSync()}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-l-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 transition-all font-semibold disabled:opacity-50"
                title={
                  selectedCueIds.length > 0
                    ? `Phân tích sóng âm và tự động khớp mốc Start/End cho ${selectedCueIds.length} câu đã chọn`
                    : "Phân tích sóng âm giọng nói (VAD) và tự động căn chỉnh mốc Start/End cho phụ đề"
                }
              >
                {isAutoSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>
                  {isAutoSyncing
                    ? `Auto-Sync (${autoSyncPercent}%)`
                    : selectedCueIds.length > 0
                    ? `Auto-Sync (${selectedCueIds.length})`
                    : "Auto-Sync"}
                </span>
              </button>
              <button
                id="btn-toggle-auto-sync-settings"
                type="button"
                onClick={() => setShowAutoSyncPanel((prev) => !prev)}
                className={`px-1.5 py-1.5 rounded-r-lg border-y border-r border-cyan-500/40 text-xs transition-all ${
                  showAutoSyncPanel
                    ? "bg-cyan-600 text-white"
                    : "bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300"
                }`}
                title="Cấu hình thông số thuật toán Auto-Sync giọng nói"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Refine Button */}
            <button
              id="btn-trigger-refine-modal"
              onClick={onOpenRefineModal}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-all font-medium"
              title="AI tối ưu hoá câu chữ, rút gọn hoặc sửa ngữ pháp"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Tối ưu</span>
            </button>

            {/* Smart Merge Engine Button */}
            {onOpenSmartMerge && (
              <button
                id="btn-trigger-smart-merge-modal"
                onClick={onOpenSmartMerge}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-200 border border-emerald-500/40 transition-all font-medium"
                title="Gộp câu thoại thông minh bằng SmartMergeEngine AI"
              >
                <GitMerge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gộp SmartMerge</span>
              </button>
            )}

            {/* Quick Auto Merge Short/Overlapping Subtitles */}
            {detectionIssues.length > 0 && (
              <button
                id="btn-trigger-automerge-issues-top"
                onClick={handleAutoMergeAndCleanIssues}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-all shadow-xs"
                title="Tự động gộp phụ đề quá ngắn hoặc chồng lấn/trùng chữ"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Gộp sub lỗi ({detectionIssues.length})</span>
              </button>
            )}

            {/* Time shift dropdown */}
            <div className="relative">
              <button
                id="btn-toggle-shift-dropdown"
                onClick={() => setShowShiftDropdown(!showShiftDropdown)}
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                title="Lệch mốc thời gian phụ đề (+/- sync)"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lệch giờ</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showShiftDropdown && (
                <div className="absolute right-0 mt-1 w-52 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 text-xs text-slate-200">
                  <div className="font-semibold mb-2 text-white">Dịch chuyển toàn bộ mốc:</div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => {
                        onShiftAllCues(-timeShiftVal);
                        setShowShiftDropdown(false);
                      }}
                      className="flex-1 py-1 px-2 rounded bg-slate-700 hover:bg-slate-600 text-center text-rose-300"
                    >
                      -{timeShiftVal}s
                    </button>
                    <button
                      onClick={() => {
                        onShiftAllCues(timeShiftVal);
                        setShowShiftDropdown(false);
                      }}
                      className="flex-1 py-1 px-2 rounded bg-slate-700 hover:bg-slate-600 text-center text-emerald-300"
                    >
                      +{timeShiftVal}s
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Bước:</span>
                    {[0.1, 0.2, 0.5, 1.0].map((v) => (
                      <button
                        key={v}
                        onClick={() => setTimeShiftVal(v)}
                        className={`px-1.5 py-0.5 rounded ${
                          timeShiftVal === v ? "bg-rose-500 text-white font-bold" : "bg-slate-700/60"
                        }`}
                      >
                        {v}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Merge Selected Cues Button (Header) */}
            {selectedCuesAnalysis.isAdjacent && (
              <button
                id="btn-merge-cues-header"
                onClick={handleMergeSelected}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md active:scale-95 transition-all animate-pulse"
                title={`Gộp câu #${selectedCuesAnalysis.firstIndex + 1} và #${selectedCuesAnalysis.secondIndex + 1}`}
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Gộp (#{selectedCuesAnalysis.firstIndex + 1} & #{selectedCuesAnalysis.secondIndex + 1})</span>
              </button>
            )}

            {/* Auto Detect Speakers / Multi-voice Dubbing Button */}
            {onOpenVoiceoverModal && (
              <button
                id="btn-open-voiceover-toolbar"
                onClick={onOpenVoiceoverModal}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 hover:from-rose-900 hover:to-purple-900 text-rose-300 border border-rose-500/40 font-semibold shadow-sm active:scale-95 transition-all"
                title="Tự động nhận diện giọng nói Nam/Nữ/Già/Trẻ để thuyết minh phụ đề tiếng Việt"
              >
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Phân vai lồng tiếng</span>
              </button>
            )}

            {/* Add Cue Button */}
            <button
              id="btn-add-subtitle-cue"
              onClick={() => onAddCue(currentTime)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md active:scale-95 transition-all"
              title="Thêm phụ đề mới tại thời điểm hiện tại"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm dòng</span>
            </button>
          </div>
        </div>

        {/* Search and Auto-scroll toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-subtitles"
              type="text"
              placeholder="Tìm kiếm nội dung phụ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <button
            id="btn-toggle-select-all-cues"
            type="button"
            onClick={handleToggleSelectAllCues}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              selectedCueIds.length > 0
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title="Chọn hoặc bỏ chọn tất cả câu phụ đề để Auto-Sync"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {selectedCueIds.length === cues.length && cues.length > 0
                ? "Bỏ chọn hết"
                : selectedCueIds.length > 0
                ? `Đã chọn ${selectedCueIds.length}`
                : "Chọn tất cả"}
            </span>
          </button>

          <button
            id="btn-toggle-auto-scroll"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
              autoScroll
                ? "bg-slate-800 text-slate-200 border-slate-700"
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
            title="Tự động cuộn theo video"
          >
            <ArrowDownNarrowWide className={`w-3.5 h-3.5 ${autoScroll ? "text-rose-400" : "text-slate-600"}`} />
            <span className="hidden md:inline">Cuộn tự động</span>
          </button>
        </div>
      </div>

      {/* Auto-Sync Configuration & Vocal Analysis Panel */}
      {showAutoSyncPanel && (
        <div
          id="auto-sync-config-panel"
          className="px-3 sm:px-4 py-3 bg-slate-950 border-b border-cyan-500/30 space-y-2.5 text-xs animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">
                Thuật Toán Auto-Sync Phát Hiện Giọng Nói (Vocal Start/End Alignment)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAutoSyncPanel(false)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              Đóng ✕
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Phân tích dải tần giọng người (300Hz–3400Hz) bằng thuật toán VAD (RMS Energy + Zero-Crossing Rate) để tìm chính xác thời điểm bắt đầu phát âm (Vocal Onset) và kết thúc câu thoại (Vocal Offset).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <label className="block text-[10px] text-slate-400 mb-1">
                Độ nhạy nhận diện giọng (VAD Sensitivity):
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["low", "medium", "high"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSyncSensitivity(lvl)}
                    className={`py-1 rounded text-[11px] font-semibold transition-colors ${
                      syncSensitivity === lvl
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lvl === "low" ? "Thấp" : lvl === "medium" ? "Chuẩn" : "Cao"}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Đệm vào trước giọng (Lead-in):</span>
                <span className="font-mono text-cyan-300 font-bold">{syncLeadInMs}ms</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={10}
                value={syncLeadInMs}
                onChange={(e) => setSyncLeadInMs(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Đệm giữ sau câu (Lead-out):</span>
                <span className="font-mono text-cyan-300 font-bold">{syncLeadOutMs}ms</span>
              </div>
              <input
                type="range"
                min={40}
                max={350}
                step={10}
                value={syncLeadOutMs}
                onChange={(e) => setSyncLeadOutMs(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-slate-400">
              Phạm vi áp dụng:{" "}
              <strong className="text-cyan-300">
                {selectedCueIds.length > 0
                  ? `${selectedCueIds.length} câu phụ đề đang tích chọn`
                  : `Toàn bộ ${cues.length} câu phụ đề`}
              </strong>
            </span>

            <div className="flex items-center gap-2">
              {preSyncSnapshot && (
                <button
                  type="button"
                  onClick={handleUndoAutoSync}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hoàn tác</span>
                </button>
              )}
              <button
                type="button"
                disabled={isAutoSyncing || cues.length === 0}
                onClick={() => handleRunAutoSync()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>
                  {selectedCueIds.length > 0
                    ? `Chạy Auto-Sync Cho ${selectedCueIds.length} Câu Đã Chọn`
                    : `Chạy Auto-Sync Tất Cả (${cues.length} Câu)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Sync Result Summary & Undo Banner */}
      {lastSyncResult && !isAutoSyncing && (
        <div
          id="auto-sync-result-banner"
          className="px-3 sm:px-4 py-2 bg-cyan-950/80 border-b border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-200"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Đã Auto-Sync <strong>{lastSyncResult.alignedCount} câu</strong> khớp điểm bắt đầu/kết thúc giọng nói • Độ chỉnh trung bình:{" "}
              <strong className="font-mono text-white">±{lastSyncResult.averageShiftMs}ms</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {preSyncSnapshot && (
              <button
                type="button"
                onClick={handleUndoAutoSync}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 text-[11px] font-semibold border border-cyan-500/30"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Hoàn tác (Undo)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setLastSyncResult(null)}
              className="text-cyan-400 hover:text-white text-[11px] px-1"
            >
              Ẩn
            </button>
          </div>
        </div>
      )}

      {/* Selection Bar Banner (Supports Auto-Sync for Selected Cues + Merge for 2 Adjacent Cues) */}
      {selectedCueIds.length > 0 && (
        <div id="merge-selection-banner">
          {selectedCuesAnalysis.isAdjacent ? (
            <div className="px-3 sm:px-4 py-2.5 bg-emerald-950/90 border-b border-emerald-500/50 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200 shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                  <GitMerge className="w-4 h-4" />
                </div>
                <div>
                  <span>
                    Đã chọn 2 câu liền kề: <strong className="text-white">#{selectedCuesAnalysis.firstIndex + 1}</strong> và <strong className="text-white">#{selectedCuesAnalysis.secondIndex + 1}</strong>
                  </span>
                  <div className="text-[11px] text-emerald-400/80">
                    Có thể Gộp (Merge) 2 câu hoặc Auto-Sync khớp giọng nói cho 2 câu này.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-auto-sync-selected"
                  type="button"
                  disabled={isAutoSyncing}
                  onClick={() => handleRunAutoSync(selectedCueIds)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
                  title="Tự động khớp mốc bắt đầu/kết thúc giọng nói cho các câu đã chọn"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Auto-Sync (2 câu)</span>
                </button>
                <button
                  id="btn-merge-subtitles"
                  onClick={handleMergeSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
                  title="Gộp 2 câu phụ đề đã chọn"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Gộp 2 câu (Merge)</span>
                </button>
                <button
                  onClick={() => setSelectedCueIds([])}
                  className="text-emerald-300 hover:text-white text-xs px-2 py-1 rounded hover:bg-emerald-900/40"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 sm:px-4 py-2 bg-slate-800/95 border-b border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  Đã chọn <strong className="text-cyan-300">{selectedCueIds.length} câu phụ đề</strong>. Nhấn <strong>Auto-Sync</strong> để tự động căn chỉnh mốc <code className="text-amber-300">start</code> & <code className="text-amber-300">end</code> theo giọng nói.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-auto-sync-selected"
                  type="button"
                  disabled={isAutoSyncing}
                  onClick={() => handleRunAutoSync(selectedCueIds)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition-all"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Auto-Sync ({selectedCueIds.length} câu đã chọn)</span>
                </button>
                <button
                  onClick={() => setSelectedCueIds([])}
                  className="text-slate-400 hover:text-white text-[11px] px-2 py-0.5 rounded hover:bg-slate-700"
                >
                  Hủy chọn
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-Detection & Readability Optimization Banner */}
      {detectionIssues.length > 0 && (
        <div
          id="automerge-issues-banner"
          className="mx-3 my-2 sm:mx-4 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Phát hiện {detectionIssues.length} câu phụ đề cần tối ưu độ đọc</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Khuyến nghị gộp
                </span>
              </div>
              <div className="text-[11px] text-amber-300/80">
                Gồm {detectionIssues.filter((i) => i.isExtremelyShort).length} câu quá ngắn (&lt;0.75s),{" "}
                {detectionIssues.filter((i) => i.hasOverlappingTime).length} câu chồng lấn mốc thời gian,{" "}
                {detectionIssues.filter((i) => i.hasOverlappingText).length} câu trùng văn bản.
              </div>
            </div>
          </div>

          <button
            id="btn-trigger-automerge-issues"
            type="button"
            onClick={handleAutoMergeAndCleanIssues}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Tự động gộp câu ngắn vào câu kế cận và sửa mốc thời gian chồng chéo để tối ưu độ đọc"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Tự động gộp & Sửa lỗi ({detectionIssues.length})</span>
          </button>
        </div>
      )}

      {/* Subtitles Scrollable Area */}
      <div
        ref={scrollContainerRef}
        id="subtitles-cards-list"
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5"
      >
        {filteredCues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center px-4">
            <p className="text-sm mb-2 font-medium">Chưa có đoạn phụ đề nào khớp</p>
            <p className="text-xs text-slate-600">
              Nhấn "Tạo Vietsub bằng AI" trên thanh công cụ hoặc thêm dòng thủ công bằng nút (+) ở góc trên.
            </p>
          </div>
        ) : (
          filteredCues.map((cue, index) => {
            const isActive = currentTime >= cue.start && currentTime <= cue.end;
            const cueIndexInAll = cues.findIndex((c) => c.id === cue.id);
            const isSelected = selectedCueIds.includes(cue.id);
            const singleSelectedId = selectedCueIds.length === 1 ? selectedCueIds[0] : null;
            const singleSelectedIdx = singleSelectedId !== null ? cues.findIndex((c) => c.id === singleSelectedId) : -1;
            const isNeighborOfSelected =
              singleSelectedIdx !== -1 && Math.abs(cueIndexInAll - singleSelectedIdx) === 1;
            const cueIssue = detectionIssues.find((issue) => issue.cueId === cue.id);

            return (
              <div
                key={cue.id}
                ref={isActive ? activeCardRef : null}
                id={`subtitle-card-${cue.id}`}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg"
                    : isActive
                    ? "bg-slate-800/90 border-rose-500/80 shadow-md ring-1 ring-rose-500/40"
                    : isNeighborOfSelected
                    ? "bg-slate-900/90 border-dashed border-emerald-500/50 hover:border-emerald-400"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                {/* Header: Index, Timestamps, Adjust Buttons, Delete */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Checkbox to select cue for merging */}
                    <input
                      type="checkbox"
                      id={`checkbox-select-cue-${cue.id}`}
                      checked={isSelected}
                      onChange={() => handleToggleSelectCue(cue.id)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 accent-emerald-500 cursor-pointer"
                      title={
                        isSelected
                          ? "Bỏ chọn câu này"
                          : isNeighborOfSelected
                          ? "Chọn câu này để gộp với câu đã chọn"
                          : "Tích chọn câu này để gộp"
                      }
                    />

                    <span
                      onClick={() => onSelectCue(cue.start)}
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : isActive
                          ? "bg-rose-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title="Nhấn để phát video từ mốc này"
                    >
                      #{index + 1}
                    </span>

                    {/* Time scrubber controls */}
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      <span
                        onClick={() => onSelectCue(cue.start)}
                        className="hover:text-rose-400 cursor-pointer"
                        title="Bắt đầu"
                      >
                        {formatSecondsToDisplay(cue.start)}
                      </span>
                      <MoveRight className="w-2.5 h-2.5 text-slate-600" />
                      <span
                        onClick={() => onSelectCue(cue.end)}
                        className="hover:text-rose-400 cursor-pointer"
                        title="Kết thúc"
                      >
                        {formatSecondsToDisplay(cue.end)}
                      </span>
                      <span className="text-slate-600 pl-1">
                        ({(cue.end - cue.start).toFixed(1)}s)
                      </span>
                    </div>

                    {isNeighborOfSelected && !isSelected && (
                      <span className="hidden sm:inline-block text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Liền kề
                      </span>
                    )}

                    {/* Synced Delta Indicator */}
                    {syncDetailsMap.has(cue.id) && (
                      <span
                        className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30"
                        title="Đã căn chỉnh mốc Start/End theo giọng nói"
                      >
                        ✓ Synced ({syncDetailsMap.get(cue.id)!.deltaStartMs >= 0 ? "+" : ""}
                        {syncDetailsMap.get(cue.id)!.deltaStartMs}ms)
                      </span>
                    )}

                    {/* Problematic Cue Issue Badges */}
                    {cueIssue && (
                      <div className="flex items-center gap-1">
                        {cueIssue.isExtremelyShort && (
                          <span
                            className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 rounded font-medium"
                            title="Thời lượng quá ngắn (<0.75s) gây khó đọc"
                          >
                            Ngắn ({cueIssue.duration.toFixed(1)}s)
                          </span>
                        )}
                        {cueIssue.hasOverlappingTime && (
                          <span
                            className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-medium"
                            title="Thời gian chồng lấn với câu sau"
                          >
                            Chồng lấn (+{cueIssue.overlapSeconds}s)
                          </span>
                        )}
                        {cueIssue.hasOverlappingText && (
                          <span
                            className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 py-0.2 rounded font-medium"
                            title="Trùng lặp hoặc lặp câu chữ"
                          >
                            Trùng chữ
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Micro nudge buttons, single-cue Auto-Sync, quick merge & delete */}
                  <div className="flex items-center gap-1">
                    {/* Single-cue Auto-Sync vocal button */}
                    <button
                      id={`btn-auto-sync-cue-${cue.id}`}
                      type="button"
                      disabled={isAutoSyncing}
                      onClick={() => handleRunAutoSync([cue.id])}
                      className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      title="Tự động khớp mốc Start/End của câu này theo điểm bắt đầu/kết thúc giọng nói"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick merge shortcut with next cue */}
                    {cueIndexInAll < cues.length - 1 && (
                      <button
                        id={`btn-quick-merge-${cue.id}`}
                        type="button"
                        onClick={() => {
                          const nextCue = cues[cueIndexInAll + 1];
                          if (nextCue) {
                            setSelectedCueIds([cue.id, nextCue.id]);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title={`Chọn gộp câu #${cueIndexInAll + 1} với câu liền kề #${cueIndexInAll + 2}`}
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Time start micro adjustment */}
                    <div className="hidden sm:flex items-center bg-slate-900 rounded border border-slate-800 text-[10px] font-mono">
                      <button
                        onClick={() => handleTimeAdjust(cue, "start", -0.2)}
                        className="px-1 py-0.5 hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Lùi mốc bắt đầu 0.2s"
                      >
                        -0.2s
                      </button>
                      <span className="text-slate-600 px-0.5">|</span>
                      <button
                        onClick={() => handleTimeAdjust(cue, "start", 0.2)}
                        className="px-1 py-0.5 hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Tăng mốc bắt đầu 0.2s"
                      >
                        +0.2s
                      </button>
                    </div>

                    {/* Quick Listen Voiceover for this cue with persona */}
                    <button
                      id={`btn-listen-cue-${cue.id}`}
                      type="button"
                      onClick={() => {
                        if (activePlayingCueId === cue.id) {
                          stopVoicePreview();
                          setActivePlayingCueId(null);
                        } else {
                          setActivePlayingCueId(cue.id);
                          const persona =
                            cue.voicePersona ||
                            (cue.speakerGender === "male"
                              ? cue.speakerAge === "elderly"
                                ? "male_elderly"
                                : "male_young"
                              : cue.speakerAge === "elderly"
                              ? "female_elderly"
                              : "female_young");

                          previewSpeakerPersona(
                            persona,
                            cue.textVi || cue.textOriginal,
                            () => {
                              setActivePlayingCueId(null);
                            }
                          );
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        activePlayingCueId === cue.id
                          ? "text-rose-400 bg-rose-500/20 animate-pulse"
                          : "text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                      }`}
                      title="Nghe thử giọng nhân vật này"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      id={`btn-delete-cue-${cue.id}`}
                      onClick={() => onDeleteCue(cue.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa phụ đề này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Vietnamese Text Input */}
                <div className="space-y-1.5">
                  <div className="relative">
                    <textarea
                      id={`textarea-vietnamese-${cue.id}`}
                      rows={2}
                      value={cue.textVi}
                      onChange={(e) =>
                        onUpdateCue({
                          ...cue,
                          textVi: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          (e.target as HTMLElement).blur();
                          onSaveEdits?.();
                        }
                      }}
                      placeholder="Nhập nội dung phụ đề tiếng Việt..."
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/30 resize-none font-medium"
                    />
                  </div>

                  {/* Spoken original text (optional view & edit) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold w-12 shrink-0">
                      Gốc:
                    </span>
                    <input
                      id={`input-original-${cue.id}`}
                      type="text"
                      value={cue.textOriginal}
                      onChange={(e) =>
                        onUpdateCue({
                          ...cue,
                          textOriginal: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          (e.target as HTMLElement).blur();
                          onSaveEdits?.();
                        }
                      }}
                      placeholder="Lời thoại gốc (tiếng Anh, Nhật,...)"
                      className="flex-1 bg-slate-950/60 border border-slate-800/60 rounded px-2 py-0.5 text-[11px] text-slate-400 focus:text-slate-200 focus:outline-none focus:border-slate-700"
                    />
                  </div>

                  {/* Speaker Persona & Character Role Tag */}
                  {(() => {
                    const persona =
                      cue.voicePersona ||
                      (cue.speakerGender === "male"
                        ? cue.speakerAge === "elderly"
                          ? "male_elderly"
                          : "male_young"
                        : cue.speakerAge === "elderly"
                        ? "female_elderly"
                        : "female_young");
                    const meta = getPersonaInfo(persona);

                    return (
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{meta.icon}</span>
                          <span className="text-slate-400">
                            {cue.speakerRole ? (
                              <strong className="text-slate-200">{cue.speakerRole}</strong>
                            ) : (
                              "Nhân vật"
                            )}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${meta.bgBadge}`}
                          >
                            {meta.shortLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 text-[10px] hidden sm:inline">Chất giọng:</span>
                          <select
                            value={persona}
                            onChange={(e) => {
                              const newPersona = e.target.value as SpeakerVoicePersona;
                              onUpdateCue({
                                ...cue,
                                voicePersona: newPersona,
                              });
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
                          >
                            {(Object.keys(SPEAKER_PERSONAS) as SpeakerVoicePersona[]).map((pKey) => {
                              const pMeta = SPEAKER_PERSONAS[pKey];
                              return (
                                <option key={pKey} value={pKey}>
                                  {pMeta.icon} {pMeta.shortLabel}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
