import React from "react";
import { DockerKtorPostgresStudio } from "../../components/DockerKtorPostgresStudio";
import { useWorkspaceRoute } from "../../workspace-router";

export interface DockerKtorWorkspaceProps {
  isActive?: boolean;
  onNavigateHome: () => void;
  onNavigateToTelegramBot: () => void;
  onOpenPipelineConsole?: () => void;
  onNotify?: (msg: string) => void;
}

export const DockerKtorWorkspace: React.FC<DockerKtorWorkspaceProps> = ({
  isActive,
  onNavigateToTelegramBot,
  onOpenPipelineConsole,
  onNotify,
}) => {
  const { isAdminWorkspaceActive } = useWorkspaceRoute();

  // Workspace-based routing check:
  // Completely hide Docker, Ktor, PostgreSQL database infrastructure, and backend source code when this workspace route is inactive.
  const isRouteActive =
    isActive !== undefined ? isActive : isAdminWorkspaceActive;

  if (!isRouteActive) {
    return null;
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
      <DockerKtorPostgresStudio
        onOpenTelegramBot={onNavigateToTelegramBot}
        onOpenPipelineConsole={onOpenPipelineConsole}
        onNotify={onNotify}
      />
    </div>
  );
};
