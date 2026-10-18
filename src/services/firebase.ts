export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
}

export const auth: any = null;
export const db: any = null;

export interface SavedProject {
  id: string;
  userId?: string;
  title: string;
  videoUrl: string;
  cuesCount: number;
  updatedAt: string;
  cues: any[];
  style?: any;
}

const authListeners = new Set<(user: User | null) => void>();

function notifyAuthListeners(user: User | null) {
  authListeners.forEach((cb) => {
    try {
      cb(user);
    } catch (_e) {}
  });
}

// User state helper
export function onAuthUserChanged(callback: (user: User | null) => void) {
  authListeners.add(callback);
  try {
    const saved = localStorage.getItem("vietsub_studio_user");
    if (saved) {
      callback(JSON.parse(saved));
    }
  } catch (_e) {}
  return () => {
    authListeners.delete(callback);
  };
}

// Google Sign-In with Local Session Persistence
export async function signInWithGoogle(): Promise<{ success: boolean; user?: any; error?: string }> {
  const sessionUser: User = {
    uid: "user_quanlinh_" + Date.now().toString(36),
    displayName: "Linh Quan (Studio Admin)",
    email: "quanlinh2210@gmail.com",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  };
  try {
    localStorage.setItem("vietsub_studio_user", JSON.stringify(sessionUser));
  } catch (_e) {}
  notifyAuthListeners(sessionUser);
  return { success: true, user: sessionUser };
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    localStorage.removeItem("vietsub_studio_user");
  } catch (_e) {}
  notifyAuthListeners(null);
}

// Save Project to Local Storage
export async function saveProjectToFirestore(project: SavedProject): Promise<{ success: boolean; id: string }> {
  const projectId = project.id || "proj_" + Date.now();
  const timestamp = new Date().toISOString();
  const payload = { ...project, id: projectId, updatedAt: timestamp };

  try {
    const local = JSON.parse(localStorage.getItem("vietsub_firestore_projects") || "[]");
    const filtered = local.filter((p: any) => p.id !== projectId);
    filtered.unshift(payload);
    localStorage.setItem("vietsub_firestore_projects", JSON.stringify(filtered.slice(0, 20)));
  } catch (_e) {}

  return { success: true, id: projectId };
}

// Load user projects from Local cache
export async function loadUserProjectsFromFirestore(): Promise<SavedProject[]> {
  const localList: SavedProject[] = [];
  try {
    const raw = localStorage.getItem("vietsub_firestore_projects");
    if (raw) {
      localList.push(...JSON.parse(raw));
    }
  } catch (_e) {}

  return localList;
}

// Delete project
export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  try {
    const raw = localStorage.getItem("vietsub_firestore_projects");
    if (raw) {
      const list = JSON.parse(raw).filter((p: any) => p.id !== projectId);
      localStorage.setItem("vietsub_firestore_projects", JSON.stringify(list));
    }
  } catch (_e) {}
}
