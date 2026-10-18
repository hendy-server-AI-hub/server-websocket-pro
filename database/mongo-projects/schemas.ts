// =============================================================================
// [TẦNG 6] HENDY STUDIO PRO - MONGODB DOCUMENT SCHEMAS (PROJECTS & SUBTITLES)
// Database: database/mongo-projects/schemas.ts
// =============================================================================

export interface MongoSubtitleSegment {
  cueId: string;
  index: number;
  startTime: number;
  endTime: number;
  originalText: string;
  translatedViText: string;
  speakerRole: "male" | "female" | "elder" | "child";
  confidenceScore: number;
}

export interface MongoVideoProjectDocument {
  _id: string;
  projectCode: string;
  ownerUserId: string;
  title: string;
  sourcePlatform: "local_upload" | "tiktok" | "youtube" | "douyin" | "reels";
  resolution: "1080p" | "4K";
  durationSeconds: number;
  renderEngine: "ffmpeg_wasm_client" | "server_ffmpeg_cluster";
  storageBucketUri: string;
  waveformPeaksCount: number;
  subtitleCuesCount: number;
  status: "ready" | "rendering" | "completed";
  updatedAt: string;
}
