import { MongoVideoProjectDocument } from "./schemas";

class MongoProjectsRepository {
  private projects: MongoVideoProjectDocument[] = [
    {
      _id: "6710a98c4f1e290012a88101",
      projectCode: "PRJ-VIETSUB-4K-01",
      ownerUserId: "USR-309412",
      title: "Tập 12: Hành Trình Vượt Thời Gian (Bilingual ASS + 4-Role TTS)",
      sourcePlatform: "douyin",
      resolution: "4K",
      durationSeconds: 412,
      renderEngine: "ffmpeg_wasm_client",
      storageBucketUri: "r2://hendy-media-prod/projects/PRJ-VIETSUB-4K-01.mp4",
      waveformPeaksCount: 16480,
      subtitleCuesCount: 184,
      status: "completed",
      updatedAt: new Date(Date.now() - 900 * 1000).toISOString(),
    },
    {
      _id: "6710a98c4f1e290012a88102",
      projectCode: "PRJ-VIETSUB-4K-02",
      ownerUserId: "6138197737",
      title: "Phim Tài Liệu Khoa Học AI & Sinh Học Phân Tử (Thuyết Minh Đa Vai)",
      sourcePlatform: "youtube",
      resolution: "4K",
      durationSeconds: 785,
      renderEngine: "server_ffmpeg_cluster",
      storageBucketUri: "r2://hendy-media-prod/projects/PRJ-VIETSUB-4K-02.mp4",
      waveformPeaksCount: 31400,
      subtitleCuesCount: 342,
      status: "completed",
      updatedAt: new Date(Date.now() - 300 * 1000).toISOString(),
    },
    {
      _id: "6710a98c4f1e290012a88103",
      projectCode: "PRJ-VIETSUB-HD-03",
      ownerUserId: "USR-104982",
      title: "Short Review Công Nghệ Mới Nhất (TikTok 9:16 Safe-Zone)",
      sourcePlatform: "tiktok",
      resolution: "1080p",
      durationSeconds: 68,
      renderEngine: "ffmpeg_wasm_client",
      storageBucketUri: "r2://hendy-media-prod/projects/PRJ-VIETSUB-HD-03.mp4",
      waveformPeaksCount: 2720,
      subtitleCuesCount: 39,
      status: "ready",
      updatedAt: new Date().toISOString(),
    },
  ];

  public listProjects(): MongoVideoProjectDocument[] {
    return this.projects;
  }

  public createProject(
    partial: Partial<MongoVideoProjectDocument>
  ): MongoVideoProjectDocument {
    const doc: MongoVideoProjectDocument = {
      _id: `6710a98c${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      projectCode: `PRJ-VIETSUB-${Math.floor(100 + Math.random() * 899)}`,
      ownerUserId: partial.ownerUserId || "USR-309412",
      title: partial.title || "Dự Án Vietsub & Lồng Tiếng AI Mới",
      sourcePlatform: partial.sourcePlatform || "local_upload",
      resolution: partial.resolution || "4K",
      durationSeconds: partial.durationSeconds || 180,
      renderEngine: partial.renderEngine || "ffmpeg_wasm_client",
      storageBucketUri: `r2://hendy-media-prod/projects/${Date.now()}.mp4`,
      waveformPeaksCount: 7200,
      subtitleCuesCount: partial.subtitleCuesCount || 64,
      status: "ready",
      updatedAt: new Date().toISOString(),
    };
    this.projects.unshift(doc);
    return doc;
  }
}

export const mongoProjectsRepo = new MongoProjectsRepository();
