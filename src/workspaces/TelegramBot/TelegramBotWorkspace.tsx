import React from "react";
import { Send, Sliders } from "lucide-react";
import { TelegramBotModal } from "../../components/TelegramBotModal";
import { useWorkspaceRoute } from "../../workspace-router";

export interface TelegramBotWorkspaceProps {
  isActive?: boolean;
  onOpenDownloadModal?: () => void;
  onOpenPipelineConsole?: () => void;
  onNavigateToStudio?: () => void;
  onNavigateToAdminWorkspace?: () => void;
}

export const TelegramBotWorkspace: React.FC<TelegramBotWorkspaceProps> = ({
  isActive,
  onOpenDownloadModal,
  onOpenPipelineConsole,
  onNavigateToAdminWorkspace,
}) => {
  const { isTelegramWorkspaceActive, navigateToWorkspace } =
    useWorkspaceRoute();

  // Workspace-based routing guard: completely hide TelegramBotWorkspace when inactive
  const isRouteActive =
    isActive !== undefined ? isActive : isTelegramWorkspaceActive;

  if (!isRouteActive) {
    return null;
  }

  const handleOpenAdminWorkspace = () => {
    if (onNavigateToAdminWorkspace) {
      onNavigateToAdminWorkspace();
    } else {
      navigateToWorkspace("DockerKtor");
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-5">
      {/* Workspace Header Card */}
      <div className="bg-[#10141D] border border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
            <Send className="w-3.5 h-3.5" />
            <span>Không gian làm việc · TelegramBot</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Trợ Lý Tự Động Telegram & Quản Lý Kho Tài Khoản
          </h1>
          <p className="text-xs text-slate-400">
            Tương tác trực tiếp với trợ lý dịch vụ, liên kết tài khoản thành viên và quản lý danh mục tài khoản lưu trữ
          </p>
        </div>

        {/* Dedicated Admin Router Endpoint Link */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenAdminWorkspace}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/25 text-amber-300 hover:text-amber-200 text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mở Admin Router (10.240.0.10:8443)</span>
          </button>
        </div>
      </div>

      {/* Isolated Telegram Bot Interactive Workspace */}
      <TelegramBotModal
        isOpen={isRouteActive}
        inlineMode={true}
        isWorkspaceActive={isRouteActive}
        onNavigateAdminWorkspace={handleOpenAdminWorkspace}
        onClose={() => {}}
        onOpenDownloadModal={onOpenDownloadModal}
        onOpenPipelineConsole={onOpenPipelineConsole}
      />
    </div>
  );
};
