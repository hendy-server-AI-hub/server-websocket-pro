-- =============================================================================
-- [TẦNG 6] HENDY STUDIO PRO - POSTGRESQL 16 RBAC, BILLING & AUDIT SCHEMA
-- Database: database/postgres-rbac/schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Roles & Permissions (RBAC Control Plane)
CREATE TABLE IF NOT EXISTS rbac_roles (
    role_id VARCHAR(64) PRIMARY KEY,
    role_name VARCHAR(128) NOT NULL,
    plane_access VARCHAR(64) NOT NULL DEFAULT 'USER_PLANE', -- 'ADMIN_CONTROL_PLANE' | 'USER_PLANE'
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users Account Table
CREATE TABLE IF NOT EXISTS studio_users (
    user_id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    role_id VARCHAR(64) NOT NULL REFERENCES rbac_roles(role_id),
    plan_id VARCHAR(64) NOT NULL DEFAULT 'starter_free',
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active' | 'suspended' | 'pending_verification'
    telegram_id VARCHAR(64),
    allowed_cidr VARCHAR(64) DEFAULT '0.0.0.0/0',
    monthly_render_minutes_used INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subscription Plans & Quotas
CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id VARCHAR(64) PRIMARY KEY,
    plan_name VARCHAR(128) NOT NULL,
    monthly_price_vnd INT NOT NULL DEFAULT 0,
    annual_price_vnd INT NOT NULL DEFAULT 0,
    max_resolution VARCHAR(32) NOT NULL DEFAULT '1080p',
    max_render_minutes INT NOT NULL DEFAULT 120,
    ffmpeg_wasm_local BOOLEAN NOT NULL DEFAULT TRUE,
    multi_role_ai_tts BOOLEAN NOT NULL DEFAULT FALSE,
    admin_gateway_access BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. System Feature Flags (Tầng 0 Admin Control Plane)
CREATE TABLE IF NOT EXISTS system_feature_flags (
    flag_key VARCHAR(128) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    target_tier VARCHAR(64) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    rollout_percentage INT NOT NULL DEFAULT 100,
    description TEXT NOT NULL,
    updated_by VARCHAR(64) NOT NULL DEFAULT '6138197737',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Immutable Security & Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id VARCHAR(64) NOT NULL,
    actor_domain VARCHAR(128) NOT NULL DEFAULT 'admin.hendystudio.net',
    actor_ip VARCHAR(64) NOT NULL DEFAULT '10.240.0.10',
    action_type VARCHAR(128) NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    payload_diff JSONB NOT NULL DEFAULT '{}'::jsonb,
    hmac_signature VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_users_role ON studio_users(role_id);
