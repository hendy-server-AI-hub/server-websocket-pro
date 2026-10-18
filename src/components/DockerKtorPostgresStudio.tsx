import React, { useState, useEffect } from "react";
import {
  Database,
  Server,
  Terminal,
  Copy,
  Check,
  Download,
  RefreshCw,
  Play,
  Layers,
  HardDrive,
  Code2,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  ADMIN_ID,
  MINI_APP_URL,
  WEB_APP_URL,
  CORE_BACKEND_URL,
  BRANDS,
  HENDY_BOT_FULL_SOURCE_CODE,
  sendAdminCommandViaKtorClient,
} from "../services/telegramHendyBot";

interface DockerKtorPostgresStudioProps {
  onOpenTelegramBot?: () => void;
  onOpenPipelineConsole?: () => void;
  onNotify?: (text: string, type?: "success" | "error" | "info") => void;
}

const DOCKER_COMPOSE_CONTENT = `# =============================================================================
# HENDY STUDIO VIETSUB PRO & TELEGRAM CYBERTECH 2026
# Detailed Multi-Service Docker Compose Configuration
# Integrating PostgreSQL 16 + Kotlin Ktor Backend Server + Vietsub Studio Web
# + Telegram Bot Hendy Cybertech (ADMIN_ID: 6138197737) + Redis Cache
# =============================================================================

name: hendy-studio-vietsub-pro

services:
  # 1. POSTGRESQL 16 RELATIONAL DATABASE
  postgres:
    image: postgres:16-alpine
    container_name: hendy_vietsub_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-hendy_admin}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-hendy_secure_2026}
      POSTGRES_DB: \${POSTGRES_DB:-hendy_vietsub_db}
      PGDATA: /var/lib/postgresql/data/pgdata
      TZ: Asia/Ho_Chi_Minh
    command:
      - "postgres"
      - "-c"
      - "max_connections=200"
      - "-c"
      - "shared_buffers=256MB"
      - "-c"
      - "effective_cache_size=768MB"
    ports:
      - "\${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/db-migrations/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    networks:
      - hendy_cybertech_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $\${POSTGRES_USER:-hendy_admin} -d $\${POSTGRES_DB:-hendy_vietsub_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. KTOR BACKEND SERVER (Kotlin 2.1 + Ktor 3.6.0 Netty + Exposed ORM + FFmpeg)
  ktor-backend:
    build:
      context: ./integrated-pipeline
      dockerfile: Dockerfile
    container_name: hendy_ktor_backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      PORT: "8080"
      PUBLIC_BASE_URL: \${KTOR_PUBLIC_URL:-http://localhost:8080}
      DATABASE_URL: jdbc:postgresql://postgres:5432/\${POSTGRES_DB:-hendy_vietsub_db}
      POSTGRES_HOST: postgres
      POSTGRES_PORT: "5432"
      POSTGRES_DB: \${POSTGRES_DB:-hendy_vietsub_db}
      POSTGRES_USER: \${POSTGRES_USER:-hendy_admin}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-hendy_secure_2026}
      REDIS_URL: redis://redis:6379
      TELEGRAM_BOT_TOKEN: \${BOT_TOKEN:-8517026315:AAELCCiSvwQb-9AWi0VRRMQvT7Pf6rAZzP8}
      TELEGRAM_ADMIN_IDS: \${ADMIN_ID:-6138197737}
      MINI_APP_URL: \${MINI_APP_URL:-https://ngogiaidy56-eng.github.io/BOT-TELE}
      WEB_APP_URL: \${WEB_APP_URL:-https://telegram-mini-app.ngogiaidy56.workers.dev}
      CORE_BACKEND_URL: \${CORE_BACKEND_URL:-http://vietsub-studio-web:3000}
      FFMPEG_BIN: /usr/bin/ffmpeg
      WORK_DIR: /app/server/data
    ports:
      - "\${KTOR_PORT:-8080}:8080"
    volumes:
      - ktor_pipeline_data:/app/server/data
      - ffmpeg_render_cache:/tmp/vietsub-renders
    networks:
      - hendy_cybertech_net
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 5

  # 3. VIETSUB STUDIO WEB & NODE.JS CORE GATEWAY
  vietsub-studio-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hendy_vietsub_studio_web
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      ktor-backend:
        condition: service_started
    environment:
      NODE_ENV: production
      PORT: "3000"
      DATABASE_URL: postgresql://\${POSTGRES_USER:-hendy_admin}:\${POSTGRES_PASSWORD:-hendy_secure_2026}@postgres:5432/\${POSTGRES_DB:-hendy_vietsub_db}
      KTOR_BACKEND_URL: http://ktor-backend:8080
      ADMIN_ID: \${ADMIN_ID:-6138197737}
      BOT_TOKEN: \${BOT_TOKEN:-8517026315:AAELCCiSvwQb-9AWi0VRRMQvT7Pf6rAZzP8}
      MINI_APP_URL: \${MINI_APP_URL:-https://ngogiaidy56-eng.github.io/BOT-TELE}
      WEB_APP_URL: \${WEB_APP_URL:-https://telegram-mini-app.ngogiaidy56.workers.dev}
      CORE_BACKEND_URL: \${CORE_BACKEND_URL:-https://telegram-mini-app.ngogiaidy56.workers.dev}
    ports:
      - "\${WEB_PORT:-3000}:3000"
    networks:
      - hendy_cybertech_net

  # 4. REDIS 7.2 CACHE & OTP / SESSION STATE STORE
  redis:
    image: redis:7.2-alpine
    container_name: hendy_vietsub_redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
    ports:
      - "\${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    networks:
      - hendy_cybertech_net

volumes:
  postgres_data:
  redis_data:
  ktor_pipeline_data:
  ffmpeg_render_cache:

networks:
  hendy_cybertech_net:
    driver: bridge
    name: hendy_cybertech_net`;

const POSTGRES_INIT_SQL = `-- =============================================================================
-- HENDY STUDIO VIETSUB PRO & TELEGRAM CYBERTECH 2026
-- PostgreSQL 16 Schema & Seed Migration (infrastructure/db-migrations/init.sql)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS telegram_users (
    chat_id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(128),
    first_name VARCHAR(128) NOT NULL DEFAULT 'Khách',
    vip_level INTEGER NOT NULL DEFAULT 0,
    balance BIGINT NOT NULL DEFAULT 50000,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    won_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    history JSONB NOT NULL DEFAULT '["Khởi tạo tài khoản (+50,000 VNĐ)"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_user_states (
    chat_id VARCHAR(64) PRIMARY KEY REFERENCES telegram_users(chat_id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    brand VARCHAR(32),
    platform VARCHAR(32),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_linked_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(64) NOT NULL REFERENCES telegram_users(chat_id) ON DELETE CASCADE,
    brand VARCHAR(32) NOT NULL,
    account_identifier VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_account_kho (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(64) NOT NULL REFERENCES telegram_users(chat_id) ON DELETE CASCADE,
    brand VARCHAR(32) NOT NULL,
    acc_credentials TEXT NOT NULL,
    is_checked BOOLEAN NOT NULL DEFAULT TRUE,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telegram_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(64) NOT NULL REFERENCES telegram_users(chat_id) ON DELETE CASCADE,
    tx_type VARCHAR(32) NOT NULL,
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    platform VARCHAR(32),
    target_link TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vietsub_pipeline_jobs (
    job_id VARCHAR(64) PRIMARY KEY,
    chat_id VARCHAR(64) REFERENCES telegram_users(chat_id) ON DELETE SET NULL,
    video_title VARCHAR(255) NOT NULL DEFAULT 'Untitled Video',
    source_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'NOMINAL',
    verdict VARCHAR(32) NOT NULL DEFAULT 'RELEASE_UNLOCKED',
    target_lang VARCHAR(16) NOT NULL DEFAULT 'vi',
    cues_count INTEGER NOT NULL DEFAULT 0,
    cues_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ktor_bot_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL DEFAULT 'Hendy_Admin',
    action VARCHAR(64) NOT NULL DEFAULT 'ADMIN_COMPOSE_COMMAND',
    command VARCHAR(255) NOT NULL,
    client_sdk VARCHAR(64) NOT NULL DEFAULT 'ComposeWeb-TMA-KtorClient',
    response_status INTEGER NOT NULL DEFAULT 200,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO telegram_users (chat_id, username, first_name, vip_level, balance, is_admin)
VALUES ('6138197737', 'hendy_admin', 'Hendy Admin', 0, 50000, TRUE)
ON CONFLICT (chat_id) DO NOTHING;`;

const KTOR_SERVER_CODE = `// integrated-pipeline/server/src/main/kotlin/com/example/server/Application.kt
// Kotlin 2.1 + Ktor 3.6.0 Netty + PostgreSQL 16 (HikariCP + Exposed ORM)
package com.example.server

import com.example.server.config.AppConfig
import com.example.server.routes.apiRoutes
import com.example.server.service.*
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database
import io.ktor.server.application.*
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.routing.*
import io.ktor.server.request.receive
import io.ktor.server.response.respond

fun main() {
    val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
    embeddedServer(Netty, port = port, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun configurePostgresDatabase(config: AppConfig) {
    val hikariConfig = HikariConfig().apply {
        jdbcUrl = config.databaseUrl
        driverClassName = "org.postgresql.Driver"
        username = config.postgresUser
        password = config.postgresPassword
        maximumPoolSize = 15
        isAutoCommit = false
        transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        validate()
    }
    Database.connect(HikariDataSource(hikariConfig))
}`;

const RAILWAY_JSON_CONTENT = `{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}`;

const RENDER_YAML_CONTENT = `# Render.com Infrastructure-as-Code Blueprint
# Deploy Hendy Studio Vietsub Pro with automated CI/CD
services:
  - type: web
    name: hendy-studio-vietsub-pro
    runtime: node
    plan: free
    region: singapore
    branch: main
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: GEMINI_API_KEY
        sync: false`;

export const DockerKtorPostgresStudio: React.FC<DockerKtorPostgresStudioProps> = ({
  onOpenTelegramBot,
  onOpenPipelineConsole,
  onNotify,
}) => {
  const [activeFileTab, setActiveFileTab] = useState<
    | "docker_compose"
    | "postgres_sql"
    | "ktor_server"
    | "telegram_worker"
    | "railway_json"
    | "render_yaml"
  >("docker_compose");
  const [copied, setCopied] = useState(false);

  // Live state from /api/infrastructure/stack, /api/telegram/bot-state, and /api/edge/security-cache-status
  const [stackData, setStackData] = useState<any>(null);
  const [botState, setBotState] = useState<any>(null);
  const [edgeStatus, setEdgeStatus] = useState<any>(null);
  const [hmacVerifyOutput, setHmacVerifyOutput] = useState<any>(null);
  const [isLoadingStack, setIsLoadingStack] = useState(false);

  // Interactive Kho Acc & Ktor Trigger controls
  const [selectedBrand, setSelectedBrand] = useState<string>("RR88");
  const [newAccInput, setNewAccInput] = useState<string>("");
  const [ktorCommandInput, setKtorCommandInput] = useState<string>("SYNC_POSTGRES_KHO_AND_PIPELINE");
  const [ktorResponseMsg, setKtorResponseMsg] = useState<string>("");
  const [isTriggeringKtor, setIsTriggeringKtor] = useState(false);

  const fetchStackAndBotState = async () => {
    setIsLoadingStack(true);
    try {
      const [stackRes, botRes, edgeRes] = await Promise.all([
        fetch("/api/infrastructure/stack"),
        fetch("/api/telegram/bot-state"),
        fetch("/api/edge/security-cache-status"),
      ]);
      const sData = await stackRes.json();
      const bData = await botRes.json();
      const eData = await edgeRes.json();
      if (sData.ok) setStackData(sData);
      if (bData.ok) setBotState(bData);
      if (eData.ok) setEdgeStatus(eData);
    } catch (err) {
      // Fallback if offline
    } finally {
      setIsLoadingStack(false);
    }
  };

  const handleRunEdgeHmacVerification = async () => {
    try {
      const res = await fetch("/api/edge/verify-hmac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: ktorCommandInput || "ZERO_TRUST_EDGE_VERIFY",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setHmacVerifyOutput(data);
        onNotify?.(data.message, "success");
        await fetchStackAndBotState();
      }
    } catch (err: any) {
      onNotify?.("Lỗi xác thực HMAC: " + err.message, "error");
    }
  };

  const handleFlushEdgeKvCache = async () => {
    try {
      const res = await fetch("/api/edge/cache-flush", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        onNotify?.(data.message, "info");
        await fetchStackAndBotState();
      }
    } catch {}
  };

  useEffect(() => {
    fetchStackAndBotState();
  }, []);

  const getCurrentCodeContent = () => {
    if (activeFileTab === "docker_compose") return DOCKER_COMPOSE_CONTENT;
    if (activeFileTab === "postgres_sql") return POSTGRES_INIT_SQL;
    if (activeFileTab === "ktor_server") return KTOR_SERVER_CODE;
    if (activeFileTab === "railway_json") return RAILWAY_JSON_CONTENT;
    if (activeFileTab === "render_yaml") return RENDER_YAML_CONTENT;
    return HENDY_BOT_FULL_SOURCE_CODE;
  };

  const getCurrentFileName = () => {
    if (activeFileTab === "docker_compose") return "docker-compose.yml";
    if (activeFileTab === "postgres_sql") return "init.sql";
    if (activeFileTab === "ktor_server") return "Application.kt";
    if (activeFileTab === "railway_json") return "railway.json";
    if (activeFileTab === "render_yaml") return "render.yaml";
    return "telegram-hendy-bot-worker.js";
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCurrentCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotify?.(`Đã sao chép nội dung ${getCurrentFileName()} vào bộ nhớ tạm!`, "success");
  };

  const handleDownloadFile = () => {
    const blob = new Blob([getCurrentCodeContent()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getCurrentFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify?.(`Đã tải xuống tệp ${getCurrentFileName()}!`, "success");
  };

  const handleExecuteKtorCommand = async () => {
    setIsTriggeringKtor(true);
    try {
      const res = await sendAdminCommandViaKtorClient(ktorCommandInput, ADMIN_ID);
      setKtorResponseMsg(res.message || `200 OK — Executed ${ktorCommandInput}`);
      onNotify?.(`Ktor Client đã thực thi lệnh "${ktorCommandInput}" thành công!`, "success");
      await fetchStackAndBotState();
    } catch (e: any) {
      setKtorResponseMsg(`Lỗi: ${e.message}`);
    } finally {
      setIsTriggeringKtor(false);
    }
  };

  const handleKhoAction = async (action: "add_kho" | "check_kho" | "clear_kho") => {
    if (action === "add_kho" && !newAccInput.trim()) {
      onNotify?.("Vui lòng nhập thông tin Tài khoản | Mật khẩu trước khi thêm vào kho.", "error");
      return;
    }
    try {
      const res = await fetch("/api/telegram/kho-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: ADMIN_ID,
          action,
          brand: selectedBrand,
          value: newAccInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        if (action === "add_kho") setNewAccInput("");
        onNotify?.(data.message, "success");
        await fetchStackAndBotState();
      }
    } catch (err: any) {
      onNotify?.("Lỗi cập nhật Kho Acc: " + err.message, "error");
    }
  };

  const adminProfile = botState?.users?.[ADMIN_ID] || {
    name: "Hendy Admin",
    balance: 50000,
    accountKho: {},
    linkedAccounts: {},
    history: [],
  };

  const selectedBrandKhoList: Array<{ acc: string; checked: boolean }> =
    adminProfile.accountKho?.[selectedBrand] || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Top Architecture Header Bar */}
      <div className="p-5 rounded-2xl bg-[#11151F] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
            <span>Hạ tầng Container & Cơ sở dữ liệu</span>
            <span>·</span>
            <span className="font-mono">PostgreSQL 16 + Ktor 3.6 + Telegram Cybertech</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Docker Compose, PostgreSQL & Ktor Backend Server
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Cấu hình kiến trúc đa dịch vụ tích hợp cơ sở dữ liệu quan hệ PostgreSQL 16, máy chủ Ktor Backend (Kotlin 2.1 Netty), Redis 7.2 và Bot Telegram Hendy Cybertech 2026 (ADMIN_ID: <span className="font-mono text-slate-200">{ADMIN_ID}</span>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={fetchStackAndBotState}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStack ? "animate-spin text-cyan-400" : ""}`} />
            <span>Làm mới Trạng thái</span>
          </button>

          {onOpenPipelineConsole && (
            <button
              onClick={onOpenPipelineConsole}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-cyan-300 transition cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Ktor Pipeline Gate</span>
            </button>
          )}

          {onOpenTelegramBot && (
            <button
              onClick={onOpenTelegramBot}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24A1DE] hover:bg-[#1f8fc5] text-white text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mở Bot Telegram</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Service Container Topology Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-bold text-white">PostgreSQL 16</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">5432:5432</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Image: <span className="font-mono text-slate-300">postgres:16-alpine</span> · DB:{" "}
            <span className="font-mono text-slate-300">hendy_vietsub_db</span> · 7 bảng dữ liệu quan hệ & Kho Acc.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
            <span>Users: {stackData?.databaseSummary?.telegramUsersCount ?? 1}</span>
            <span>Kho Acc: {stackData?.databaseSummary?.totalKhoAccounts ?? 0}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11151F] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Ktor Backend</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">8080:8080</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kotlin 2.1 + Ktor 3.6.0 Netty + Exposed ORM + HikariCP + FFmpeg Hardsub Worker.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
            <span>SDK: KtorClient</span>
            <span>Triggers: {stackData?.databaseSummary?.ktorTriggerLogsCount ?? 1}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11151F] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-bold text-white">Vietsub Studio Web</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">3000:3000</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Node.js 20 + Express + Vite React SPA + Auto-Sync Audio Engine + 5s Preview Export.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
            <span>Webhook: /api/telegram</span>
            <span>Status: 200 OK</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11151F] border border-white/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Redis 7.2 Cache</span>
            </div>
            <span className="text-xs font-mono text-emerald-400">6379:6379</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Image: <span className="font-mono text-slate-300">redis:7.2-alpine</span> · Lưu đệm TTS WAV, OTP 6 ký tự & trạng thái <span className="font-mono text-slate-300">userStates</span>.
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
            <span>Policy: allkeys-lru</span>
            <span>AOF: Enabled</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left = Code & Config Inspector, Right = Live Ktor Bridge & PostgreSQL Kho Acc Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Configuration & Source Code Viewer */}
        <div className="lg:col-span-7 bg-[#11151F] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-[#0B0E14]">
            {/* Segmented Tab Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-white/5 overflow-x-auto">
              <button
                onClick={() => setActiveFileTab("docker_compose")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFileTab === "docker_compose"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                docker-compose.yml
              </button>
              <button
                onClick={() => setActiveFileTab("postgres_sql")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFileTab === "postgres_sql"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                init.sql (PostgreSQL)
              </button>
              <button
                onClick={() => setActiveFileTab("ktor_server")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFileTab === "ktor_server"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Application.kt (Ktor)
              </button>
              <button
                onClick={() => setActiveFileTab("telegram_worker")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFileTab === "telegram_worker"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Bot Hendy Worker.js
              </button>
              <button
                onClick={() => setActiveFileTab("railway_json")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFileTab === "railway_json"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                railway.json
              </button>
              <button
                onClick={() => setActiveFileTab("render_yaml")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFileTab === "render_yaml"
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                render.yaml
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã chép" : "Sao chép"}</span>
              </button>
              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp</span>
              </button>
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-950/60 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Tệp đang xem: {getCurrentFileName()}</span>
            <span>UTF-8 · Production Ready</span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 bg-[#090B10] overflow-x-auto overflow-y-auto max-h-[540px] leading-relaxed select-all">
            {getCurrentCodeContent()}
          </pre>
        </div>

        {/* Right 5 Columns: Ktor Client Bridge, Cloudflare Edge HMAC/KV & PostgreSQL Kho Acc Manager */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 0: Tier 2 Cloud Edge Computing — Web Crypto HMAC-SHA256 & Edge KV Cache */}
          <div className="p-5 rounded-2xl bg-[#11151F] border border-cyan-500/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Cloudflare Edge: HMAC-SHA256 & Transient KV Cache</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Web Crypto API Zero-Trust DDoS Verification & AI Response KV Caching
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                HIT RATIO: {edgeStatus?.edgeKvCache?.hitRatioPercent ?? 86}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#090B10] border border-white/5">
                <div className="text-[10px] text-slate-400">HMAC Verified</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">
                  {edgeStatus?.edgeSecurity?.verifiedRequestsCount ?? 12} reqs
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090B10] border border-white/5">
                <div className="text-[10px] text-slate-400">KV Cache Hits</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {edgeStatus?.edgeKvCache?.hits ?? 18} HIT
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090B10] border border-white/5">
                <div className="text-[10px] text-slate-400">KV Entries</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">
                  {edgeStatus?.edgeKvCache?.entriesCount ?? 2} keys
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunEdgeHmacVerification}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Kiểm thử Web Crypto HMAC-SHA256</span>
              </button>
              <button
                type="button"
                onClick={handleFlushEdgeKvCache}
                className="py-2 px-3 rounded-xl bg-[#090B10] hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Xóa KV Cache
              </button>
            </div>

            {hmacVerifyOutput && (
              <div className="p-2.5 rounded-xl bg-[#090B10] border border-cyan-500/30 text-[11px] font-mono text-cyan-300 space-y-1">
                <div className="text-emerald-400 font-bold">
                  ✓ {hmacVerifyOutput.algorithm} ZERO-TRUST VERIFIED
                </div>
                <div className="truncate">
                  Edge Sig: {hmacVerifyOutput.edgeSignature}
                </div>
                <div className="truncate">
                  TMA Hash: {hmacVerifyOutput.telegramWebAppHash}
                </div>
              </div>
            )}
          </div>

          {/* Card 1: Ktor Client Web Target Bridge (/api/bot-trigger) */}
          <div className="p-5 rounded-2xl bg-[#11151F] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Cầu Nối Ktor Client & Core Backend</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thực thi hàm <span className="font-mono text-slate-300">sendAdminCommandViaKtorClient</span> xuống{" "}
                  <span className="font-mono text-cyan-300">/api/bot-trigger</span>
                </p>
              </div>
              <span className="text-xs font-mono text-amber-300">ID: {ADMIN_ID}</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-[#090B10] p-3 rounded-xl border border-white/5">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">MINI_APP_URL:</span>
                <a
                  href={MINI_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline truncate flex items-center gap-1"
                >
                  <span>ngogiaidy56-eng.github.io/BOT-TELE</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">WEB_APP_URL:</span>
                <span className="text-slate-200 truncate">{WEB_APP_URL}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">CORE_BACKEND:</span>
                <span className="text-emerald-400 truncate">{CORE_BACKEND_URL}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ktorCommandInput}
                onChange={(e) => setKtorCommandInput(e.target.value)}
                placeholder="Nhập lệnh Ktor Admin..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#090B10] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleExecuteKtorCommand}
                disabled={isTriggeringKtor}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Gửi Lệnh Ktor</span>
              </button>
            </div>

            {ktorResponseMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                {ktorResponseMsg}
              </div>
            )}
          </div>

          {/* Card 2: PostgreSQL & Bot Kho Acc Synchronizer */}
          <div className="p-5 rounded-2xl bg-[#11151F] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Quản Lý Kho Acc Liên Minh (KJC • KJC Cũ • ABCVIP)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đồng bộ trực tiếp với bảng <span className="font-mono text-slate-300">telegram_account_kho</span> & Bot Hendy
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 tabular-nums">
                Ví: {(adminProfile.balance || 50000).toLocaleString("vi-VN")} đ
              </span>
            </div>

            {/* Brand Selector Grid */}
            <div className="flex flex-wrap gap-1.5">
              {BRANDS.map((b) => {
                const count = (adminProfile.accountKho?.[b] || []).length;
                const isSelected = selectedBrand === b;
                return (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-[#090B10] text-slate-300 hover:text-white border border-white/10"
                    }`}
                  >
                    {b} ({count})
                  </button>
                );
              })}
            </div>

            {/* Add Account to Selected Brand Kho */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAccInput}
                onChange={(e) => setNewAccInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleKhoAction("add_kho")}
                placeholder={`Nhập Tài khoản | Mật khẩu cho kho ${selectedBrand}...`}
                className="flex-1 px-3 py-2 rounded-xl bg-[#090B10] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleKhoAction("add_kho")}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Acc</span>
              </button>
            </div>

            {/* Kho List & Actions */}
            <div className="p-3 rounded-xl bg-[#090B10] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Kho <strong className="text-white">{selectedBrand}</strong>:{" "}
                  <span className="font-mono tabular-nums">{selectedBrandKhoList.length}/50</span> tài khoản
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleKhoAction("check_kho")}
                    className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Check Kho</span>
                  </button>
                  <button
                    onClick={() => handleKhoAction("clear_kho")}
                    className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa Kho</span>
                  </button>
                </div>
              </div>

              {selectedBrandKhoList.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  Kho {selectedBrand} hiện chưa có tài khoản nào. Nhập ở trên hoặc thêm qua Bot Telegram.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1">
                  {selectedBrandKhoList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#11151F] text-xs font-mono text-slate-200"
                    >
                      <span className="truncate">
                        {idx + 1}. {item.acc}
                      </span>
                      <span className="text-emerald-400 text-[11px] shrink-0">
                        {item.checked ? "Đã check" : "Chờ duyệt"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
