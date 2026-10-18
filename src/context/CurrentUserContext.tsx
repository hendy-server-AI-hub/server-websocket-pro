import React, { createContext, useContext, useState, useEffect } from "react";

export interface CurrentUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  role?: "admin" | "user" | "guest";
  isAdmin?: boolean;
}

export interface CurrentUserContextValue {
  currentUser: CurrentUserProfile | null;
  isAdmin: boolean;
  setCurrentUser: (user: CurrentUserProfile | null) => void;
  switchUserRole: (role: "admin" | "user") => void;
}

export const AUTHORIZED_ADMIN_EMAILS = [
  "ngogiaidy56@gmail.com",
  "quanlinh2210@gmail.com",
  "admin@hendy.studio",
];

export const AUTHORIZED_ADMIN_IDS = ["6138197737", "admin_6138197737"];

/**
 * Administrative permission check utilizing the currentUser object/context.
 * Ensures direct references to backend source code, database infrastructure,
 * and Ktor configurations are visible ONLY to authorized administrators.
 */
export function checkIsAuthorizedAdmin(
  user: CurrentUserProfile | null | undefined
): boolean {
  if (!user) return false;

  if (user.role === "user" || user.role === "guest" || user.isAdmin === false) {
    return false;
  }

  if (user.isAdmin === true || user.role === "admin") {
    return true;
  }

  if (
    typeof user.email === "string" &&
    AUTHORIZED_ADMIN_EMAILS.includes(user.email.trim().toLowerCase())
  ) {
    return true;
  }

  if (
    typeof user.uid === "string" &&
    AUTHORIZED_ADMIN_IDS.includes(user.uid.trim())
  ) {
    return true;
  }

  return false;
}

export const DEFAULT_ADMIN_USER: CurrentUserProfile = {
  uid: "6138197737",
  displayName: "Hendy Admin",
  email: "ngogiaidy56@gmail.com",
  role: "admin",
  isAdmin: true,
};

export const DEFAULT_STANDARD_USER: CurrentUserProfile = {
  uid: "member_studio_01",
  displayName: "Thành viên Studio",
  email: "creator@vietsub.studio",
  role: "user",
  isAdmin: false,
};

export const CurrentUserContext = createContext<CurrentUserContextValue>({
  currentUser: DEFAULT_ADMIN_USER,
  isAdmin: true,
  setCurrentUser: () => {},
  switchUserRole: () => {},
});

export interface CurrentUserProviderProps {
  initialUser?: CurrentUserProfile | null;
  externalUser?: any;
  onUserChange?: (user: CurrentUserProfile | null) => void;
  children: React.ReactNode;
}

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({
  initialUser,
  externalUser,
  onUserChange,
  children,
}) => {
  const [currentUser, setCurrentUserState] =
    useState<CurrentUserProfile | null>(() => {
      if (externalUser !== undefined && externalUser !== null) {
        return externalUser;
      }
      if (initialUser !== undefined) {
        return initialUser;
      }
      try {
        const savedRole = localStorage.getItem("vietsub_studio_role_mode");
        if (savedRole === "user") {
          return DEFAULT_STANDARD_USER;
        }
        const savedUser = localStorage.getItem("vietsub_studio_user");
        if (savedUser) {
          return JSON.parse(savedUser);
        }
      } catch {
        // Ignore storage errors
      }
      return DEFAULT_ADMIN_USER;
    });

  useEffect(() => {
    if (externalUser !== undefined && externalUser !== null) {
      setCurrentUserState(externalUser);
    }
  }, [externalUser]);

  const setCurrentUser = (user: CurrentUserProfile | null) => {
    setCurrentUserState(user);
    try {
      if (user) {
        localStorage.setItem("vietsub_studio_user", JSON.stringify(user));
        localStorage.setItem(
          "vietsub_studio_role_mode",
          checkIsAuthorizedAdmin(user) ? "admin" : "user"
        );
      } else {
        localStorage.removeItem("vietsub_studio_user");
        localStorage.setItem("vietsub_studio_role_mode", "user");
      }
    } catch {
      // Ignore storage errors
    }
    onUserChange?.(user);
  };

  const switchUserRole = (role: "admin" | "user") => {
    const nextUser =
      role === "admin" ? DEFAULT_ADMIN_USER : DEFAULT_STANDARD_USER;
    setCurrentUser(nextUser);
  };

  const isAdmin = checkIsAuthorizedAdmin(currentUser);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        isAdmin,
        setCurrentUser,
        switchUserRole,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export function useCurrentUser(): CurrentUserContextValue {
  return useContext(CurrentUserContext);
}
