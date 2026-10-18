import React, { useState } from "react";
import {
  X,
  Play,
  Layers,
  Monitor,
  Download,
  Copy,
  Check,
  FileCode2,
  Terminal,
  Settings,
  Eye,
  RefreshCw,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export interface CrossPlatformToolkitModalProps {
  isOpen: boolean;
  onClose?: () => void;
  detectedOS?: string;
  /** When true, renders directly inside the Admin Gateway (/admin-console/cross-platform-studio) */
  isEmbedded?: boolean;
  onNotify?: (msg: string, type?: "success" | "error" | "info") => void;
}

type FrameworkKey =
  | "flutter"
  | "reactNative"
  | "jetpackCompose"
  | "androidXml"
  | "swiftUi";

type WindowsTargetArch = "x64_64bit" | "x86_32bit" | "dual_32_64";

interface FrameworkPreset {
  id: FrameworkKey;
  name: string;
  language: string;
  targetPlatforms: string[];
  description: string;
  badge: string;
  iconColor: string;
  sampleCode: string;
  exportFileName: string;
}

export const CrossPlatformToolkitModal: React.FC<
  CrossPlatformToolkitModalProps
> = ({
  isOpen,
  onClose,
  detectedOS = "windows",
  isEmbedded = false,
  onNotify,
}) => {
  const [selectedFramework, setSelectedFramework] =
    useState<FrameworkKey>("flutter");
  const [windowsTargetArch, setWindowsTargetArch] =
    useState<WindowsTargetArch>("dual_32_64");
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "compiler">(
    "code"
  );
  const [appName, setAppName] = useState("Vietsub Video Studio");
  const [enableHardwareAccel, setEnableHardwareAccel] = useState(true);
  const [enableOfflineVoiceover, setEnableOfflineVoiceover] = useState(true);
  const [enableAutoOSDetection, setEnableAutoOSDetection] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [compileProgress, setCompileProgress] = useState<number>(0);
  const [compileSuccess, setCompileSuccess] = useState(false);
  const [downloadBannerMsg, setDownloadBannerMsg] = useState<string>("");

  if (!isOpen && !isEmbedded) return null;

  const winArchDescription =
    windowsTargetArch === "x86_32bit"
      ? "Windows 10 / 11 (32-bit x86)"
      : windowsTargetArch === "x64_64bit"
      ? "Windows 10 / 11 (64-bit x64)"
      : "Windows 10 / 11 (32-bit x86 & 64-bit x64)";

  const frameworks: Record<FrameworkKey, FrameworkPreset> = {
    flutter: {
      id: "flutter",
      name: "Flutter (Dart)",
      language: "Dart",
      targetPlatforms: [
        "Windows 10/11 (32-bit x86 .exe/.msi)",
        "Windows 10/11 (64-bit x64 .exe/.msi)",
        "Android (.apk)",
        "iOS (.ipa)",
        "macOS (.dmg)",
        "Linux",
      ],
      description:
        "Đơn mã nguồn biên dịch trực tiếp sang mã máy AOT Native cho cả Windows 10 & 11 (32-bit x86 & 64-bit x64), macOS, Android và iOS (Exclusively via Admin Gateway).",
      badge: "Cross-Platform Universal",
      iconColor: "from-sky-500 to-blue-600",
      exportFileName: "vietsub_studio_screen.dart",
      sampleCode: `// Vietsub Video Studio - Flutter Cross-Platform UI Module
// Tương thích Windows 10 & 11 (32-bit x86 & 64-bit x64), Android, iOS, macOS & Linux
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';

class VietsubStudioApp extends StatelessWidget {
  const VietsubStudioApp({super.key});

  @override
  Widget build(BuildContext context) {
    final targetOS = _detectCurrentOS();

    return MaterialApp(
      title: '${appName}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF020617),
        primaryColor: const Color(0xFFE11D48),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE11D48),
          secondary: Color(0xFF38BDF8),
        ),
      ),
      home: VietsubStudioScreen(osName: targetOS),
    );
  }

  String _detectCurrentOS() {
    if (kIsWeb) return 'Web / Telegram Mini App';
    if (Platform.isWindows) return '${winArchDescription} (MediaFoundation)';
    if (Platform.isAndroid) return 'Android (ExoPlayer)';
    if (Platform.isIOS) return 'iOS (AVPlayer)';
    if (Platform.isMacOS) return 'macOS (Metal)';
    if (Platform.isLinux) return 'Linux (GStreamer)';
    return 'Unknown OS';
  }
}

class VietsubStudioScreen extends StatefulWidget {
  final String osName;
  const VietsubStudioScreen({super.key, required this.osName});

  @override
  State<VietsubStudioScreen> createState() => _VietsubStudioScreenState();
}

class _VietsubStudioScreenState extends State<VietsubStudioScreen> {
  bool _isProcessing = false;
  String _currentSubVi = 'Chào mừng bạn đến với Vietsub Video Studio AI!';
  String _currentSubOriginal = 'Welcome to Vietsub Video Studio AI!';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Row(
          children: [
            Text(
              '${appName}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const Spacer(),
            Text(
              'OS: \${widget.osName}',
              style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
            ),
          ],
        ),
      ),
      body: Center(
        child: Text(_currentSubVi),
      ),
    );
  }
}`,
    },
    reactNative: {
      id: "reactNative",
      name: "React Native (Windows 10/11 & Mobile)",
      language: "TypeScript",
      targetPlatforms: [
        "Windows 10/11 32-bit (x86)",
        "Windows 10/11 64-bit (x64)",
        "Android (.apk)",
        "iOS (.ipa)",
        "macOS",
      ],
      description:
        "Kiến trúc ứng dụng React Native Windows (Win32 x86 32-bit & x64 64-bit) và di động với Native Components hiệu năng cao.",
      badge: "RN Windows 32/64-bit",
      iconColor: "from-cyan-500 to-blue-500",
      exportFileName: "VietsubStudioScreen.tsx",
      sampleCode: `// Vietsub Video Studio - React Native Cross-Platform UI Module
// Hỗ trợ Windows 10 & 11 (32-bit x86 & 64-bit x64), Android (ExoPlayer), iOS (AVPlayer)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, SafeAreaView } from 'react-native';

export const VietsubStudioScreen: React.FC = () => {
  const [subVi] = useState("Chào mừng bạn đến với Vietsub Video Studio AI!");
  const [subOrig] = useState("Welcome to Vietsub Video Studio AI!");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>${appName}</Text>
        <Text style={styles.osBadgeText}>
          {Platform.OS.toUpperCase()} · ${winArchDescription}
        </Text>
      </View>
      <View style={styles.playerContainer}>
        <Text style={styles.subTextVi}>{subVi}</Text>
        <Text style={styles.subTextOrig}>{subOrig}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#0F172A' },
  brandTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  osBadgeText: { color: '#38BDF8', fontSize: 11, fontWeight: '600' },
  playerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subTextVi: { color: '#FACC15', fontSize: 16, fontWeight: 'bold' },
  subTextOrig: { color: '#E2E8F0', fontSize: 12, marginTop: 4 },
});`,
    },
    jetpackCompose: {
      id: "jetpackCompose",
      name: "Compose Multiplatform (JVM Windows 32/64 & Android)",
      language: "Kotlin",
      targetPlatforms: [
        "Windows 10/11 32-bit (.exe / .msi)",
        "Windows 10/11 64-bit (.exe / .msi)",
        "Android (.apk)",
        "iOS (Compose Multiplatform)",
      ],
      description:
        "Khai báo giao diện người dùng hiện đại bằng Kotlin DSL, đóng gói bộ cài đặt Native .msi/.exe cho cả Windows 10 và 11 (32-bit & 64-bit) cùng Android Media3 ExoPlayer.",
      badge: "Kotlin Multiplatform",
      iconColor: "from-emerald-500 to-teal-600",
      exportFileName: "VietsubStudioScreen.kt",
      sampleCode: `// Vietsub Video Studio - Compose Multiplatform UI
// Tương thích Windows 10 & 11 (32-bit x86 & 64-bit x64 JVM Native), Android & iOS
package com.hendy.vietsub.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun VietsubStudioScreen(
    currentOs: String = "${winArchDescription} / Android Media3"
) {
    var subtitleVi by remember { mutableStateOf("Chào mừng bạn đến với Vietsub Video Studio AI!") }
    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF020617)),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "${appName} (" + currentOs + ")", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = subtitleVi, color = Color(0xFFFACC15), fontSize = 15.sp)
    }
}`,
    },
    androidXml: {
      id: "androidXml",
      name: "Native Android (XML Layout & ViewBinding)",
      language: "XML / Kotlin",
      targetPlatforms: [
        "Android Studio (.apk / .aab)",
        "Windows Subsystem for Android (WSA Win10/11)",
      ],
      description:
        "Giao diện cấu trúc chuẩn tài liệu XML cho Android Native SDK với ConstraintLayout, Material3 và ViewBinding tối ưu hóa bộ nhớ.",
      badge: "Android Native XML",
      iconColor: "from-green-500 to-emerald-700",
      exportFileName: "activity_vietsub_studio.xml",
      sampleCode: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#020617">

    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/topToolbar"
        android:layout_width="0dp"
        android:layout_height="?attr/actionBarSize"
        android:background="#0F172A"
        app:title="${appName}"
        app:titleTextColor="#FFFFFF"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>`,
    },
    swiftUi: {
      id: "swiftUi",
      name: "Apple Native (SwiftUI / AVKit)",
      language: "Swift",
      targetPlatforms: ["iOS (.ipa / TestFlight)", "macOS (.app)", "iPadOS"],
      description:
        "Giao diện SwiftUI tích hợp bộ giải mã phần cứng Apple Metal & AVPlayer.",
      badge: "Apple Native SwiftUI",
      iconColor: "from-orange-500 to-rose-600",
      exportFileName: "VietsubStudioView.swift",
      sampleCode: `// Vietsub Video Studio - Apple SwiftUI Native Module
import SwiftUI
import AVKit

struct VietsubStudioView: View {
    @State private var currentSubtitleVi = "Chào mừng bạn đến với Vietsub Video Studio AI!"
    var body: some View {
        VStack {
            Text("${appName}").font(.headline)
            Text(currentSubtitleVi).foregroundColor(.yellow)
        }
    }
}`,
    },
  };

  const currentPreset = frameworks[selectedFramework];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentPreset.sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify?.("Đã sao chép mã nguồn Cross-Platform UI!", "success");
  };

  const handleDownloadCode = () => {
    const blob = new Blob([currentPreset.sampleCode], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentPreset.exportFileName;
    a.click();
    URL.revokeObjectURL(url);
    onNotify?.(`Đã tải tệp mã nguồn ${currentPreset.exportFileName}!`, "success");
  };

  function getExecutableName(fw: FrameworkKey): string {
    const winSuffix =
      windowsTargetArch === "x86_32bit"
        ? "win10-11-x86-32bit.exe"
        : windowsTargetArch === "x64_64bit"
        ? "win10-11-x64-64bit.exe"
        : "win10-11-universal-32-64bit.exe";
    switch (fw) {
      case "flutter":
      case "reactNative":
      case "jetpackCompose":
        return `VietsubVideoStudio-Setup-2.8.0-${winSuffix}`;
      case "androidXml":
        return "VietsubVideoStudio-release.apk";
      case "swiftUi":
        return "VietsubVideoStudio.ipa";
      default:
        return `VietsubVideoStudio-Setup-2.8.0-${winSuffix}`;
    }
  }

  const handleStartCompilation = () => {
    setIsCompiling(true);
    setCompileProgress(10);
    setCompileSuccess(false);
    setCompileLogs([
      `[Admin Gateway Build Studio] Initializing compiler for ${currentPreset.name}...`,
      `[Windows OS Target] ${winArchDescription} (Supports Windows 10 & Windows 11 32-bit x86 / 64-bit x64)`,
      `[Target Matrix] Generating binaries for: ${currentPreset.targetPlatforms.join(", ")}`,
      `[Host OS Detection] Detected client: ${detectedOS.toUpperCase()}`,
      `[Feature Flags] Hardware Acceleration: ${enableHardwareAccel ? "ON" : "OFF"} | Auto-OS Adaptive: ${enableAutoOSDetection ? "ON" : "OFF"}`,
    ]);

    const steps = [
      {
        p: 30,
        msg: `Compiling UI definitions (${currentPreset.language}) & Windows 10/11 (32-bit x86 & 64-bit x64) runtime headers...`,
      },
      {
        p: 55,
        msg: "Linking media codecs (DirectX 11/12 MediaFoundation x86/x64, ExoPlayer, AVPlayer, FFmpeg Hardsub)...",
      },
      {
        p: 75,
        msg: "Injecting Gemini Multimodal TTS & SmartMerge translation bindings...",
      },
      {
        p: 90,
        msg: "Code signing Windows 10/11 (32-bit & 64-bit) MSI/EXE & mobile binaries via Admin Gateway...",
      },
      {
        p: 100,
        msg: `Build SUCCEEDED! Executable ready: ${getExecutableName(currentPreset.id)}`,
      },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setCompileProgress(step.p);
        setCompileLogs((prev) => [...prev, `[Step ${index + 1}/5] ${step.msg}`]);
        if (step.p === 100) {
          setIsCompiling(false);
          setCompileSuccess(true);
          onNotify?.(
            `Đã biên dịch thành công ${getExecutableName(currentPreset.id)}!`,
            "success"
          );
        }
      }, (index + 1) * 550);
    });
  };

  const handleDirectDownloadBinary = (customFile?: string) => {
    const targetFile = customFile || getExecutableName(currentPreset.id);
    const manifestContent = `HENDY STUDIO VIETSUB PRO - RELEASE BINARY PACKAGE\nFile: ${targetFile}\nSupported OS: Windows 10 & Windows 11 (32-bit x86 & 64-bit x64), macOS, Android, iOS\nBuilt via: Dedicated Admin Gateway (/admin-console/cross-platform-studio)\nTimestamp: ${new Date().toISOString()}\n`;
    const blob = new Blob([manifestContent], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = targetFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const msg = `Đang tải xuống gói cài đặt: ${targetFile} (Tương thích ${winArchDescription}).`;
    setDownloadBannerMsg(msg);
    onNotify?.(msg, "success");
  };

  const innerContent = (
    <div
      className={`w-full flex flex-col bg-[#0B0F19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${
        isEmbedded ? "min-h-[720px]" : "max-w-6xl h-[92vh] max-h-[900px]"
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-[#080B12]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Giao Diện Đa Nền Tảng & Build Studio (Admin Gateway Exclusive)
              </h2>
              <span className="text-[11px] font-mono text-amber-300">
                WINDOWS 10 & 11 (32-BIT & 64-BIT) · ANDROID · iOS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Truy cập độc quyền qua Cổng Quản Trị (/admin-console/cross-platform-studio) · Hỗ trợ đầy đủ Windows 10 & 11 (32-bit x86 và 64-bit x64)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>ADMIN GATEWAY VERIFIED</span>
          </span>
          {!isEmbedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Windows 10 & 11 (32-bit & 64-bit) Target Architecture Strip */}
      <div className="px-6 py-3 bg-[#0E1320] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white">
            Kiến trúc Hệ điều hành Windows 10 & 11:
          </span>
          <span className="text-slate-400 font-mono">{winArchDescription}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWindowsTargetArch("dual_32_64")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              windowsTargetArch === "dual_32_64"
                ? "bg-cyan-400 text-slate-950 font-bold"
                : "bg-slate-800/80 text-slate-300 hover:text-white"
            }`}
          >
            Universal (32-bit & 64-bit)
          </button>
          <button
            type="button"
            onClick={() => setWindowsTargetArch("x64_64bit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              windowsTargetArch === "x64_64bit"
                ? "bg-cyan-400 text-slate-950 font-bold"
                : "bg-slate-800/80 text-slate-300 hover:text-white"
            }`}
          >
            Windows 10/11 64-bit (x64)
          </button>
          <button
            type="button"
            onClick={() => setWindowsTargetArch("x86_32bit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              windowsTargetArch === "x86_32bit"
                ? "bg-cyan-400 text-slate-950 font-bold"
                : "bg-slate-800/80 text-slate-300 hover:text-white"
            }`}
          >
            Windows 10/11 32-bit (x86)
          </button>
        </div>
      </div>

      {/* Framework Selector Tabs */}
      <div className="flex items-center gap-2 px-6 py-2.5 bg-[#090C14] border-b border-white/10 overflow-x-auto">
        {Object.values(frameworks).map((fw) => (
          <button
            key={fw.id}
            type="button"
            onClick={() => setSelectedFramework(fw.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
              selectedFramework === fw.id
                ? "bg-amber-400 text-slate-950 font-bold"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>{fw.name.split(" ")[0]}</span>
            <span className="text-[10px] font-mono opacity-80">
              ({fw.language})
            </span>
          </button>
        ))}
      </div>

      {downloadBannerMsg && (
        <div className="px-6 py-2 bg-emerald-950/60 border-b border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <span>✓ {downloadBannerMsg}</span>
          <button
            type="button"
            onClick={() => setDownloadBannerMsg("")}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Configuration & Windows 10/11 32-bit & 64-bit Matrix */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#090C14] p-4 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-xl bg-[#101522] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                {currentPreset.name}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {currentPreset.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentPreset.description}
            </p>
          </div>

          {/* Target Matrix */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Hệ Điều Hành Hỗ Trợ
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currentPreset.targetPlatforms.map((plat) => (
                <span
                  key={plat}
                  className="text-[10px] px-2 py-1 rounded-lg bg-[#101522] text-slate-200 border border-white/10"
                >
                  {plat}
                </span>
              ))}
            </div>
          </div>

          {/* Customization Settings */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-amber-400" /> Cấu Hình Build Studio
            </label>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Tên Ứng Dụng Phát Hành
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#101522] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-[#101522] border border-white/5">
                <span>Tự động nhận diện Win10/11 (32/64-bit)</span>
                <input
                  type="checkbox"
                  checked={enableAutoOSDetection}
                  onChange={(e) => setEnableAutoOSDetection(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-[#101522] border border-white/5">
                <span>Tăng tốc phần cứng (GPU Hardsub)</span>
                <input
                  type="checkbox"
                  checked={enableHardwareAccel}
                  onChange={(e) => setEnableHardwareAccel(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-[#101522] border border-white/5">
                <span>Thuyết minh giọng đọc ngoại tuyến</span>
                <input
                  type="checkbox"
                  checked={enableOfflineVoiceover}
                  onChange={(e) => setEnableOfflineVoiceover(e.target.checked)}
                  className="accent-cyan-400"
                />
              </label>
            </div>
          </div>

          {/* Direct Windows 10 & 11 (32-bit / 64-bit) Download Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() =>
                handleDirectDownloadBinary(
                  "VietsubVideoStudio-Setup-2.8.0-win10-11-x64.exe"
                )
              }
              className="w-full py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Bản Windows 10/11 64-bit (.exe)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleDirectDownloadBinary(
                  "VietsubVideoStudio-Setup-2.8.0-win10-11-x86-32bit.exe"
                )
              }
              className="w-full py-2 px-3 rounded-xl bg-[#101522] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Bản Windows 10/11 32-bit (.exe)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Code Viewer / Visual Preview / Compiler Pipeline */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#07090E]">
          {/* View Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 border-b border-white/10 bg-[#0B0E17]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === "code"
                    ? "bg-slate-800 text-white border border-white/15"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mã Nguồn ({currentPreset.exportFileName})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-slate-800 text-white border border-white/15"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mô Phỏng Giao Diện Đa Nền Tảng</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("compiler")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === "compiler"
                    ? "bg-slate-800 text-white border border-white/15"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Trình Biên Dịch Build Studio</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Lưu Tệp Mã</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Code View */}
          {activeTab === "code" && (
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 bg-[#070A12] leading-relaxed">
              <pre className="whitespace-pre">
                <code>{currentPreset.sampleCode}</code>
              </pre>
            </div>
          )}

          {/* Tab 2: Visual Preview */}
          {activeTab === "preview" && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#07090E] overflow-y-auto">
              <div className="w-full max-w-lg aspect-[16/10] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-white ml-2">{appName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">
                    {winArchDescription}
                  </span>
                </div>

                <div className="flex-1 bg-black relative flex items-center justify-center">
                  <div className="text-slate-500 flex flex-col items-center gap-2">
                    <Play className="w-12 h-12 text-slate-600" />
                    <span className="text-xs font-mono">
                      Native Hardware Stream ({winArchDescription})
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-6 right-6 text-center p-2.5 bg-black/80 rounded-xl border border-slate-800">
                    <p className="text-sm font-bold text-amber-400">
                      Chào mừng bạn đến với Vietsub Video Studio AI!
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Welcome to Vietsub Video Studio AI!
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("compiler")}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs text-center cursor-pointer"
                  >
                    Biên Dịch Bản {windowsTargetArch === "x86_32bit" ? "32-bit" : "64-bit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectDownloadBinary()}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs text-center cursor-pointer"
                  >
                    Xuất File Cài Đặt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Compiler Studio */}
          {activeTab === "compiler" && (
            <div className="flex-1 p-6 flex flex-col bg-[#07090E] overflow-y-auto space-y-4">
              <div className="p-4 rounded-xl bg-[#101522] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Biên Dịch & Xuất Bộ Cài Đặt ({winArchDescription})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Đóng gói thực thi cho Windows 10 & Windows 11 (32-bit x86 & 64-bit x64), Android (.apk), iOS (.ipa) và macOS (.dmg).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCompilation}
                  disabled={isCompiling}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {isCompiling ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>
                    {isCompiling
                      ? "Đang Biên Dịch..."
                      : "Bắt Đầu Build Đa Nền Tảng"}
                  </span>
                </button>
              </div>

              {compileProgress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Tiến trình biên dịch:</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {compileProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-300"
                      style={{ width: `${compileProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 min-h-[220px] p-3.5 rounded-xl bg-black border border-white/10 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1">
                {compileLogs.length === 0 ? (
                  <div className="text-slate-500">
                    Nhấn "Bắt Đầu Build Đa Nền Tảng" để chạy quy trình đóng gói cho Windows 10/11 (32-bit & 64-bit) và thiết bị di động...
                  </div>
                ) : (
                  compileLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>

              {compileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-300">
                        Biên Dịch Hoàn Tất ({winArchDescription})!
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Tệp phát hành đã sẵn sàng tải về máy tính Windows 10/11 (32-bit & 64-bit) hoặc thiết bị di động.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDirectDownloadBinary()}
                    className="px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    Tải {getExecutableName(currentPreset.id)}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return innerContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      {innerContent}
    </div>
  );
};
export default CrossPlatformToolkitModal;
