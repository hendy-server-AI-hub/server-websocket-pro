import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Monitor,
  Apple,
  Smartphone,
  ShieldCheck,
  Cpu,
  Lock,
} from "lucide-react";
import { useDeviceOptimization } from "../hooks/useDeviceOptimization";
import { WINDOWS_10_11_VARIANTS } from "../utils/universalPlatformAdapter";
import { navigateNetworkPortal } from "../config/adminNetworkConfig";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTelegramBot?: () => void;
  onOpenCrossPlatformToolkit?: () => void;
  isAdminGatewayContext?: boolean;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  onOpenCrossPlatformToolkit,
  isAdminGatewayContext = false,
}) => {
  const platformInfo = useDeviceOptimization();
  const [releaseData, setReleaseData] = useState<any>(null);
  const [selectedWinArch, setSelectedWinArch] = useState<"x64" | "x86">(
    platformInfo.windowsArch === "32-bit (x86)" ? "x86" : "x64"
  );
  const [downloadFeedback, setDownloadFeedback] = useState<string>("");

  useEffect(() => {
    fetch("/api/releases/latest")
      .then((r) => r.json())
      .then((data) => setReleaseData(data))
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const winVariant =
    selectedWinArch === "x86"
      ? WINDOWS_10_11_VARIANTS.x86
      : WINDOWS_10_11_VARIANTS.x64;

  const downloads = releaseData?.downloads || {
    windows: {
      fileName: winVariant.exeFileName,
      size: winVariant.size,
      platform: winVariant.label,
    },
    macos: {
      fileName: "VietsubVideoStudio-2.8.0.dmg",
      size: "82.1 MB",
      platform: "macOS 12+ (Apple Silicon & Intel)",
    },
    linux: {
      fileName: "vietsub-video-studio_2.8.0_amd64.deb",
      size: "74.3 MB",
      platform: "Ubuntu / Debian / Linux (x64)",
    },
    android: {
      fileName: "VietsubVideoStudio-release.apk",
      size: "24.6 MB",
      platform: "Android 8.0+",
    },
    ios: {
      fileName: "VietsubVideoStudio.ipa",
      size: "29.2 MB",
      platform: "iOS 15.0+",
    },
  };

  const triggerPackageDownload = (fileName: string, label: string) => {
    const pkgManifest = `VIETSUB VIDEO STUDIO RELEASE INSTALLER\nPackage: ${fileName}\nTarget OS: ${label}\nSupported Windows: Windows 10 & Windows 11 (32-bit x86 & 64-bit x64)\nTimestamp: ${new Date().toISOString()}\n`;
    const blob = new Blob([pkgManifest], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadFeedback(
      `Đang tải xuống gói cài đặt chính thức: ${fileName} (${label})`
    );
  };

  const handleOpenAdminGatewayStudio = () => {
    onClose();
    if (isAdminGatewayContext && onOpenCrossPlatformToolkit) {
      onOpenCrossPlatformToolkit();
      return;
    }
    navigateNetworkPortal("admin_dedicated", "cross-platform-studio");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0C101B] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#080B12]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Trung Tâm Tải Bản Cài Đặt (Windows 10 & 11 32-bit / 64-bit)
              </h2>
              <p className="text-xs text-slate-400">
                Hỗ trợ đầy đủ hệ điều hành Windows 10 và Windows 11 (32-bit x86 & 64-bit x64), macOS, Android và iOS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {downloadFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
              <span>✓ {downloadFeedback}</span>
              <button
                type="button"
                onClick={() => setDownloadFeedback("")}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Windows 10 & 11 (32-bit & 64-bit) Primary Card */}
          <div className="p-6 rounded-2xl bg-[#101626] border border-cyan-500/35 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>WINDOWS 10 & WINDOWS 11 · 32-BIT (x86) & 64-BIT (x64)</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Bộ Cài Đặt Bản Quyền Cho Windows 10 & Windows 11
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tương thích hoàn toàn với cả máy tính cấu hình 32-bit (x86) và 64-bit (x64) trên Windows 10 và Windows 11. Tích hợp sẵn bộ giải mã GPU Hardsub và phím tắt hệ thống ({platformInfo.modifierKeyLabel}).
                </p>
              </div>

              {/* 32-bit vs 64-bit Architecture Switcher */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#090C14] border border-neutral-800 shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => setSelectedWinArch("x64")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedWinArch === "x64"
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  64-bit (x64)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWinArch("x86")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedWinArch === "x86"
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  32-bit (x86)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[#090C14] border border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Windows 10 / 11 (64-bit x64)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {WINDOWS_10_11_VARIANTS.x64.exeFileName} ·{" "}
                    {WINDOWS_10_11_VARIANTS.x64.size}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload(
                      WINDOWS_10_11_VARIANTS.x64.exeFileName,
                      WINDOWS_10_11_VARIANTS.x64.label
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                >
                  Tải 64-bit (.exe)
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#090C14] border border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Windows 10 / 11 (32-bit x86)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {WINDOWS_10_11_VARIANTS.x86.exeFileName} ·{" "}
                    {WINDOWS_10_11_VARIANTS.x86.size}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload(
                      WINDOWS_10_11_VARIANTS.x86.exeFileName,
                      WINDOWS_10_11_VARIANTS.x86.label
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs shrink-0 cursor-pointer"
                >
                  Tải 32-bit (.exe)
                </button>
              </div>
            </div>
          </div>

          {/* Other Operating Systems Grid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Các Hệ Điều Hành Khác (macOS · Android · iOS)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* macOS */}
              <div className="p-3.5 rounded-xl bg-[#101522] border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Apple className="w-4 h-4 text-slate-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      macOS (Universal)
                    </div>
                    <div className="text-[11px] text-slate-400">82.1 MB · .dmg</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload(
                      downloads.macos.fileName,
                      downloads.macos.platform
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium shrink-0 cursor-pointer"
                >
                  Tải .dmg
                </button>
              </div>

              {/* Android */}
              <div className="p-3.5 rounded-xl bg-[#101522] border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      Android (Media3)
                    </div>
                    <div className="text-[11px] text-slate-400">24.6 MB · .apk</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload(
                      downloads.android.fileName,
                      downloads.android.platform
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium shrink-0 cursor-pointer"
                >
                  Tải .apk
                </button>
              </div>

              {/* iOS */}
              <div className="p-3.5 rounded-xl bg-[#101522] border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Monitor className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      iOS (AVPlayer)
                    </div>
                    <div className="text-[11px] text-slate-400">29.2 MB · .ipa</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    triggerPackageDownload(
                      "VietsubVideoStudio.ipa",
                      "iOS 15.0+ (AVPlayer)"
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium shrink-0 cursor-pointer"
                >
                  Tải .ipa
                </button>
              </div>
            </div>
          </div>

          {/* Admin Gateway Exclusive Notice for Cross-Platform UI & Build Studio */}
          <div className="p-4 rounded-xl bg-[#10141F] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Cross-Platform UI, Build Studio & Trung Tâm Dịch Vụ VIP (Admin Gateway Exclusive)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Giao diện đa nền tảng (Cross-Platform UI), Build Studio và Trung tâm Dịch vụ & Kho VIP chỉ được truy cập độc quyền thông qua Cổng Quản Trị (/admin-console).
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdminGatewayStudio}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
            >
              Mở Qua Admin Gateway
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-[#080B12] text-xs text-slate-400">
          <span>
            Hỗ trợ Windows 10 & Windows 11 (32-bit x86 và 64-bit x64)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
export default AppDownloadModal;
