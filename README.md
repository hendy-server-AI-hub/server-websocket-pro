# 🏛️ HENDY STUDIO PRO - MASTER ARCHITECTURE & SECURE SEPARATION BLUEPRINT (7 TẦNG HỆ THỐNG)

> **Hendy Video Studio Vietsub New Pro** — Hệ sinh thái biên tập video AI, tự động bóc băng giọng nói, dịch thuật phụ đề ngữ cảnh tiếng Việt, lồng tiếng đa nhân vật và kết xuất Hardsub 4K với kiến trúc **7 Tầng tách biệt bảo mật tuyệt đối** giữa Mặt Phẳng Quản Trị (`admin.hendystudio.net`) và Mặt Phẳng Người Dùng (`https://hendy-video-studio-new-pro.onrender.com`).

---

## 🏛️ Sơ Đồ Kiến Trúc 7 Tầng Hệ Thống

### [TẦNG 0] MẶT PHẲNG QUẢN TRỊ & VẬN HÀNH (ADMIN CONTROL PLANE - CÁCH LY BẢO MẬT TUYỆT ĐỐI)
- **`apps/admin-web/`**: Giao diện quản trị độc lập (`https://admin.hendystudio.net` · IP tĩnh `10.240.0.10:8443` · Gateway `/admin-console/network-gateway`). Quản lý User, Gói cước thương mại, Cấu hình hệ thống, Feature Flags, RBAC Control và Cross-Platform Build Studio (Windows 10/11 32-bit & 64-bit).
- **Monitoring & Observability**: Grafana / Prometheus (CPU/RAM Metrics), Sentry (Báo cáo lỗi JS, Crash UI), ELK Stack (Thu thập & lọc Log hệ thống).
- **DevOps & CI/CD Pipeline**: GitHub Actions Workflows (`.github/workflows/release-master.yml`, `deploy-cloudflare.yml`, `mobile-native-build.yml`), Docker Multi-stage, Zero-downtime Deployment.

### [TẦNG 1] CLIENT TIER (MẶT PHẲNG NGƯỜI DÙNG)
- **Web Studio**: `https://hendy-video-studio-new-pro.onrender.com` (`apps/studio-web/`).
- **Multiplatform Launchers**: Telegram Mini App (TMA & Bot), Native Desktop (Windows 10 & 11 32-bit x86 / 64-bit x64, macOS, Linux) & Mobile Apps (`integrated-pipeline/androidApp` Media3 ExoPlayer, `integrated-pipeline/iosApp` AVKit AVPlayer).

### [TẦNG 2] FRONTEND ENGINE (`packages/ui-components` & `apps/studio-web/`)
- **Redux State (`apps/studio-web/state/studioReduxStore.ts`)**: Quản lý trạng thái đồng bộ phụ đề và timeline.
- **FFmpeg.wasm (`apps/studio-web/engine/ffmpegWasmEngine.ts`)**: Kết xuất Hardsub MP4 trực tiếp trên trình duyệt.
- **DOM Virtualization (`packages/ui-components/FrontendEngineInteractiveBench.tsx`)**: Hiển thị mượt 10.000+ dòng phụ đề ở tốc độ 60 FPS.
- **Web Workers (`apps/studio-web/workers/audioWaveWorker.ts`)**: Giải mã sóng âm thanh đa luồng không gây nghẽn giao diện.

### [TẦNG 3] CLOUD EDGE (`workers/cloudflare-edge/`)
- Cloudflare Workers, Web Application Firewall (WAF), Edge Caching, xác thực chữ ký Web Crypto API HMAC-SHA256 và cách ly mạng CIDR.

### [TẦNG 4] BACKEND ORCHESTRATION (`services/api-gateway/` & `server.ts`)
- Express API Gateway (`server.ts`, `services/api-gateway/controlPlaneRouter.ts`), Ktor Backend (`integrated-pipeline/server/`), Redis Pub/Sub, BullMQ Message Queue.

### [TẦNG 5] AI & WORKERS (`services/ai-worker/`)
- Whisper AI / Gemini ASR (Bóc băng âm thanh), Gemini Contextual Vietsub (Dịch thuật điện ảnh), 4-Role Multi-Speaker TTS, FFmpeg Cloud Hardsub & Python Pipeline Agents.

### [TẦNG 6] DATA & STORAGE TIER (`database/`)
- **PostgreSQL (`database/postgres-rbac/`)**: Lưu trữ hệ thống định danh, gói cước giao dịch, Feature Flags và phân quyền RBAC kèm Audit Log bất biến.
- **MongoDB (`database/mongo-projects/`)**: Lưu trữ mảng Data Timeline và trạng thái Project phụ đề linh hoạt.
- **AWS S3 / Cloudflare R2**: Lưu trữ Object Storage (Video MP4, Audio WAV/AAC, Phụ đề SRT/ASS, Assets).

---

## 📂 Cấu Trúc Thư Mục Monorepo Thực Tế

```text
hendy-video-studio-vietsub-new-pro/
├── .github/
│   └── workflows/
│       ├── release-master.yml         # Master CI/CD Pipeline (Build, Test, Multi-platform deploy)
│       ├── deploy-cloudflare.yml      # Automated Cloudflare Workers & Pages deployment
│       └── mobile-native-build.yml    # Fastlane integration for Android (.aab/.apk) & iOS (.ipa)
├── apps/                              # [TẦNG 0 & TẦNG 1] TÁCH BIỆT HOÀN TOÀN GIAO DIỆN
│   ├── admin-web/                     # [TẦNG 0] Ứng dụng quản trị độc lập (admin.hendystudio.net)
│   │   ├── src/                       # Chứa mã nguồn DockerKtorWorkspace & AdminControlPlaneSuite
│   │   └── package.json
│   └── studio-web/                    # [TẦNG 1] Ứng dụng User độc lập (https://hendy-video-studio-new-pro.onrender.com)
│       ├── src/                       # Chứa StudioWorkspace, StudioHomePage, VideoPlayer, SubtitleList
│       └── package.json
├── packages/                          # MÃ NGUỒN DÙNG CHUNG (Tối ưu tái sử dụng)
│   ├── ui-components/                 # Thư viện UI, Player, Subtitle Virtualization dùng chung
│   └── core-utils/                    # Tiện ích chung, hàm hỗ trợ CIDR & Timecode
├── integrated-pipeline/               # [TẦNG 1, 4, 5] MULTIPLATFORM INTEGRATED PIPELINE (KMP & AGENTS)
│   ├── androidApp/                    # Native Android application launcher (Media3 ExoPlayer)
│   ├── iosApp/                        # Native iOS application launcher (Swift & AVKit AVPlayer)
│   ├── desktopApp/                    # Native JVM Desktop application (Compose Desktop)
│   ├── composeApp/                    # Shared Compose Multiplatform UI module
│   └── core/                          # Cross-platform KMP Core Business
├── workers/
│   └── cloudflare-edge/               # [TẦNG 3] Cloudflare Workers WAF & Edge Security
├── services/
│   ├── api-gateway/                   # [TẦNG 4] Express Control Plane & API Gateway
│   └── ai-worker/                     # [TẦNG 5] BullMQ, Gemini AI & FFmpeg Cloud Worker
├── database/
│   ├── postgres-rbac/                 # [TẦNG 6] PostgreSQL RBAC, Billing & Audit Logs
│   └── mongo-projects/                # [TẦNG 6] MongoDB Video Timelines & Subtitle States
└── render.yaml                        # Cấu hình triển khai tự động trên Render.com
```

---

## 🚀 Triển Khai Trên Render.com (`https://hendy-video-studio-new-pro.onrender.com/`)

- **Build Command**: `npm install --include=dev && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`
- **Admin Control Plane Gateway**: `/admin-console/network-gateway` (hoặc tab **Tầng 0: Control Plane & Kiến Trúc 7 Tầng**).

## 2026-10 — Tách giao diện và Cloudflare Infrastructure Console

Monorepo hiện có ba HTML entry point được build từ Vite:

- `/` — ứng dụng Vietsub Studio tích hợp hiện có.
- `/admin.html` — giao diện Hendy Admini độc lập (`apps/admin-web/index.html`, `src/main.jsx`, `src/styles.css`).
- `/studio.html` — giao diện biên tập Studio độc lập (`apps/studio-web/index.html`, `src/main.jsx`, `src/styles.css`).

Mã nguồn React hiện hữu trong `src/`, `admin-web/`, `studio-web/` và `hendy-Admini/` được giữ lại để giảm rủi ro hồi quy; các entrypoint mới chỉ tách shell, HTML, CSS và điểm khởi chạy, không thay thế lõi biên tập video.

### Cloudflare infrastructure module

- Console assets: `apps/cloudflare-console/public/`.
- Read-only control Worker: `services/cloudflare-control-api/worker/index.mjs`.
- Security tests: `services/cloudflare-control-api/test/worker.test.js`.
- Worker configuration: `services/cloudflare-control-api/wrangler.jsonc`.
- Deployment workflow: `.github/workflows/cloudflare-control-api.yml`.

Commands from the repository root:

```bash
npm ci
npm run dev:admin
npm run dev:studio
npm run check:cloudflare
npm run deploy:cloudflare:dry-run
```

The Cloudflare module is deployed separately from the root Studio application. Create GitHub Environment `cloudflare-production` and set the secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ACCESS_ISSUER`, `ACCESS_AUD`, and `CF_API_READ_TOKEN`. The deployment token and runtime read-only API token must be separate. Configure a Cloudflare Access application/policy for the console hostname before exposing it to administrators. `/healthz` is a liveness endpoint, not proof that authenticated inventory access is working.

This repository change does not by itself deploy to Cloudflare, Render, or GitHub. Run tests, validate the Wrangler bundle, and verify the Access-protected staging hostname before promoting to production.

### Admin origin access enforcement

The Express origin now validates the `Cf-Access-Jwt-Assertion` JWT for `/admin.html`, the legacy `/admin-console` entry route, and the `/api/admin-control-plane`, `/api/admin-gateway`, and `/api/hendy-admini` APIs. Set `ADMIN_ACCESS_ISSUER` and `ADMIN_ACCESS_AUD` to the Cloudflare Access application used for the admin hostname, and `ADMIN_ACCESS_EMAILS` to a comma-separated allowlist of administrator email addresses in the Render/production environment. Missing issuer/audience/allowlist fails closed (HTTP 503); missing or invalid JWTs receive HTTP 401, and valid but non-allowlisted identities receive HTTP 403. `ADMIN_ACCESS_ALLOW_LOCAL_DEV=true` is only for local development on loopback hosts and must remain disabled in production. The Cloudflare infrastructure console has its own `ACCESS_ISSUER` and `ACCESS_AUD` because it can be protected by a separate Access application.
Write operations derive the audit actor from the verified Access JWT (`email`/`sub`), not from a browser-supplied `actorId`. The legacy gateway HMAC secret is read from `DEDICATED_ADMIN_GATEWAY_SECRET`; the endpoint fails closed when it is unset.
For the public Cloudflare Pages deployment, use `npm run build:pages`; it builds the main Studio and `/studio.html` entrypoints but omits the standalone `/admin.html` entry. The Render/origin build (`npm run build`) includes the admin entry, whose HTML and admin APIs are protected by the server-side Cloudflare Access verifier. Configure Access on the admin hostname as an additional edge policy; do not expose the origin admin app without the issuer, audience, and admin email allowlist configured.

## Release notes — monorepo refactor v2.9.0-rc.1

- `apps/admin-web/index.html` and `apps/studio-web/index.html` now provide independent Vite entrypoints with dedicated `src/main.jsx` and `src/styles.css` files while reusing the existing React feature components.
- `apps/cloudflare-console/` and `services/cloudflare-control-api/` keep the Cloudflare-only inventory console and Worker separate from the Vietsub processing API.
- Admin API routes require a verified Cloudflare Access JWT and an explicit `ADMIN_ACCESS_EMAILS` allowlist. The old hard-coded `ADMIN2026` API bypass was removed. Set `ADMIN_ACCESS_ISSUER`, `ADMIN_ACCESS_AUD`, `ADMIN_ACCESS_EMAILS` and a high-entropy `DEDICATED_ADMIN_GATEWAY_SECRET` in the production environment.
- Local access bypass is opt-in (`ADMIN_ACCESS_ALLOW_LOCAL_DEV=true`), only applies to development mode, and requires both a loopback host and loopback socket peer. Never enable a production bypass.
- `npm run check:cloudflare` runs the Cloudflare Worker and Access middleware tests. `npm run build` builds all entrypoints; `npm run build:pages` omits the dedicated admin HTML entry for the public Pages build. Deploy the admin interface behind Cloudflare Access at the origin/proxy as well.
- Release candidate validation in the build workspace: 16/16 Node tests passed; a TypeScript/JSX transpile syntax scan covered 149 files with no syntax diagnostics; package/lockfile and Wrangler JSON syntax matched. Full Vite build and npm audit have not been verified because this environment could not download dependencies from the npm registry. No account-backed Cloudflare/GitHub deployment was performed.
