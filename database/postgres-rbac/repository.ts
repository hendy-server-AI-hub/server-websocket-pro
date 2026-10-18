import crypto from "crypto";

export interface RbacUserRecord {
  userId: string;
  email: string;
  displayName: string;
  role: "SUPER_ADMIN" | "OPS_ADMIN" | "STUDIO_PRO" | "CREATOR_FREE";
  planeAccess: "ADMIN_CONTROL_PLANE" | "USER_PLANE";
  planId: "starter_free" | "studio_pro" | "enterprise_agency";
  status: "active" | "suspended";
  telegramId: string;
  allowedCidr: string;
  monthlyRenderMinutesUsed: number;
  lastLoginAt: string;
}

export interface SubscriptionPlanRecord {
  planId: "starter_free" | "studio_pro" | "enterprise_agency";
  planName: string;
  monthlyPriceVnd: number;
  annualPriceVnd: number;
  maxResolution: "1080p" | "4K Ultra HD 60fps";
  maxRenderMinutes: number;
  ffmpegWasmLocal: boolean;
  multiRoleAiTts: boolean;
  adminGatewayAccess: boolean;
  activeSubscribers: number;
}

export interface SystemFeatureFlagRecord {
  flagKey: string;
  title: string;
  targetTier: string;
  enabled: boolean;
  rolloutPercentage: number;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AdminAuditLogRecord {
  auditId: string;
  actorId: string;
  actorDomain: string;
  actorIp: string;
  actionType: string;
  targetResource: string;
  detail: string;
  hmacSignature: string;
  createdAt: string;
}

export interface SystemConfigState {
  adminControlPlaneDomain: string;
  userPlaneDomain: string;
  staticAdminIp: string;
  allowedCidrs: string[];
  zeroDowntimeDeployMode: "rolling-canary" | "blue-green";
  maxConcurrentFfmpegWorkers: number;
  geminiModelDefault: string;
  wafStrictHmacVerification: boolean;
}

class PostgresRbacRepository {
  private users: RbacUserRecord[] = [
    {
      userId: "6138197737",
      email: "admin@hendystudio.net",
      displayName: "Hendy Principal Architect",
      role: "SUPER_ADMIN",
      planeAccess: "ADMIN_CONTROL_PLANE",
      planId: "enterprise_agency",
      status: "active",
      telegramId: "6138197737",
      allowedCidr: "10.240.0.0/16",
      monthlyRenderMinutesUsed: 482,
      lastLoginAt: new Date().toISOString(),
    },
    {
      userId: "USR-884120",
      email: "ops.sec@hendystudio.net",
      displayName: "DevSecOps SRE Controller",
      role: "OPS_ADMIN",
      planeAccess: "ADMIN_CONTROL_PLANE",
      planId: "enterprise_agency",
      status: "active",
      telegramId: "5192837410",
      allowedCidr: "172.16.88.0/24",
      monthlyRenderMinutesUsed: 195,
      lastLoginAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    },
    {
      userId: "USR-309412",
      email: "director@cinema-vietsub.vn",
      displayName: "Studio Media Team Lead",
      role: "STUDIO_PRO",
      planeAccess: "USER_PLANE",
      planId: "studio_pro",
      status: "active",
      telegramId: "7019283412",
      allowedCidr: "0.0.0.0/0",
      monthlyRenderMinutesUsed: 340,
      lastLoginAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    {
      userId: "USR-104982",
      email: "creator.indie@gmail.com",
      displayName: "Minh Anh Creator",
      role: "CREATOR_FREE",
      planeAccess: "USER_PLANE",
      planId: "starter_free",
      status: "active",
      telegramId: "8491023941",
      allowedCidr: "0.0.0.0/0",
      monthlyRenderMinutesUsed: 45,
      lastLoginAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    },
  ];

  private plans: SubscriptionPlanRecord[] = [
    {
      planId: "starter_free",
      planName: "Creator Free (Khởi Đầu)",
      monthlyPriceVnd: 0,
      annualPriceVnd: 0,
      maxResolution: "1080p",
      maxRenderMinutes: 60,
      ffmpegWasmLocal: true,
      multiRoleAiTts: false,
      adminGatewayAccess: false,
      activeSubscribers: 4280,
    },
    {
      planId: "studio_pro",
      planName: "Studio Pro (Chuyên Nghiệp)",
      monthlyPriceVnd: 199000,
      annualPriceVnd: 159000,
      maxResolution: "4K Ultra HD 60fps",
      maxRenderMinutes: 1500,
      ffmpegWasmLocal: true,
      multiRoleAiTts: true,
      adminGatewayAccess: false,
      activeSubscribers: 1194,
    },
    {
      planId: "enterprise_agency",
      planName: "Agency Enterprise (Doanh Nghiệp)",
      monthlyPriceVnd: 599000,
      annualPriceVnd: 479000,
      maxResolution: "4K Ultra HD 60fps",
      maxRenderMinutes: 10000,
      ffmpegWasmLocal: true,
      multiRoleAiTts: true,
      adminGatewayAccess: true,
      activeSubscribers: 168,
    },
  ];

  private featureFlags: SystemFeatureFlagRecord[] = [
    {
      flagKey: "tier0_strict_plane_isolation",
      title: "Tầng 0: Cách Ly Tuyệt Đối Mặt Phẳng Quản Trị (Admin Control Plane)",
      targetTier: "TẦNG 0 · ADMIN CONTROL PLANE",
      enabled: true,
      rolloutPercentage: 100,
      description:
        "Tách biệt hoàn toàn tên miền admin.hendystudio.net và ẩn toàn bộ mã nguồn/Ktor/DB khỏi User Plane.",
      updatedBy: "6138197737",
      updatedAt: new Date().toISOString(),
    },
    {
      flagKey: "tier2_ffmpeg_wasm_local_render",
      title: "Tầng 2: FFmpeg.wasm Multi-threaded Client Render (SharedArrayBuffer)",
      targetTier: "TẦNG 2 · FRONTEND ENGINE",
      enabled: true,
      rolloutPercentage: 100,
      description:
        "Kết xuất phụ đề cứng ASS/SRT trực tiếp trên trình duyệt người dùng qua WebAssembly.",
      updatedBy: "6138197737",
      updatedAt: new Date().toISOString(),
    },
    {
      flagKey: "tier2_dom_virtualization_subtitles",
      title: "Tầng 2: DOM Virtualization & Web Worker Audio Waveform",
      targetTier: "TẦNG 2 · FRONTEND ENGINE",
      enabled: true,
      rolloutPercentage: 100,
      description:
        "Ảo hóa danh sách 10,000+ dòng phụ đề ở tốc độ 60fps và giải mã sóng âm bằng Web Worker riêng.",
      updatedBy: "6138197737",
      updatedAt: new Date().toISOString(),
    },
    {
      flagKey: "tier3_cloudflare_edge_hmac_waf",
      title: "Tầng 3: Cloudflare Worker HMAC-SHA256 Zero-Trust WAF",
      targetTier: "TẦNG 3 · EDGE GATEWAY",
      enabled: true,
      rolloutPercentage: 100,
      description:
        "Xác thực chữ ký điện tử HMAC-SHA256 và giới hạn tần suất (Rate Limiting) ngay tại biên Cloudflare.",
      updatedBy: "6138197737",
      updatedAt: new Date().toISOString(),
    },
    {
      flagKey: "tier5_gemini_4role_voiceover",
      title: "Tầng 5: Gemini AI Pipeline (ASR + Dịch Thuật + TTS 4 Phân Vai)",
      targetTier: "TẦNG 5 · AI MEDIA PIPELINE",
      enabled: true,
      rolloutPercentage: 100,
      description:
        "Điều phối hàng đợi BullMQ/Redis cho nhận diện giọng nói, dịch ngữ cảnh và lồng tiếng Nam/Nữ/Già/Trẻ.",
      updatedBy: "6138197737",
      updatedAt: new Date().toISOString(),
    },
  ];

  private systemConfig: SystemConfigState = {
    adminControlPlaneDomain: "https://admin.hendystudio.net",
    userPlaneDomain: "https://hendy-video-studio-new-pro.onrender.com",
    staticAdminIp: "10.240.0.10:8443",
    allowedCidrs: [
      "10.240.0.0/16",
      "172.16.88.0/24",
      "192.168.1.0/24",
      "10.0.0.0/8",
      "127.0.0.1/32",
    ],
    zeroDowntimeDeployMode: "rolling-canary",
    maxConcurrentFfmpegWorkers: 8,
    geminiModelDefault: "gemini-3.8-flash",
    wafStrictHmacVerification: true,
  };

  private auditLogs: AdminAuditLogRecord[] = [
    {
      auditId: "AUD-9001",
      actorId: "system-bootstrap",
      actorDomain: "admin.hendystudio.net",
      actorIp: "10.240.0.10",
      actionType: "BLUEPRINT_7_TIER_INITIALIZED",
      targetResource: "system/master-architecture",
      detail:
        "Khởi tạo kiến trúc 7 tầng Hendy Studio Pro với cách ly bảo mật tuyệt đối Tầng 0 (admin.hendystudio.net) và Tầng 1-6 (hendy-video-studio-new-pro.onrender.com).",
      hmacSignature: crypto
        .createHmac("sha256", "HENDY_AUDIT_SECRET")
        .update("AUD-9001")
        .digest("hex")
        .slice(0, 24),
      createdAt: new Date(Date.now() - 600 * 1000).toISOString(),
    },
    {
      auditId: "AUD-9002",
      actorId: "system-bootstrap",
      actorDomain: "admin.hendystudio.net",
      actorIp: "10.240.0.10",
      actionType: "CIDR_FIREWALL_POLICY_SYNC",
      targetResource: "network-gateway/cidr-rules",
      detail:
        "Đồng bộ tường lửa CIDR (10.240.0.0/16, 172.16.88.0/24, 192.168.1.0/24) trên cổng xác thực /api/admin-gateway/verify-access.",
      hmacSignature: crypto
        .createHmac("sha256", "HENDY_AUDIT_SECRET")
        .update("AUD-9002")
        .digest("hex")
        .slice(0, 24),
      createdAt: new Date(Date.now() - 180 * 1000).toISOString(),
    },
  ];

  public getOverview() {
    return {
      users: this.users,
      plans: this.plans,
      featureFlags: this.featureFlags,
      systemConfig: this.systemConfig,
      auditLogs: this.auditLogs,
    };
  }

  public toggleFeatureFlag(flagKey: string, actorId = "system-bootstrap") {
    const flag = this.featureFlags.find((f) => f.flagKey === flagKey);
    if (!flag) return null;
    flag.enabled = !flag.enabled;
    flag.updatedBy = actorId;
    flag.updatedAt = new Date().toISOString();

    this.appendAuditLog(
      actorId,
      "FEATURE_FLAG_TOGGLED",
      `feature_flags/${flagKey}`,
      `Chuyển trạng thái cờ '${flag.title}' sang ${flag.enabled ? "ENABLED" : "DISABLED"}.`
    );
    return flag;
  }

  public updateUserRoleAndPlan(
    userId: string,
    role: RbacUserRecord["role"],
    planId: RbacUserRecord["planId"],
    status: RbacUserRecord["status"] = "active",
    actorId = "system-bootstrap"
  ) {
    const user = this.users.find((u) => u.userId === userId);
    if (!user) return null;
    user.role = role;
    user.planeAccess =
      role === "SUPER_ADMIN" || role === "OPS_ADMIN"
        ? "ADMIN_CONTROL_PLANE"
        : "USER_PLANE";
    user.planId = planId;
    user.status = status;

    this.appendAuditLog(
      actorId,
      "USER_RBAC_UPDATED",
      `studio_users/${userId}`,
      `Cập nhật quyền User ${user.email}: Role=${role} (${user.planeAccess}), Plan=${planId}, Status=${status}.`
    );
    return user;
  }

  public updateSubscriptionPlan(
    planId: SubscriptionPlanRecord["planId"],
    monthlyPriceVnd: number,
    annualPriceVnd: number,
    maxRenderMinutes: number,
    actorId = "system-bootstrap"
  ) {
    const plan = this.plans.find((p) => p.planId === planId);
    if (!plan) return null;
    plan.monthlyPriceVnd = monthlyPriceVnd;
    plan.annualPriceVnd = annualPriceVnd;
    plan.maxRenderMinutes = maxRenderMinutes;

    this.appendAuditLog(
      actorId,
      "SUBSCRIPTION_PLAN_UPDATED",
      `subscription_plans/${planId}`,
      `Cập nhật gói cước ${plan.planName}: ${monthlyPriceVnd.toLocaleString("vi-VN")}đ/tháng, hạn mức ${maxRenderMinutes} phút.`
    );
    return plan;
  }

  public updateSystemConfig(
    partial: Partial<SystemConfigState>,
    actorId = "system-bootstrap"
  ) {
    this.systemConfig = {
      ...this.systemConfig,
      ...partial,
    };
    this.appendAuditLog(
      actorId,
      "SYSTEM_CONFIG_UPDATED",
      "system/config",
      `Cập nhật cấu hình hệ thống Tầng 0 (${this.systemConfig.adminControlPlaneDomain} -> ${this.systemConfig.userPlaneDomain}).`
    );
    return this.systemConfig;
  }

  public appendAuditLog(
    actorId: string,
    actionType: string,
    targetResource: string,
    detail: string,
    actorIp = "10.240.0.10"
  ): AdminAuditLogRecord {
    const auditId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    const hmacSignature = crypto
      .createHmac("sha256", "HENDY_AUDIT_SECRET")
      .update(`${auditId}|${actorId}|${actionType}|${Date.now()}`)
      .digest("hex")
      .slice(0, 24);
    const entry: AdminAuditLogRecord = {
      auditId,
      actorId,
      actorDomain: this.systemConfig.adminControlPlaneDomain,
      actorIp,
      actionType,
      targetResource,
      detail,
      hmacSignature,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 50) {
      this.auditLogs.pop();
    }
    return entry;
  }
}

export const postgresRbacRepo = new PostgresRbacRepository();
