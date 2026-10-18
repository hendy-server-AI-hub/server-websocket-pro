export type WorkspaceId =
  | "home"
  | "editor"
  | "voiceover"
  | "translator"
  | "telegram"
  | "cloud-sync";

export interface WorkspaceMetadata {
  id: WorkspaceId;
  number: string;
  label: string;
  shortLabel: string;
  breadcrumb: string;
  description: string;
  directoryPath: string;
}

export const WORKSPACE_REGISTRY: Record<WorkspaceId, WorkspaceMetadata> = {
  home: {
    id: "home",
    number: "00",
    label: "Trang chủ Studio",
    shortLabel: "Trang chủ",
    breadcrumb: "Hendy Studio / Trang chủ",
    description: "Tổng quan các không gian làm việc và khởi tạo dự án nhanh",
    directoryPath: "src/workspaces/home",
  },
  editor: {
    id: "editor",
    number: "01",
    label: "Biên tập Phụ đề & Sóng âm",
    shortLabel: "Biên tập Video",
    breadcrumb: "Không gian làm việc / Biên tập Phụ đề & Sóng âm",
    description: "Căn chỉnh phụ đề tự động theo giọng nói (Auto-Sync) và xuất thử video 5 giây",
    directoryPath: "src/workspaces/editor",
  },
  voiceover: {
    id: "voiceover",
    number: "02",
    label: "Phòng thu Lồng tiếng Đa giọng",
    shortLabel: "Lồng tiếng AI",
    breadcrumb: "Không gian làm việc / Phòng thu Lồng tiếng Đa giọng",
    description: "Phân vai nhân vật tự động, điều chỉnh tốc độ đọc và hòa âm giảm nhạc nền",
    directoryPath: "src/workspaces/voiceover",
  },
  translator: {
    id: "translator",
    number: "03",
    label: "Dịch Liên kết & Đa ngôn ngữ",
    shortLabel: "Dịch đa năng",
    breadcrumb: "Không gian làm việc / Dịch Liên kết & Đa ngôn ngữ",
    description: "Nhập video từ mạng xã hội, quét chữ OCR và chuyển ngữ phụ đề sang 10 thứ tiếng",
    directoryPath: "src/workspaces/translator",
  },
  telegram: {
    id: "telegram",
    number: "04",
    label: "Trợ lý Telegram & Kho Tài khoản",
    shortLabel: "Trợ lý Telegram",
    breadcrumb: "Không gian làm việc / Trợ lý Telegram & Kho Tài khoản",
    description: "Tương tác trực tiếp với trợ lý tự động, quản lý liên kết và kho tài khoản",
    directoryPath: "src/workspaces/telegram",
  },
  "cloud-sync": {
    id: "cloud-sync",
    number: "05",
    label: "Đồng bộ Dữ liệu & Dịch vụ",
    shortLabel: "Đồng bộ Đám mây",
    breadcrumb: "Không gian làm việc / Đồng bộ Dữ liệu & Dịch vụ",
    description: "Quản lý dữ liệu người dùng, lịch sử phiên làm việc và trạng thái kết nối dịch vụ",
    directoryPath: "src/workspaces/cloud-sync",
  },
};

export const WORKSPACE_LIST: WorkspaceMetadata[] = [
  WORKSPACE_REGISTRY.editor,
  WORKSPACE_REGISTRY.voiceover,
  WORKSPACE_REGISTRY.translator,
  WORKSPACE_REGISTRY.telegram,
  WORKSPACE_REGISTRY["cloud-sync"],
];
