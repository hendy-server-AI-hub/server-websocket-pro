// =============================================================================
// ⚡ TỆP ĐƯỢC KHỞI TẠO TỰ ĐỘNG BỞI TRÌNH ĐỒNG BỘ (scripts/auto-sync-workspaces.js)
// Liên kết trực tiếp /hendy-Admini, /studio-web và /admin-web vào /src/App.tsx.
// =============================================================================

export * from "../../hendy-Admini";
export * from "../../studio-web";
export * from "../../admin-web";

export const WORKSPACE_AUTO_SYNC_MANIFEST = {
  hendyAdminiDirectory: "/hendy-Admini",
  studioWebDirectory: "/studio-web",
  adminWebDirectory: "/admin-web",
  hendyAdminiModules: ["HendyAdminiConfig","HendyAdminiLiveIde","ResponsiveViewportShell"],
  hendyAdminiLayerModules: ["allLayersManager"],
  studioModules: ["StudioConfig","StudioEditorLayout","StudioModalsContainer","StudioQuickActionBar","StudioToolsDrawer"],
  adminModules: ["AdminConfig","AdminPortalGateway"],
  status: "SYNCHRONIZED_OK",
} as const;
