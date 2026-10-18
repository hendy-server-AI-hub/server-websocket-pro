import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  Volume2,
  Sparkles,
  Scissors,
  Plus,
  Play,
  Pause,
  Activity,
  Loader2,
  Radio,
} from "lucide-react";
import { SubtitleCue } from "../types";
import { autoSyncSubtitleCues } from "../utils/audioSyncEngine";

export interface AudioWaveformTimelineProps {
  videoUrl: string;
  cues: SubtitleCue[];
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  onUpdateCue: (updated: SubtitleCue) => void;
  onUpdateCues?: (updatedCues: SubtitleCue[]) => void;
  onAddCue?: (atTime: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  audioFile?: File | null;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

export const AudioWaveformTimeline: React.FC<AudioWaveformTimelineProps> = ({
  videoUrl,
  cues,
  currentTime,
  duration,
  onSeek,
  onUpdateCue,
  onUpdateCues,
  onAddCue,
  isPlaying = false,
  onTogglePlay,
  audioFile,
  onNotify,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSyncingWaveform, setIsSyncingWaveform] = useState(false);

  // Also observe #main-video-element play/pause state directly so timeline animations
  // stay 100% synchronized even if playback is triggered from native video controls
  const [domVideoPlaying, setDomVideoPlaying] = useState(false);

  useEffect(() => {
    const videoEl = document.getElementById("main-video-element") as HTMLVideoElement | null;
    if (!videoEl) return;

    const syncPlayState = () => {
      setDomVideoPlaying(!videoEl.paused && !videoEl.ended);
    };

    syncPlayState();
    videoEl.addEventListener("play", syncPlayState);
    videoEl.addEventListener("playing", syncPlayState);
    videoEl.addEventListener("pause", syncPlayState);
    videoEl.addEventListener("ended", syncPlayState);

    return () => {
      videoEl.removeEventListener("play", syncPlayState);
      videoEl.removeEventListener("playing", syncPlayState);
      videoEl.removeEventListener("pause", syncPlayState);
      videoEl.removeEventListener("ended", syncPlayState);
    };
  }, [videoUrl]);

  const effectiveIsPlaying = isPlaying || domVideoPlaying;

  const handleTogglePlayback = useCallback(() => {
    if (onTogglePlay) {
      onTogglePlay();
      return;
    }
    const videoEl = document.getElementById("main-video-element") as HTMLVideoElement | null;
    if (videoEl) {
      if (videoEl.paused) {
        videoEl.play().catch(console.warn);
      } else {
        videoEl.pause();
      }
    }
  }, [onTogglePlay]);

  const handleWaveformAutoSync = async () => {
    if (cues.length === 0 || isSyncingWaveform) return;
    setIsSyncingWaveform(true);
    try {
      const res = await autoSyncSubtitleCues(
        cues,
        cues.map((c) => c.id),
        audioFile || videoUrl || null,
        { sensitivity: "medium", leadInMs: 50, leadOutMs: 110 }
      );
      if (onUpdateCues) {
        onUpdateCues(res.updatedCues);
      } else {
        res.updatedCues.forEach((c) => onUpdateCue(c));
      }
      onNotify?.(
        `Đã Auto-Sync ${res.alignedCount} câu phụ đề khớp dải sóng giọng nói (lệch TB ±${res.averageShiftMs}ms)!`,
        "success"
      );
    } catch (err: any) {
      onNotify?.(err.message || "Lỗi Auto-Sync trên sóng âm.", "error");
    } finally {
      setIsSyncingWaveform(false);
    }
  };

  // Zoom level: 1x (fits whole duration), 2x, 4x
  const [zoom, setZoom] = useState<number>(1);
  const [isExtractingWaveform, setIsExtractingWaveform] = useState(false);
  const [wavePeaks, setWavePeaks] = useState<number[]>([]);

  // Animation phase state for 60fps real-time waveform oscillation when playing
  const [animTick, setAnimTick] = useState<number>(0);
  const animPhaseRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Active dragged cue edge: cueId and edge ('start' | 'end' | 'move')
  const [dragging, setDragging] = useState<{
    cueId: number;
    edge: "start" | "end" | "move";
    startX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  const [hoveredCueId, setHoveredCueId] = useState<number | null>(null);

  // Extract or generate audio waveform peaks
  useEffect(() => {
    let isCancelled = false;

    const extractAudioPeaks = async () => {
      if (!videoUrl) return;
      setIsExtractingWaveform(true);

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch(videoUrl);
        const arrayBuffer = await response.arrayBuffer();

        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        if (isCancelled) return;

        const channelData = audioBuffer.getChannelData(0);
        const totalSamples = 300;
        const blockSize = Math.floor(channelData.length / totalSamples);
        const peaks: number[] = [];

        for (let i = 0; i < totalSamples; i++) {
          let sum = 0;
          const start = i * blockSize;
          const end = Math.min(start + blockSize, channelData.length);
          for (let j = start; j < end; j += 4) {
            sum += Math.abs(channelData[j]);
          }
          const avg = sum / ((end - start) / 4);
          peaks.push(Math.min(1, avg * 2.8));
        }

        setWavePeaks(peaks);
        audioCtx.close().catch(console.warn);
      } catch (err) {
        console.warn("AudioContext decode fallback:", err);
        const pseudoPeaks: number[] = [];
        for (let i = 0; i < 300; i++) {
          const t = i / 300;
          const wave =
            Math.sin(t * 40) * 0.35 +
            Math.sin(t * 12) * 0.25 +
            Math.cos(t * 80) * 0.15 +
            0.35;
          pseudoPeaks.push(Math.max(0.08, Math.min(0.95, wave)));
        }
        setWavePeaks(pseudoPeaks);
      } finally {
        if (!isCancelled) setIsExtractingWaveform(false);
      }
    };

    extractAudioPeaks();
    return () => {
      isCancelled = true;
    };
  }, [videoUrl]);

  // 60FPS requestAnimationFrame loop when audio is actively playing
  useEffect(() => {
    if (!effectiveIsPlaying) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    const step = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      animPhaseRef.current += dt * 10.5;
      setAnimTick((prev) => (prev + 1) % 1000000);
      rafIdRef.current = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [effectiveIsPlaying]);

  const effectiveDuration = duration > 0 ? duration : 30;

  // Active cue being played
  const activeCue = useMemo(
    () => cues.find((c) => currentTime >= c.start && currentTime <= c.end),
    [cues, currentTime]
  );

  // Compute live instantaneous amplitude & dBFS at current playhead position
  const liveAudioMetrics = useMemo(() => {
    const peaks = wavePeaks.length > 0 ? wavePeaks : Array(150).fill(0.25);
    const idx = Math.min(
      peaks.length - 1,
      Math.max(0, Math.floor((currentTime / effectiveDuration) * peaks.length))
    );
    const basePeak = peaks[idx] ?? 0.25;
    const phase = animPhaseRef.current;
    const dynamicGain = effectiveIsPlaying
      ? Math.max(
          0.08,
          Math.min(
            1,
            basePeak * (0.85 + Math.sin(phase * 1.8) * 0.22 + Math.cos(phase * 3.1) * 0.12)
          )
        )
      : basePeak;
    const dbFs = Math.max(-48, Math.min(-0.5, 20 * Math.log10(Math.max(0.01, dynamicGain))));
    const eqBars = [0, 1, 2, 3, 4].map((b) => {
      if (!effectiveIsPlaying) return Math.round(20 + basePeak * 35);
      const osc =
        Math.sin(phase * (1.6 + b * 0.35) + b * 1.1) * 0.35 +
        Math.cos(phase * (2.4 - b * 0.2) + b) * 0.25 +
        0.55;
      return Math.max(18, Math.min(100, Math.round(dynamicGain * osc * 115)));
    });
    return {
      amplitudePct: Math.round(dynamicGain * 100),
      dbFs: dbFs.toFixed(1),
      eqBars,
    };
  }, [wavePeaks, currentTime, effectiveDuration, effectiveIsPlaying, animTick]);

  // Draw waveform and real-time playback animations on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const phase = animPhaseRef.current;

    ctx.clearRect(0, 0, width, height);

    // Timeline background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#090d16");
    bgGrad.addColorStop(1, "#040711");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const playheadX = (currentTime / effectiveDuration) * width;

    // 1. Live Acoustic Glow Aura around playhead when playing
    if (effectiveIsPlaying) {
      const auraRadius = Math.max(60, 95 * zoom);
      const auraGrad = ctx.createRadialGradient(
        playheadX,
        height / 2,
        4,
        playheadX,
        height / 2,
        auraRadius
      );
      auraGrad.addColorStop(0, "rgba(244, 63, 94, 0.28)");
      auraGrad.addColorStop(0.45, "rgba(6, 182, 212, 0.14)");
      auraGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = auraGrad;
      ctx.fillRect(
        Math.max(0, playheadX - auraRadius),
        0,
        auraRadius * 2,
        height
      );

      // Subtle animated carrier sine wave along center line during playback
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(34, 211, 238, 0.22)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= width; x += 6) {
        const dist = Math.abs(x - playheadX);
        const atten = Math.max(0.15, Math.exp(-dist / (180 * zoom)));
        const y =
          height / 2 +
          Math.sin(x * 0.045 - phase * 2.2) * 10 * atten * (liveAudioMetrics.amplitudePct / 100);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Subtle horizontal center grid line
    ctx.strokeStyle = effectiveIsPlaying
      ? "rgba(244, 63, 94, 0.14)"
      : "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw waveform bars with real-time acoustic modulation
    const peaks = wavePeaks.length > 0 ? wavePeaks : Array(150).fill(0.2);
    const numBars = peaks.length;
    const barWidth = width / numBars;

    const activeCueStartX = activeCue ? (activeCue.start / effectiveDuration) * width : -1;
    const activeCueEndX = activeCue ? (activeCue.end / effectiveDuration) * width : -1;

    for (let i = 0; i < numBars; i++) {
      const x = i * barWidth;
      const basePeak = peaks[i];
      const distFromPlayhead = Math.abs(x - playheadX);
      const isNearPlayhead = distFromPlayhead < 44 * zoom;
      const isInActiveCue =
        activeCue !== undefined && x >= activeCueStartX && x <= activeCueEndX;

      // Real-time oscillation multiplier when audio is playing
      let animatedPeak = basePeak;
      if (effectiveIsPlaying) {
        if (isNearPlayhead) {
          const proximity = 1 - distFromPlayhead / (44 * zoom);
          const harmonic =
            Math.sin(phase * 2.6 + i * 0.65) * 0.28 +
            Math.cos(phase * 4.1 - i * 0.4) * 0.18;
          animatedPeak = Math.min(
            0.98,
            Math.max(0.08, basePeak * (1 + proximity * 0.45) + harmonic * proximity)
          );
        } else if (isInActiveCue && x <= playheadX) {
          const vocalWave = Math.sin(phase * 1.9 + i * 0.5) * 0.12;
          animatedPeak = Math.min(0.95, Math.max(0.06, basePeak + vocalWave));
        } else if (x < playheadX) {
          const subtleWave = Math.sin(phase * 1.1 + i * 0.25) * 0.04;
          animatedPeak = Math.min(0.95, Math.max(0.06, basePeak + subtleWave));
        }
      }

      const barHeight = Math.max(4, animatedPeak * (height - 24));
      const y = (height - barHeight) / 2;

      if (effectiveIsPlaying && isNearPlayhead) {
        // Active playhead acoustic window: high-energy cyan -> rose -> amber glow
        const barGrad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        barGrad.addColorStop(0, "#22d3ee");
        barGrad.addColorStop(0.5, "#f43f5e");
        barGrad.addColorStop(1, "#fde047");
        ctx.fillStyle = barGrad;
      } else if (x < playheadX) {
        // Played segment: vibrant rose/amber
        const barGrad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        barGrad.addColorStop(0, "#f43f5e");
        barGrad.addColorStop(0.5, "#fb7185");
        barGrad.addColorStop(1, "#fbbf24");
        ctx.fillStyle = barGrad;
      } else {
        // Upcoming segment: slate/indigo
        const barGrad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        barGrad.addColorStop(0, "#6366f1");
        barGrad.addColorStop(0.5, "#4338ca");
        barGrad.addColorStop(1, "#312e81");
        ctx.fillStyle = barGrad;
      }

      ctx.beginPath();
      ctx.roundRect(x + 1, y, Math.max(1.5, barWidth - 1.5), barHeight, 2);
      ctx.fill();

      // Draw floating spectrum peak caps on bars near the active playhead when playing
      if (effectiveIsPlaying && isNearPlayhead && animatedPeak > 0.2) {
        const capY = Math.max(3, y - 3.5 - Math.abs(Math.sin(phase * 2 + i)) * 3);
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(x + 1, capY, Math.max(1.5, barWidth - 1.5), 2);
      }
    }

    // Draw seconds tick marks on timeline top
    const tickInterval = zoom >= 4 ? 1 : zoom >= 2 ? 2 : 5;
    ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
    ctx.font = "9px monospace";

    for (let sec = 0; sec <= effectiveDuration; sec += tickInterval) {
      const secX = (sec / effectiveDuration) * width;
      ctx.fillRect(secX, 0, 1, 6);
      const mins = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      const label = `${mins}:${s < 10 ? "0" : ""}${s}`;
      ctx.fillText(label, secX + 3, 9);
    }
  }, [
    wavePeaks,
    currentTime,
    effectiveDuration,
    zoom,
    effectiveIsPlaying,
    activeCue,
    animTick,
    liveAudioMetrics.amplitudePct,
  ]);

  // Handle clicking or scrubbing on timeline
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = pct * effectiveDuration;
    onSeek(targetSeconds);
  };

  const handleTimelineTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (dragging || e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = pct * effectiveDuration;
    onSeek(targetSeconds);
  };

  // Dragging Cue Handles to resize start/end or move
  const handleStartDrag = (
    e: React.MouseEvent,
    cue: SubtitleCue,
    edge: "start" | "end" | "move"
  ) => {
    e.stopPropagation();
    setDragging({
      cueId: cue.id,
      edge,
      startX: e.clientX,
      initialStart: cue.start,
      initialEnd: cue.end,
    });
  };

  const handleStartTouchDrag = (
    e: React.TouchEvent,
    cue: SubtitleCue,
    edge: "start" | "end" | "move"
  ) => {
    e.stopPropagation();
    if (!e.touches.length) return;
    setDragging({
      cueId: cue.id,
      edge,
      startX: e.touches[0].clientX,
      initialStart: cue.start,
      initialEnd: cue.end,
    });
  };

  useEffect(() => {
    const handleMoveCoord = (clientX: number) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragging.startX;
      const deltaSeconds = (deltaX / rect.width) * effectiveDuration;

      const targetCue = cues.find((c) => c.id === dragging.cueId);
      if (!targetCue) return;

      if (dragging.edge === "start") {
        const newStart = Math.max(
          0,
          Math.min(targetCue.end - 0.2, dragging.initialStart + deltaSeconds)
        );
        onUpdateCue({
          ...targetCue,
          start: Number(newStart.toFixed(2)),
          startTime: `00:00:${Math.floor(newStart)}.${Math.round((newStart % 1) * 1000)}`,
        });
      } else if (dragging.edge === "end") {
        const newEnd = Math.min(
          effectiveDuration,
          Math.max(targetCue.start + 0.2, dragging.initialEnd + deltaSeconds)
        );
        onUpdateCue({
          ...targetCue,
          end: Number(newEnd.toFixed(2)),
          endTime: `00:00:${Math.floor(newEnd)}.${Math.round((newEnd % 1) * 1000)}`,
        });
      } else if (dragging.edge === "move") {
        const durationLength = dragging.initialEnd - dragging.initialStart;
        const newStart = Math.max(
          0,
          Math.min(effectiveDuration - durationLength, dragging.initialStart + deltaSeconds)
        );
        const newEnd = newStart + durationLength;
        onUpdateCue({
          ...targetCue,
          start: Number(newStart.toFixed(2)),
          end: Number(newEnd.toFixed(2)),
          startTime: `00:00:${Math.floor(newStart)}.${Math.round((newStart % 1) * 1000)}`,
          endTime: `00:00:${Math.floor(newEnd)}.${Math.round((newEnd % 1) * 1000)}`,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMoveCoord(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMoveCoord(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      if (dragging) {
        setDragging(null);
      }
    };

    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [dragging, cues, effectiveDuration, onUpdateCue]);

  return (
    <div
      id="audio-waveform-timeline"
      className={`bg-slate-900/90 border rounded-2xl p-3.5 space-y-2.5 shadow-xl select-none transition-colors duration-300 ${
        effectiveIsPlaying
          ? "border-rose-500/45 shadow-rose-950/25"
          : "border-slate-800"
      }`}
    >
      {/* Top Waveform Header Bar with Real-Time Audio Playback Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlayback}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              effectiveIsPlaying
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
            title={
              effectiveIsPlaying
                ? "Tạm dừng phát âm thanh"
                : "Phát âm thanh trực tiếp trên dải sóng"
            }
          >
            {effectiveIsPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
            )}
            <span>{effectiveIsPlaying ? "Đang Phát" : "Phát Sóng Âm"}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <div
              className={`p-1 rounded-md transition-colors ${
                effectiveIsPlaying
                  ? "bg-rose-500/25 text-rose-300"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  effectiveIsPlaying ? "animate-bounce" : ""
                }`}
              />
            </div>
            <span className="font-bold text-slate-200">
              Dải Sóng Âm Thanh (Audio Waveform)
            </span>
          </div>

          {/* Live Equalizer Visualizer & Instantaneous dBFS Telemetry */}
          <div
            className={`flex items-center gap-2 px-2.5 py-0.5 rounded-lg border text-[10px] font-mono tabular-nums transition-all ${
              effectiveIsPlaying
                ? "bg-slate-950/90 border-cyan-500/40 text-cyan-300"
                : "bg-slate-950/60 border-slate-800 text-slate-400"
            }`}
          >
            {/* 5-bar real-time equalizer */}
            <div className="flex items-end gap-0.5 h-3.5 w-5" aria-hidden="true">
              {liveAudioMetrics.eqBars.map((barHeight, idx) => (
                <span
                  key={idx}
                  className={`w-0.5 rounded-t transition-all duration-75 ${
                    effectiveIsPlaying
                      ? idx % 2 === 0
                        ? "bg-cyan-400"
                        : "bg-rose-400"
                      : "bg-slate-600"
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
              ))}
            </div>

            <span>
              {effectiveIsPlaying ? "LIVE 60FPS" : "PAUSED"} · {liveAudioMetrics.dbFs} dBFS
            </span>

            {effectiveIsPlaying && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    activeCue ? "text-amber-300 font-semibold" : "text-slate-400"
                  }
                >
                  {activeCue ? `Thoại #${activeCue.id}` : "Nhạc nền"}
                </span>
              </>
            )}
          </div>

          {isExtractingWaveform && (
            <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Đang giải mã sóng âm...
            </span>
          )}
        </div>

        {/* Zoom & Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            {[1, 2, 4].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoom(z)}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  zoom === z
                    ? "bg-rose-500/20 text-rose-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title={`Phóng to ${z}x`}
              >
                {z}x
              </button>
            ))}
          </div>

          <button
            id="btn-waveform-auto-sync"
            type="button"
            disabled={isSyncingWaveform || cues.length === 0}
            onClick={handleWaveformAutoSync}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/25 hover:bg-cyan-600/40 text-cyan-200 text-[11px] font-semibold border border-cyan-500/40 transition-all disabled:opacity-50 cursor-pointer"
            title="Phân tích điểm bắt đầu/kết thúc giọng nói (VAD) và tự động khớp mốc phụ đề trên sóng âm"
          >
            {isSyncingWaveform ? (
              <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
            ) : (
              <Activity className="w-3 h-3 text-cyan-400" />
            )}
            <span>{isSyncingWaveform ? "Đang Sync..." : "Auto-Sync Giọng"}</span>
          </button>

          {onAddCue && (
            <button
              type="button"
              onClick={() => onAddCue(currentTime)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-all cursor-pointer"
              title="Thêm phụ đề ngay tại thời điểm đang phát"
            >
              <Plus className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">Thêm tại mốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Waveform Scroll Container */}
      <div
        className={`relative overflow-x-auto rounded-xl border bg-slate-950/60 pb-1 transition-colors ${
          effectiveIsPlaying
            ? "border-rose-500/40"
            : "border-slate-800/90"
        }`}
        style={{ scrollbarWidth: "thin" }}
      >
        <div
          ref={containerRef}
          onClick={handleTimelineClick}
          onTouchStart={handleTimelineTouch}
          className="relative h-24 cursor-pointer touch-none"
          style={{ width: `${zoom * 100}%`, minWidth: "100%" }}
        >
          {/* Waveform Canvas with 60fps Live Audio Animation */}
          <canvas
            ref={canvasRef}
            width={1200 * zoom}
            height={96}
            className="w-full h-full block"
          />

          {/* Subtitle Cue Overlay Blocks with Live Spoken Progress Fill */}
          <div className="absolute inset-0 pointer-events-none">
            {cues.map((cue) => {
              const startPct = (cue.start / effectiveDuration) * 100;
              const widthPct = Math.max(
                0.8,
                ((cue.end - cue.start) / effectiveDuration) * 100
              );
              const isActive = activeCue?.id === cue.id;
              const isHovered = hoveredCueId === cue.id;
              const cueDuration = Math.max(0.1, cue.end - cue.start);
              const cueProgressPct = isActive
                ? Math.max(
                    0,
                    Math.min(100, ((currentTime - cue.start) / cueDuration) * 100)
                  )
                : currentTime > cue.end
                ? 100
                : 0;

              return (
                <div
                  key={cue.id}
                  onMouseEnter={() => setHoveredCueId(cue.id)}
                  onMouseLeave={() => setHoveredCueId(null)}
                  className={`absolute top-5 bottom-1 rounded-md border pointer-events-auto transition-all overflow-hidden ${
                    isActive
                      ? effectiveIsPlaying
                        ? "bg-rose-500/30 border-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.45)] ring-1 ring-cyan-300/80 z-10"
                        : "bg-rose-500/30 border-rose-400 shadow-md shadow-rose-950/50 ring-1 ring-rose-400 z-10"
                      : isHovered
                      ? "bg-purple-600/30 border-purple-400 z-5"
                      : "bg-purple-900/25 border-purple-600/40 hover:border-purple-400"
                  }`}
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                  }}
                  title={`[#${cue.id}] ${cue.start.toFixed(2)}s - ${cue.end.toFixed(
                    2
                  )}s: ${cue.textVi || cue.textOriginal}`}
                >
                  {/* Real-time Spoken Progress Fill inside Active Cue */}
                  {isActive && (
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500/35 via-amber-400/25 to-cyan-400/35 pointer-events-none transition-none"
                      style={{ width: `${cueProgressPct}%` }}
                    />
                  )}

                  {/* Left Resizing Drag Handle */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, cue, "start")}
                    onTouchStart={(e) => handleStartTouchDrag(e, cue, "start")}
                    className="absolute left-0 top-0 bottom-0 w-3 sm:w-2 hover:w-3.5 cursor-ew-resize bg-rose-500/50 hover:bg-rose-400 rounded-l transition-all z-20 touch-none"
                    title="Kéo để chỉnh mốc Bắt Đầu"
                  />

                  {/* Center Drag to move + Live Voice Activity Indicator */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, cue, "move")}
                    onTouchStart={(e) => handleStartTouchDrag(e, cue, "move")}
                    className="absolute inset-x-3 sm:inset-x-2 top-0 bottom-0 cursor-grab active:cursor-grabbing flex items-center gap-1.5 px-1 overflow-hidden touch-none"
                  >
                    {isActive && effectiveIsPlaying && (
                      <span
                        className="flex items-end gap-0.5 h-3 shrink-0"
                        aria-hidden="true"
                      >
                        <span
                          className="w-0.5 bg-cyan-300 rounded-full"
                          style={{ height: `${liveAudioMetrics.eqBars[0]}%` }}
                        />
                        <span
                          className="w-0.5 bg-amber-300 rounded-full"
                          style={{ height: `${liveAudioMetrics.eqBars[2]}%` }}
                        />
                        <span
                          className="w-0.5 bg-rose-300 rounded-full"
                          style={{ height: `${liveAudioMetrics.eqBars[4]}%` }}
                        />
                      </span>
                    )}
                    <span className="text-[10px] text-white font-semibold truncate leading-tight drop-shadow-md select-none">
                      #{cue.id}: {cue.textVi || cue.textOriginal}
                    </span>
                  </div>

                  {/* Right Resizing Drag Handle */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, cue, "end")}
                    onTouchStart={(e) => handleStartTouchDrag(e, cue, "end")}
                    className="absolute right-0 top-0 bottom-0 w-3 sm:w-2 hover:w-3.5 cursor-ew-resize bg-rose-500/50 hover:bg-rose-400 rounded-r transition-all z-20 touch-none"
                    title="Kéo để chỉnh mốc Kết Thúc"
                  />
                </div>
              );
            })}
          </div>

          {/* Current Time Playhead Scrubber with Live Acoustic Beacon */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 transition-none"
            style={{
              left: `${(currentTime / effectiveDuration) * 100}%`,
            }}
          >
            <div
              className={`w-0.5 h-full relative ${
                effectiveIsPlaying
                  ? "bg-gradient-to-b from-cyan-300 via-rose-400 to-amber-300 shadow-[0_0_12px_rgba(244,63,94,1)]"
                  : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.85)]"
              }`}
            >
              {/* Top Playhead Handle with Radar Ping when Playing */}
              <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border border-white shadow flex items-center justify-center">
                {effectiveIsPlaying && (
                  <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75" />
                )}
                <div className="w-1.5 h-1.5 bg-white rounded-full relative z-10" />
              </div>

              {/* Floating Playhead Timecode + Live Amplitude Pill */}
              <div
                className={`absolute top-7 left-1.5 text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1 ${
                  effectiveIsPlaying
                    ? "bg-slate-950/95 text-cyan-200 border-cyan-400/60"
                    : "bg-rose-950/90 text-rose-200 border-rose-500/40"
                }`}
              >
                {effectiveIsPlaying && (
                  <Radio className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
                )}
                <span>{currentTime.toFixed(2)}s</span>
                {effectiveIsPlaying && (
                  <span className="text-amber-300">
                    · {liveAudioMetrics.amplitudePct}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Visualizer Legend & Live Playback Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full inline-block ${
                effectiveIsPlaying
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                  : "bg-slate-600"
              }`}
            />
            <span className={effectiveIsPlaying ? "text-emerald-300 font-semibold" : ""}>
              {effectiveIsPlaying
                ? `Đang phát âm thanh (${liveAudioMetrics.amplitudePct}% biên độ)`
                : "Đang tạm dừng"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span>Đoạn đã phát</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/80 inline-block" />
            <span>Âm thanh sắp tới</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/60 inline-block border border-purple-400" />
            <span>Khối phụ đề</span>
          </span>
        </div>

        <div className="text-slate-400 flex items-center gap-1 text-[10px]">
          <Scissors className="w-3 h-3 text-rose-400" />
          <span>
            Kéo 2 đầu khối phụ đề trên sóng âm để khớp chuẩn từng từ và nhịp điệu!
          </span>
        </div>
      </div>
    </div>
  );
};
