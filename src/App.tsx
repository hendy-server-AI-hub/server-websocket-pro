// =============================================================================
// 🏛️ HENDY STUDIO PRO - BỘ ĐIỀU KHIỂN GIAO DIỆN TRUNG TÂM (/src/App.tsx)
// Ngôn ngữ hiển thị: Tiếng Việt (100%)
// Kiến trúc mô-đun hóa:
//   • /studio-web/ : Quản lý toàn bộ Bàn dựng Video, Thanh tác vụ nhanh,
//                    Ngăn công cụ chuyên sâu và Hệ thống 29 Hộp thoại AI.
//   • /admin-web/  : Quản lý Cổng Quản trị Hệ thống (Tầng 0) & Chế độ Bảo trì.
// Chỉ cần chỉnh sửa mã nguồn trong /studio-web/ hoặc /admin-web/, hệ thống sẽ
// tự động cập nhật và đồng bộ hóa toàn bộ tệp liên quan.
// =============================================================================

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { VideoPlayerHandle } from "./components/VideoPlayer";
import { WorkspaceRouteId } from "./components/StudioHomePage";
import { WorkspaceRouter } from "./workspace-router";
import { onAuthUserChanged } from "./services/firebase";
import { SAMPLE_VIDEOS } from "./data/sampleVideos";
import {
  SubtitleCue,
  SubtitleStyle,
  GenerationConfig,
  SampleVideo,
  AudioEditConfig,
  VoiceoverConfig,
} from "./types";
import { extractAudioFromVideo } from "./utils/audioExtractor";
import { parseSRT } from "./utils/subtitleFormatters";
import { useGlobalShortcuts } from "./hooks/useGlobalShortcuts";
import { useDeviceOptimization } from "./hooks/useDeviceOptimization";

// Liên kết trực tiếp từ thư mục trung tâm /hendy-Admini, /studio-web và /admin-web (được đồng bộ tự động)
import {
  ResponsiveViewportShell,
  DEFAULT_SUBTITLE_STYLE_VI,
  DEFAULT_AUDIO_CONFIG_VI,
  DEFAULT_VOICEOVER_CONFIG_VI,
  INITIAL_STUDIO_MODAL_STATE,
  StudioModalStateMap,
  StudioEditorLayout,
  StudioToolsDrawer,
  StudioModalsContainer,
  AdminPortalGateway,
} from "./generated/workspace-registry";

export const App: React.FC = () => {
  const platformInfo = useDeviceOptimization();

  // ===========================================================================
  // 1. TRẠNG THÁI VIDEO, ÂM THANH & DANH SÁCH PHỤ ĐỀ (CORE MEDIA STATE)
  // ===========================================================================
  const defaultSample = SAMPLE_VIDEOS[0];
  const [videoUrl, setVideoUrl] = useState<string>(defaultSample.videoUrl);
  const [videoTitle, setVideoTitle] = useState<string>(defaultSample.title);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [cues, setCues] = useState<SubtitleCue[]>(
    defaultSample.initialCues || []
  );
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(38);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const srtInputRef = useRef<HTMLInputElement>(null);

  // Cấu hình kiểu phụ đề, lọc âm & thuyết minh đa giọng đọc
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>(
    DEFAULT_SUBTITLE_STYLE_VI
  );
  const [audioConfig, setAudioConfig] = useState<AudioEditConfig>(
    DEFAULT_AUDIO_CONFIG_VI
  );
  const [voiceoverConfig, setVoiceoverConfig] = useState<VoiceoverConfig>(
    DEFAULT_VOICEOVER_CONFIG_VI
  );

  // ===========================================================================
  // 2. QUẢN LÝ HỘP THOẠI TẬP TRUNG (CENTRALIZED MODAL REGISTRY)
  // ===========================================================================
  const [modals, setModals] = useState<StudioModalStateMap>(
    INITIAL_STUDIO_MODAL_STATE
  );

  const setModalOpen = useCallback(
    (modalKey: keyof StudioModalStateMap, isOpen: boolean) => {
      setModals((prev) => ({ ...prev, [modalKey]: isOpen }));
    },
    []
  );

  const openModal = useCallback((modalKey: keyof StudioModalStateMap) => {
    setModals((prev) => ({ ...prev, [modalKey]: true }));
  }, []);

  // Trạng thái ngăn kéo công cụ dọc
  const [isVerticalDrawerOpen, setIsVerticalDrawerOpen] = useState(false);

  // ===========================================================================
  // 3. TÀI KHOẢN NGƯỜI DÙNG & ĐIỀU HƯỚNG KHÔNG GIAN LÀM VIỆC (ROUTING & AUTH)
  // ===========================================================================
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("vietsub_studio_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const unsub = onAuthUserChanged((user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const [isMaintenanceView, setIsMaintenanceView] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("view") === "maintenance";
    }
    return false;
  });

  const [currentView, setCurrentView] = useState<
    "home" | "studio" | "admin_portal"
  >(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get("view") === "admin" ||
        params.get("view") === "admin_portal" ||
        params.get("role") === "dev"
      ) {
        return "admin_portal";
      }
      if (params.get("view") === "studio" || params.get("app") === "editor") {
        return "studio";
      }
    }
    return "home";
  });

  const [requestedWorkspaceRoute, setRequestedWorkspaceRoute] =
    useState<WorkspaceRouteId>(() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("view") === "studio" || params.get("app") === "editor") {
          return "Studio";
        }
        if (params.get("view") === "telegram") {
          return "TelegramBot";
        }
        if (
          params.get("view") === "admin" ||
          params.get("view") === "docker_ktor"
        ) {
          return "DockerKtor";
        }
      }
      return "Home";
    });

  const isHomeRoute = requestedWorkspaceRoute === "Home";
  const isStudioRoute = requestedWorkspaceRoute === "Studio";
  const isTelegramRoute = requestedWorkspaceRoute === "TelegramBot";
  const isAdminWorkspaceRoute = requestedWorkspaceRoute === "DockerKtor";

  // ===========================================================================
  // 4. CHẾ ĐỘ BỐ CỤC ĐÁP ỨNG (RESPONSIVE LAYOUT MODE: TỰ ĐỘNG / PC / MOBILE)
  // ===========================================================================
  const [layoutMode, setLayoutMode] = useState<"auto" | "pc" | "mobile">(() => {
    try {
      const saved = localStorage.getItem("vietsub_layout_mode");
      if (saved === "pc" || saved === "mobile" || saved === "auto") return saved;
    } catch {}
    return "auto";
  });

  const handleChangeLayoutMode = (mode: "auto" | "pc" | "mobile") => {
    setLayoutMode(mode);
    try {
      localStorage.setItem("vietsub_layout_mode", mode);
    } catch {}
  };

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isCompactLayout =
    layoutMode === "mobile" ||
    (layoutMode === "auto" && (windowWidth < 1024 || platformInfo.isMobile));

  const [mobileActiveTab, setMobileActiveTab] = useState<
    "video" | "subtitles" | "both"
  >("video");

  // ===========================================================================
  // 5. TRẠNG THÁI XỬ LÝ AI & THÔNG BÁO NHANH (AI PROGRESS & TOAST)
  // ===========================================================================
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback(
    (text: string, type: "success" | "error" | "info" = "success") => {
      setToastMessage({ text, type });
      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    },
    []
  );

  const handleSaveEdits = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    showToast("Đã lưu chỉnh sửa phụ đề (Ctrl + Enter)!", "success");
  }, [showToast]);

  // Kích hoạt hệ thống phím tắt toàn cục
  useGlobalShortcuts({
    onTogglePlay: () => videoPlayerRef.current?.togglePlay(),
    onSeekRelative: (delta) => videoPlayerRef.current?.seekRelative(delta),
    onSaveEdits: handleSaveEdits,
    onToggleShortcutsModal: () =>
      setModals((prev) => ({ ...prev, shortcuts: !prev.shortcuts })),
    onToggleMute: () => videoPlayerRef.current?.toggleMute(),
    onToggleSubtitles: () => videoPlayerRef.current?.toggleSubtitles(),
    enabled:
      !modals.generate &&
      !modals.refine &&
      !modals.style &&
      !modals.export &&
      !modals.sample &&
      !modals.cover &&
      !modals.capcut &&
      !modals.webDrama,
  });

  // ===========================================================================
  // 6. CÁC HÀM XỬ LÝ TỆP, DỊCH THUẬT AI & BIÊN TẬP PHỤ ĐỀ (HANDLERS)
  // ===========================================================================
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
    setCurrentFile(file);
    setCurrentTime(0);
    showToast(
      `Đã tải lên video "${file.name}". Nhấn "Tạo Vietsub AI" để phiên dịch phụ đề!`,
      "info"
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      setCurrentFile(file);
      setCurrentTime(0);
      showToast(`Đã tải lên video "${file.name}"!`, "info");
    }
  };

  const handleSelectSample = (sample: SampleVideo) => {
    setVideoUrl(sample.videoUrl);
    setVideoTitle(sample.title);
    setCurrentFile(null);
    setCues(sample.initialCues || []);
    setCurrentTime(0);
    showToast(`Đã tải video mẫu: ${sample.title}`, "success");
  };

  const handleImportSrt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseSRT(text);
        if (parsed.length > 0) {
          setCues(parsed);
          showToast(
            `Đã nhập thành công ${parsed.length} câu phụ đề từ tệp!`,
            "success"
          );
        } else {
          showToast("Không tìm thấy mốc phụ đề hợp lệ trong tệp SRT.", "error");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateVietsub = async (config: GenerationConfig) => {
    setGenerationError(null);
    setIsProcessing(true);
    setProgressStep("Đang chuẩn bị âm thanh video...");
    setProgressPercent(10);

    try {
      let audioBase64 = "";
      let mimeType = "audio/wav";

      if (currentFile) {
        const extracted = await extractAudioFromVideo(
          currentFile,
          (pct, msg) => {
            setProgressPercent(Math.round(pct * 0.5));
            setProgressStep(msg);
          }
        );
        audioBase64 = extracted.base64;
        mimeType = extracted.mimeType;
      } else {
        setProgressStep("Đang tải tệp video mẫu để xử lý...");
        setProgressPercent(20);
        const res = await fetch(videoUrl);
        const blob = await res.blob();
        const extracted = await extractAudioFromVideo(blob, (pct, msg) => {
          setProgressPercent(20 + Math.round(pct * 0.35));
          setProgressStep(msg);
        });
        audioBase64 = extracted.base64;
        mimeType = extracted.mimeType;
      }

      setProgressStep(
        "Đang phân tích âm thanh & dịch phụ đề với Gemini AI..."
      );
      setProgressPercent(65);

      const response = await fetch("/api/vietsub/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          sourceLang: config.sourceLang,
          targetLang: config.targetLang,
          style: config.style,
          maxCharsPerLine: config.maxCharsPerLine,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể tạo phụ đề từ Gemini API.");
      }

      if (data.cues && Array.isArray(data.cues)) {
        setCues(data.cues);
        setProgressPercent(100);
        setGenerationError(null);
        setModalOpen("generate", false);
        const langInfo = data.targetLanguage
          ? `${data.detectedLanguage} ➔ ${data.targetLanguage}`
          : data.detectedLanguage;
        showToast(
          `Tạo thành công ${data.cues.length} câu phụ đề! (${langInfo})`,
          "success"
        );
      } else {
        throw new Error("Dữ liệu phụ đề trả về không hợp lệ.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Đã có lỗi khi tạo Vietsub bằng AI.";
      setGenerationError(msg);
      showToast(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefineSubtitles = async (instruction: string) => {
    if (cues.length === 0) {
      showToast("Chưa có phụ đề để tối ưu.", "error");
      return;
    }

    setIsRefining(true);
    try {
      const response = await fetch("/api/vietsub/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cues,
          instruction,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Lỗi khi hiệu đính phụ đề.");
      }

      if (data.cues && Array.isArray(data.cues)) {
        setCues(data.cues);
        setModalOpen("refine", false);
        showToast(
          "Đã áp dụng tối ưu AI cho toàn bộ phụ đề thành công!",
          "success"
        );
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Lỗi khi tối ưu hóa câu chữ.", "error");
    } finally {
      setIsRefining(false);
    }
  };

  const handleUpdateCue = (updated: SubtitleCue) => {
    setCues((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCue = (id: number) => {
    setCues((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddCue = (atTime?: number) => {
    const start = atTime !== undefined ? Number(atTime.toFixed(2)) : 0;
    const end = Number((start + 2.5).toFixed(2));
    const newId =
      cues.length > 0 ? Math.max(...cues.map((c) => c.id)) + 1 : 1;

    const newCue: SubtitleCue = {
      id: newId,
      start,
      end,
      startTime: `00:00:${Math.floor(start)}.000`,
      endTime: `00:00:${Math.floor(end)}.000`,
      textOriginal: "",
      textVi: "Dòng phụ đề mới",
    };

    const updated = [...cues, newCue].sort((a, b) => a.start - b.start);
    setCues(updated);
  };

  const handleShiftAllCues = (offset: number) => {
    setCues((prev) =>
      prev.map((c) => {
        const newStart = Math.max(0, Number((c.start + offset).toFixed(2)));
        const newEnd = Math.max(
          newStart + 0.3,
          Number((c.end + offset).toFixed(2))
        );
        return {
          ...c,
          start: newStart,
          end: newEnd,
        };
      })
    );
    showToast(
      `Đã dịch chuyển thời gian phụ đề ${offset > 0 ? `+${offset}` : offset}s`,
      "info"
    );
  };

  const handleMergeCues = (firstCueId: number, secondCueId: number) => {
    setCues((prev) => {
      const idx1 = prev.findIndex((c) => c.id === firstCueId);
      const idx2 = prev.findIndex((c) => c.id === secondCueId);
      if (idx1 === -1 || idx2 === -1) return prev;

      const firstIndex = Math.min(idx1, idx2);
      const secondIndex = Math.max(idx1, idx2);
      const firstCue = prev[firstIndex];
      const secondCue = prev[secondIndex];

      const mergedCue: SubtitleCue = {
        ...firstCue,
        end: secondCue.end,
        endTime: secondCue.endTime,
        textVi: `${firstCue.textVi.trim()} ${secondCue.textVi.trim()}`.trim(),
        textOriginal: [
          firstCue.textOriginal?.trim(),
          secondCue.textOriginal?.trim(),
        ]
          .filter(Boolean)
          .join(" ")
          .trim(),
      };

      const nextCues = [...prev];
      nextCues.splice(secondIndex, 1);
      nextCues[firstIndex] = mergedCue;
      return nextCues;
    });

    showToast("Đã gộp thành công 2 câu phụ đề liền kề!", "success");
  };

  // ===========================================================================
  // 7. ĐIỀU HƯỚNG CỔNG QUẢN TRỊ & BẢO TRÌ (/admin-web)
  // ===========================================================================
  if (isMaintenanceView) {
    return (
      <AdminPortalGateway
        mode="maintenance"
        currentUser={currentUser}
        onExitMaintenance={() => {
          setIsMaintenanceView(false);
          const url = new URL(window.location.href);
          url.searchParams.delete("view");
          window.history.pushState({}, "", url.toString());
        }}
        onNavigateToStudio={() => {
          setRequestedWorkspaceRoute("Studio");
          setCurrentView("studio");
        }}
        onNavigateToHome={() => {
          setRequestedWorkspaceRoute("Home");
          setCurrentView("home");
        }}
        onSetRequestedWorkspaceRoute={setRequestedWorkspaceRoute}
        onNotify={showToast}
      />
    );
  }

  if (currentView === "admin_portal" && isAdminWorkspaceRoute) {
    return (
      <AdminPortalGateway
        mode="admin_portal"
        currentUser={currentUser}
        onExitMaintenance={() => setIsMaintenanceView(false)}
        onNavigateToStudio={() => {
          setRequestedWorkspaceRoute("Studio");
          setCurrentView("studio");
        }}
        onNavigateToHome={() => {
          setRequestedWorkspaceRoute("Home");
          setCurrentView("home");
        }}
        onSetRequestedWorkspaceRoute={setRequestedWorkspaceRoute}
        onNotify={showToast}
      />
    );
  }

  // ===========================================================================
  // 8. GIAO DIỆN CHÍNH ĐÃ TÁI CẤU TRÚC (/hendy-Admini, /studio-web & WorkspaceRouter)
  // ===========================================================================
  return (
    <ResponsiveViewportShell>
      <div
        id="app-root-container"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="min-h-[100dvh] w-full max-w-full min-w-0 overflow-x-hidden bg-[#090B10] text-slate-100 flex flex-col selection:bg-cyan-400 selection:text-slate-950"
      >
      {/* Bộ chọn tệp ẩn cho Tải Video và Nhập .SRT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <input
        ref={srtInputRef}
        type="file"
        accept=".srt,.vtt,.txt"
        onChange={handleImportSrt}
        className="hidden"
      />

      {/* Ngăn Công Cụ Chuyên Sâu (Từ thư mục /studio-web) */}
      <StudioToolsDrawer
        isOpen={isVerticalDrawerOpen && isStudioRoute}
        onClose={() => setIsVerticalDrawerOpen(false)}
        onOpenModal={openModal}
        onTriggerVideoUpload={() => fileInputRef.current?.click()}
        onTriggerSrtImport={() => srtInputRef.current?.click()}
        currentUser={currentUser}
        isAdminWorkspaceRoute={isAdminWorkspaceRoute}
        onOpenAdminPortal={() => setCurrentView("admin_portal")}
      />

      {/* Bảng Thông Báo Trạng Thái Nhanh (Toast) */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-xl border flex items-center gap-2.5 backdrop-blur-md ${
              toastMessage.type === "error"
                ? "bg-rose-950/90 border-rose-700 text-rose-200"
                : toastMessage.type === "info"
                ? "bg-blue-950/90 border-blue-700 text-blue-200"
                : "bg-emerald-950/90 border-emerald-700 text-emerald-200"
            }`}
          >
            {toastMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Bộ Định Tuyến Không Gian Làm Việc (Trang Chủ / Bàn Dựng Studio / Cổng Quản Trị) */}
      <WorkspaceRouter
        initialView={currentView === "studio" ? "Studio" : "Home"}
        requestedView={requestedWorkspaceRoute}
        onViewChange={(view) => {
          setRequestedWorkspaceRoute(view);
          setCurrentView(view === "Home" ? "home" : "studio");
        }}
        cues={cues}
        onUpdateCues={setCues}
        videoTitle={videoTitle}
        isVoiceoverEnabled={voiceoverConfig.enabled}
        onToggleVoiceover={(enabled) =>
          setVoiceoverConfig((prev) => ({ ...prev, enabled }))
        }
        canExport={cues.length > 0}
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenExportModal={() => openModal("export")}
        onOpenStyleModal={() => openModal("style")}
        onOpenVoiceoverModal={() => openModal("autoVoiceover")}
        onOpenUniversalTranslatorModal={() => openModal("universalTranslator")}
        onOpenSocialImportModal={() => openModal("socialImport")}
        onOpenCapCutModal={() => openModal("capcut")}
        onOpenBookmarkletModal={() => openModal("bookmarklet")}
        onOpenDownloadModal={() => openModal("appDownload")}
        onOpenSampleVideosModal={() => {
          setRequestedWorkspaceRoute("Studio");
          openModal("sample");
        }}
        onOpenImageTranslatorModal={() => openModal("imageTextTranslator")}
        onOpenAuthModal={() => openModal("auth")}
        onOpenAdminPortal={() => setCurrentView("admin_portal")}
        onOpenPipelineConsole={() => openModal("telegramPipeline")}
        onNotify={showToast}
        platformInfo={platformInfo}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        studioEditorContent={
          <StudioEditorLayout
            videoPlayerRef={videoPlayerRef}
            videoUrl={videoUrl}
            videoTitle={videoTitle}
            currentFile={currentFile}
            cues={cues}
            currentTime={currentTime}
            videoDuration={videoDuration}
            isVideoPlaying={isVideoPlaying}
            subtitleStyle={subtitleStyle}
            audioConfig={audioConfig}
            voiceoverConfig={voiceoverConfig}
            isCompactLayout={isCompactLayout}
            layoutMode={layoutMode}
            onChangeLayoutMode={handleChangeLayoutMode}
            mobileActiveTab={mobileActiveTab}
            onChangeMobileActiveTab={setMobileActiveTab}
            onTimeUpdate={setCurrentTime}
            onSeek={setCurrentTime}
            onPlayStateChange={setIsVideoPlaying}
            onUpdateCue={handleUpdateCue}
            onUpdateCues={setCues}
            onDeleteCue={handleDeleteCue}
            onAddCue={handleAddCue}
            onShiftAllCues={handleShiftAllCues}
            onMergeCues={handleMergeCues}
            onSaveEdits={handleSaveEdits}
            onOpenModal={openModal}
            onTriggerVideoUpload={() => fileInputRef.current?.click()}
            onTriggerSrtImport={() => srtInputRef.current?.click()}
            onOpenDrawer={() => setIsVerticalDrawerOpen(true)}
            onNotify={showToast}
          />
        }
      />

      {/* Hệ Thống 29 Hộp Thoại Chức Năng Tập Trung (Từ thư mục /studio-web) */}
      <StudioModalsContainer
        modals={modals}
        onSetModal={setModalOpen}
        cues={cues}
        onSetCues={setCues}
        videoUrl={videoUrl}
        onSetVideoUrl={setVideoUrl}
        videoTitle={videoTitle}
        onSetVideoTitle={setVideoTitle}
        onSetVideoDuration={setVideoDuration}
        currentTime={currentTime}
        onSetCurrentTime={setCurrentTime}
        subtitleStyle={subtitleStyle}
        onSetSubtitleStyle={setSubtitleStyle}
        audioConfig={audioConfig}
        onSetAudioConfig={setAudioConfig}
        voiceoverConfig={voiceoverConfig}
        onSetVoiceoverConfig={setVoiceoverConfig}
        isProcessing={isProcessing}
        progressStep={progressStep}
        progressPercent={progressPercent}
        generationError={generationError}
        onClearGenerationError={() => setGenerationError(null)}
        isRefining={isRefining}
        onGenerateVietsub={handleGenerateVietsub}
        onRefineSubtitles={handleRefineSubtitles}
        onSelectSample={handleSelectSample}
        isHomeRoute={isHomeRoute}
        isTelegramRoute={isTelegramRoute}
        isAdminWorkspaceRoute={isAdminWorkspaceRoute}
        onSetRequestedWorkspaceRoute={setRequestedWorkspaceRoute}
        onSetIsMaintenanceView={setIsMaintenanceView}
        onOpenAdminPortal={() => setCurrentView("admin_portal")}
        detectedOS={platformInfo.os}
        currentUser={currentUser}
        onSetCurrentUser={setCurrentUser}
        onNotify={showToast}
      />
      </div>
    </ResponsiveViewportShell>
  );
};

export default App;
