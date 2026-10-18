import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Scissors,
  Home,
  Upload,
  Download,
  ChevronRight,
  Network,
  FileCode2,
} from "lucide-react";
import { StudioHomePage, WorkspaceRouteId } from "./components/StudioHomePage";
import { StudioWorkspace } from "./workspaces/Studio";
import { SubtitleCue } from "./types";
import { PlatformInfo } from "./utils/universalPlatformAdapter";
import { I18nProvider, SUPPORTED_LOCALES, useI18n } from "./utils/i18n";
import {
  checkIsAuthorizedAdmin,
  DEFAULT_ADMIN_USER,
} from "./context/CurrentUserContext";
import {
  DedicatedAdminSubRoute,
  DEFAULT_NETWORK_POLICY,
  detectInitialNetworkMode,
  navigateNetworkPortal,
  NetworkPortalMode,
  subscribeNetworkPortalChange,
} from "./config/adminNetworkConfig";
import { DedicatedAdminRouter } from "./admin-router";

export type ActiveWorkspaceType = "Studio" | "TelegramBot" | "DockerKtor";

export interface WorkspaceRouteContextValue {
  /** Currently active workspace route ('Home' | 'Studio' | 'TelegramBot' | 'DockerKtor') */
  activeWorkspace: WorkspaceRouteId;
  /** Switch to a target workspace route */
  navigateToWorkspace: (workspace: WorkspaceRouteId) => void;
  /** Check whether a specific workspace route is currently active */
  isWorkspaceActive: (workspace: WorkspaceRouteId) => boolean;
  /** True only when the Dedicated Administrator Gateway is active */
  isAdminWorkspaceActive: boolean;
  /** True when the Service Center & VIP Repository is active inside the Admin Gateway */
  isTelegramWorkspaceActive: boolean;
  /** True only when the 'Studio' workspace route is active */
  isStudioWorkspaceActive: boolean;
  /** True when on the 'Home' commercial interface */
  isHomeRouteActive: boolean;
  /** RBAC Guardrail state */
  isRbacAdminAuthorized: boolean;
  /** Active Network Portal Mode ('commercial' | 'admin_dedicated') */
  networkPortalMode: NetworkPortalMode;
  /** Open the Dedicated Administrator Router (admin.vietsubpro.studio / 10.240.0.10:8443) */
  openDedicatedAdminRouter: (subRoute?: DedicatedAdminSubRoute) => void;
}

const WorkspaceRouteContext = createContext<WorkspaceRouteContextValue>({
  activeWorkspace: "Home",
  navigateToWorkspace: () => {},
  isWorkspaceActive: (ws) => ws === "Home",
  isAdminWorkspaceActive: false,
  isTelegramWorkspaceActive: false,
  isStudioWorkspaceActive: false,
  isHomeRouteActive: true,
  isRbacAdminAuthorized: true,
  networkPortalMode: "commercial",
  openDedicatedAdminRouter: () => {},
});

export const useWorkspaceRoute = (): WorkspaceRouteContextValue =>
  useContext(WorkspaceRouteContext);

export interface WorkspaceRouterProps {
  /** Initial view: 'Home' commercial storefront or one of the workspaces */
  initialView?: WorkspaceRouteId;
  /** Optional external view trigger */
  requestedView?: WorkspaceRouteId | null;
  onViewChange?: (view: WorkspaceRouteId) => void;
  /** Studio Workspace content & handlers */
  studioEditorContent: React.ReactNode;
  cues: SubtitleCue[];
  onUpdateCues: (cues: SubtitleCue[]) => void;
  videoTitle?: string;
  isVoiceoverEnabled: boolean;
  onToggleVoiceover: (enabled: boolean) => void;
  canExport?: boolean;
  onUploadClick?: () => void;
  onOpenExportModal: () => void;
  onOpenStyleModal: () => void;
  onOpenVoiceoverModal: () => void;
  onOpenUniversalTranslatorModal: () => void;
  onOpenSocialImportModal?: () => void;
  onOpenCapCutModal: () => void;
  onOpenBookmarkletModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenSampleVideosModal: () => void;
  onOpenImageTranslatorModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAdminPortal?: () => void;
  onOpenPipelineConsole?: () => void;
  onNotify?: (msg: string, type?: "success" | "error" | "info") => void;
  platformInfo: PlatformInfo;
  currentUser: any;
  onUserChange?: (user: any) => void;
}

const WorkspaceRouterInner: React.FC<WorkspaceRouterProps> = ({
  initialView = "Home",
  requestedView,
  onViewChange,
  studioEditorContent,
  cues,
  onUpdateCues,
  videoTitle,
  isVoiceoverEnabled,
  onToggleVoiceover,
  canExport = true,
  onUploadClick,
  onOpenExportModal,
  onOpenStyleModal,
  onOpenVoiceoverModal,
  onOpenUniversalTranslatorModal,
  onOpenSocialImportModal,
  onOpenCapCutModal,
  onOpenBookmarkletModal,
  onOpenDownloadModal,
  onOpenSampleVideosModal,
  onOpenImageTranslatorModal,
  onOpenAuthModal,
  onOpenPipelineConsole,
  onNotify,
  platformInfo,
  currentUser,
  onUserChange,
}) => {
  const { locale, setLocale, t } = useI18n();

  const initialNetwork = detectInitialNetworkMode();
  const [networkPortalMode, setNetworkPortalMode] = useState<NetworkPortalMode>(
    initialView === "DockerKtor" || initialView === "TelegramBot"
      ? "admin_dedicated"
      : initialNetwork.mode
  );
  const [adminSubRoute, setAdminSubRoute] = useState<DedicatedAdminSubRoute>(
    initialView === "TelegramBot"
      ? "telegram-ops"
      : initialNetwork.subRoute || "network-gateway"
  );

  // Commercial workspace routing state ('Home' | 'Studio')
  // Note: 'TelegramBot' (Service Center & VIP Repository) and 'DockerKtor' are accessible exclusively via the Admin Gateway.
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceRouteId>(
    initialView === "DockerKtor" || initialView === "TelegramBot"
      ? "DockerKtor"
      : initialView
  );

  const isRbacAdminAuthorized = checkIsAuthorizedAdmin(
    currentUser || DEFAULT_ADMIN_USER
  );

  useEffect(() => {
    const unsub = subscribeNetworkPortalChange(({ mode, subRoute }) => {
      setNetworkPortalMode(mode);
      setAdminSubRoute(subRoute);
      if (mode === "admin_dedicated") {
        setCurrentWorkspace(
          subRoute === "telegram-ops" ? "TelegramBot" : "DockerKtor"
        );
        onViewChange?.(
          subRoute === "telegram-ops" ? "TelegramBot" : "DockerKtor"
        );
      } else if (
        currentWorkspace === "DockerKtor" ||
        currentWorkspace === "TelegramBot"
      ) {
        setCurrentWorkspace("Home");
        onViewChange?.("Home");
      }
    });
    return () => unsub();
  }, [currentWorkspace]);

  useEffect(() => {
    if (requestedView && requestedView !== currentWorkspace) {
      if (requestedView === "DockerKtor") {
        setNetworkPortalMode("admin_dedicated");
        setAdminSubRoute("network-gateway");
        setCurrentWorkspace("DockerKtor");
        navigateNetworkPortal("admin_dedicated", "network-gateway");
      } else if (requestedView === "TelegramBot") {
        // Service Center & VIP Repository is accessible exclusively via the Admin Gateway
        setNetworkPortalMode("admin_dedicated");
        setAdminSubRoute("telegram-ops");
        setCurrentWorkspace("TelegramBot");
        navigateNetworkPortal("admin_dedicated", "telegram-ops");
      } else {
        setNetworkPortalMode("commercial");
        setCurrentWorkspace(requestedView);
      }
    }
  }, [requestedView]);

  const handleOpenDedicatedAdminRouter = (
    subRoute: DedicatedAdminSubRoute = "network-gateway"
  ) => {
    setNetworkPortalMode("admin_dedicated");
    setAdminSubRoute(subRoute);
    setCurrentWorkspace(
      subRoute === "telegram-ops" ? "TelegramBot" : "DockerKtor"
    );
    navigateNetworkPortal("admin_dedicated", subRoute);
    onViewChange?.(subRoute === "telegram-ops" ? "TelegramBot" : "DockerKtor");
  };

  const handleReturnToCommercialStorefront = () => {
    setNetworkPortalMode("commercial");
    setCurrentWorkspace("Home");
    navigateNetworkPortal("commercial");
    onViewChange?.("Home");
  };

  const handleSwitchWorkspace = (target: WorkspaceRouteId) => {
    if (target === "DockerKtor") {
      handleOpenDedicatedAdminRouter("network-gateway");
      return;
    }
    if (target === "TelegramBot") {
      // Exclusively route Service Center & VIP Repository via the Admin Gateway
      handleOpenDedicatedAdminRouter("telegram-ops");
      return;
    }
    setNetworkPortalMode("commercial");
    setCurrentWorkspace(target);
    onViewChange?.(target);
  };

  const isDedicatedAdminActive =
    networkPortalMode === "admin_dedicated" ||
    currentWorkspace === "DockerKtor" ||
    currentWorkspace === "TelegramBot";

  const routeContextValue: WorkspaceRouteContextValue = {
    activeWorkspace: isDedicatedAdminActive
      ? adminSubRoute === "telegram-ops"
        ? "TelegramBot"
        : "DockerKtor"
      : currentWorkspace,
    navigateToWorkspace: handleSwitchWorkspace,
    isWorkspaceActive: (ws: WorkspaceRouteId) =>
      isDedicatedAdminActive
        ? ws === "DockerKtor" ||
          (ws === "TelegramBot" && adminSubRoute === "telegram-ops")
        : currentWorkspace === ws,
    isAdminWorkspaceActive: isDedicatedAdminActive,
    isTelegramWorkspaceActive:
      isDedicatedAdminActive && adminSubRoute === "telegram-ops",
    isStudioWorkspaceActive:
      !isDedicatedAdminActive && currentWorkspace === "Studio",
    isHomeRouteActive: !isDedicatedAdminActive && currentWorkspace === "Home",
    isRbacAdminAuthorized,
    networkPortalMode: isDedicatedAdminActive
      ? "admin_dedicated"
      : "commercial",
    openDedicatedAdminRouter: handleOpenDedicatedAdminRouter,
  };

  return (
    <WorkspaceRouteContext.Provider value={routeContextValue}>
      {/* =================================================================== */}
      {/* A. DEDICATED ADMINISTRATOR GATEWAY (admin.vietsubpro.studio / IP)   */}
      {/* Exclusively hosts:                                                  */}
      {/* 1. Domain, Static IP & CIDR Firewall (/admin-console/network-gateway)*/}
      {/* 2. Cross-Platform UI & Build Studio (/admin-console/cross-platform) */}
      {/* 3. Service Center & VIP Repository (/admin-console/telegram-ops)    */}
      {/* 4. Docker · Ktor · PostgreSQL (/admin-console/infrastructure)       */}
      {/* =================================================================== */}
      {isDedicatedAdminActive ? (
        <DedicatedAdminRouter
          initialSubRoute={adminSubRoute}
          currentUser={currentUser}
          onUserChange={onUserChange}
          onReturnToCommercialStorefront={handleReturnToCommercialStorefront}
          onOpenDownloadModal={onOpenDownloadModal}
          onOpenPipelineConsole={onOpenPipelineConsole}
          onNotify={onNotify}
        />
      ) : (
        /* ================================================================= */
        /* B. COMMERCIAL PUBLIC INTERFACE (https://vietsubpro.studio)        */
        /* ================================================================= */
        <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[#090B10] text-slate-100 flex flex-col font-sans">
          {currentWorkspace === "Home" ? (
            <StudioHomePage
              onNavigateWorkspace={handleSwitchWorkspace}
              onOpenDedicatedAdminRouter={() =>
                handleOpenDedicatedAdminRouter("hendy-admini")
              }
              onEnterStudio={() => handleSwitchWorkspace("Studio")}
              onOpenTelegramWorkspace={() =>
                handleOpenDedicatedAdminRouter("telegram-ops")
              }
              onOpenDockerKtorWorkspace={() =>
                handleOpenDedicatedAdminRouter("network-gateway")
              }
              onOpenTranslator={onOpenUniversalTranslatorModal}
              onOpenSocialImport={onOpenSocialImportModal}
              onOpenVoiceover={onOpenVoiceoverModal}
              onOpenCapCut={onOpenCapCutModal}
              onOpenBookmarklet={onOpenBookmarkletModal}
              onOpenDownload={onOpenDownloadModal}
              onOpenSampleVideos={onOpenSampleVideosModal}
              onOpenImageTranslator={onOpenImageTranslatorModal}
              onOpenAuth={onOpenAuthModal}
              platformInfo={platformInfo}
              currentUser={currentUser}
            />
          ) : (
            /* Commercial Active Workspace Shell ('Studio') */
            <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden flex flex-col bg-[#090B10]">
              <header className="sticky top-0 z-40 w-full max-w-full bg-[#090B10]/95 backdrop-blur-md border-b border-neutral-800 px-3 sm:px-6 lg:px-8 py-2.5">
                <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2.5 min-w-0">
                  {/* Left: Return to Commercial Storefront + Active Breadcrumb */}
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleSwitchWorkspace("Home")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      title="Quay về Trang chủ Thương mại"
                    >
                      <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Trang chủ</span>
                    </button>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

                    <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap shrink-0 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{t.cardStudioTitle}</span>
                    </span>

                    {videoTitle && (
                      <>
                        <span className="hidden xl:inline text-slate-600">·</span>
                        <span className="hidden xl:inline text-xs text-slate-400 truncate max-w-[220px]">
                          {videoTitle}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Right: i18n + hendy-Admini IDE + Dedicated Admin Gateway Link + Studio Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="hidden xl:flex items-center gap-1 p-1 rounded-xl bg-[#10141D] border border-neutral-800">
                      {SUPPORTED_LOCALES.map((loc) => (
                        <button
                          key={loc.code}
                          type="button"
                          onClick={() => setLocale(loc.code)}
                          title={loc.nativeName}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            locale === loc.code
                              ? "bg-cyan-400 text-slate-950 font-bold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {loc.flag}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenDedicatedAdminRouter("hendy-admini")
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10141D] hover:bg-neutral-800 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      title="Mở thư mục trung tâm /hendy-Admini để quản lý 7 tầng & chỉnh sửa code trực tiếp"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>hendy-Admini (7 Tầng & Sửa Code)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenDedicatedAdminRouter("network-gateway")
                      }
                      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10141D] hover:bg-neutral-800 border border-neutral-800 text-slate-300 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap"
                      title={`Admin Gateway: ${DEFAULT_NETWORK_POLICY.adminDedicatedDomain} (${DEFAULT_NETWORK_POLICY.adminDedicatedIp})`}
                    >
                      <Network className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Admin Gateway</span>
                    </button>

                    {onUploadClick && (
                      <button
                        type="button"
                        onClick={onUploadClick}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Tải tệp lên</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onOpenExportModal}
                      disabled={!canExport}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>Xuất Video</span>
                    </button>
                  </div>
                </div>
              </header>

              <StudioWorkspace
                cues={cues}
                onUpdateCues={onUpdateCues}
                isVoiceoverEnabled={isVoiceoverEnabled}
                onToggleVoiceover={onToggleVoiceover}
                onOpenStyleModal={onOpenStyleModal}
                onOpenVoiceoverModal={onOpenVoiceoverModal}
                onOpenUniversalTranslatorModal={onOpenUniversalTranslatorModal}
                onOpenImageTranslatorModal={onOpenImageTranslatorModal}
                onOpenBookmarkletModal={onOpenBookmarkletModal}
                onOpenExportModal={onOpenExportModal}
              >
                {studioEditorContent}
              </StudioWorkspace>
            </div>
          )}
        </div>
      )}
    </WorkspaceRouteContext.Provider>
  );
};

export const WorkspaceRouter: React.FC<WorkspaceRouterProps> = (props) => (
  <I18nProvider>
    <WorkspaceRouterInner {...props} />
  </I18nProvider>
);

export default WorkspaceRouter;
