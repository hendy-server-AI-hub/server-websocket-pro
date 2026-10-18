import React, { useState } from "react";
import {
  Scissors,
  Volume2,
  Globe,
  Send,
  Cloud,
  Home,
  ChevronRight,
  Download,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  User,
} from "lucide-react";
import {
  WorkspaceId,
  WORKSPACE_REGISTRY,
  WORKSPACE_LIST,
} from "./workspaceTypes";
import { useWorkspaceRoute } from "../../workspace-router";

interface WorkspaceNavigatorProps {
  activeWorkspace: WorkspaceId;
  onSelectWorkspace: (workspace: WorkspaceId) => void;
  cuesCount: number;
  videoTitle?: string;
  onUploadClick?: () => void;
  onExportClick?: () => void;
  canExport?: boolean;
  currentUser?: any;
  onOpenAuth?: () => void;
  children: React.ReactNode;
}

export const WorkspaceNavigator: React.FC<WorkspaceNavigatorProps> = ({
  activeWorkspace,
  onSelectWorkspace,
  cuesCount,
  videoTitle,
  onUploadClick,
  onExportClick,
  canExport,
  currentUser: currentUserProp,
  onOpenAuth,
  children,
}) => {
  const { isAdminWorkspaceActive, isHomeRouteActive } = useWorkspaceRoute();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentMeta =
    WORKSPACE_REGISTRY[activeWorkspace] || WORKSPACE_REGISTRY.editor;

  // Hide navigator shell completely when on the Home route
  if (isHomeRouteActive) {
    return null;
  }

  // Filter workspaces using workspace-based routing state
  const visibleWorkspaces = WORKSPACE_LIST.filter(
    (ws) => isAdminWorkspaceActive || ws.id !== "cloud-sync"
  );

  const getWorkspaceIcon = (id: WorkspaceId) => {
    switch (id) {
      case "home":
        return <Home className="w-4 h-4 shrink-0" />;
      case "editor":
        return <Scissors className="w-4 h-4 shrink-0" />;
      case "voiceover":
        return <Volume2 className="w-4 h-4 shrink-0" />;
      case "translator":
        return <Globe className="w-4 h-4 shrink-0" />;
      case "telegram":
        return <Send className="w-4 h-4 shrink-0" />;
      case "cloud-sync":
        return <Cloud className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-40 h-14 bg-[#0B0E14]/95 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800/70 transition-colors cursor-pointer shrink-0"
            title={
              sidebarCollapsed
                ? "Mở thanh điều hướng"
                : "Thu gọn thanh điều hướng"
            }
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onSelectWorkspace("home")}
            className="text-sm font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Hendy Studio
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <span className="text-xs sm:text-sm font-medium text-slate-300 truncate">
            {currentMeta.label}
          </span>

          {videoTitle && activeWorkspace === "editor" && (
            <>
              <span className="hidden md:inline text-slate-600">·</span>
              <span className="hidden md:inline text-xs text-slate-400 truncate max-w-[200px]">
                {videoTitle}
              </span>
            </>
          )}
        </div>

        <nav className="flex lg:hidden items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {visibleWorkspaces.map((ws) => {
            const isActive = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                {ws.shortLabel}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tải tệp lên</span>
            </button>
          )}

          {onExportClick && (
            <button
              onClick={onExportClick}
              disabled={!canExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Video & Phụ đề</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside
          className={`${
            sidebarCollapsed ? "w-16" : "w-64"
          } hidden lg:flex flex-col justify-between bg-[#0E121A] border-r border-neutral-800/90 transition-all duration-150 shrink-0 select-none`}
        >
          <div className="p-3 space-y-6">
            <div>
              <button
                onClick={() => onSelectWorkspace("home")}
                className={`w-full flex items-center ${
                  sidebarCollapsed
                    ? "justify-center px-2"
                    : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer`}
                title="Về Trang chủ Studio"
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <Home className="w-4 h-4 text-slate-400 shrink-0" />
                  {!sidebarCollapsed && <span>Trang chủ Studio</span>}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-[11px] text-slate-500 font-mono">00</span>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              {!sidebarCollapsed && (
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Không gian làm việc
                </div>
              )}

              {visibleWorkspaces.map((ws) => {
                const isActive = activeWorkspace === ws.id;
                return (
                  <button
                    key={ws.id}
                    onClick={() => onSelectWorkspace(ws.id)}
                    title={ws.label}
                    className={`w-full flex items-center ${
                      sidebarCollapsed
                        ? "justify-center px-2"
                        : "justify-between px-3"
                    } py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-neutral-800/50 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={isActive ? "text-cyan-400" : "text-slate-400"}
                      >
                        {getWorkspaceIcon(ws.id)}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="truncate whitespace-nowrap">
                          {ws.shortLabel}
                        </span>
                      )}
                    </span>
                    {!sidebarCollapsed && (
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          isActive ? "text-cyan-400" : "text-slate-600"
                        }`}
                      >
                        {ws.number}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-t border-neutral-800/80 space-y-2">
            {!sidebarCollapsed && (
              <div className="px-3 py-2.5 rounded-xl bg-[#0B0E14] border border-neutral-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Phụ đề hiện tại</span>
                  <span className="font-mono text-white tabular-nums">
                    {cuesCount} câu
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentMeta.label}
                </div>
              </div>
            )}

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center px-2" : "gap-2.5 px-3"
                } py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer`}
                title="Tài khoản người dùng"
              >
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && (
                  <span className="truncate whitespace-nowrap">
                    {currentUserProp
                      ? currentUserProp.displayName ||
                        currentUserProp.email ||
                        "Tài khoản"
                      : "Đăng nhập / Đồng bộ"}
                  </span>
                )}
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col bg-[#0B0E14]">
          {children}
        </div>
      </div>
    </div>
  );
};
