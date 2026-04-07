export type UserRole = 'ADMIN' | 'USER';

const TOKEN_KEY = 'tm_token';
const ROLE_KEY = 'tm_role';
const TOKEN_COOKIE = 'tm_token';
const ROLE_COOKIE = 'tm_role';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

export function setSession(accessToken: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = decodeJwtPayload(accessToken);
  const role = payload?.role ?? 'USER';

  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(ROLE_KEY, role);

  setCookie(TOKEN_COOKIE, accessToken);
  setCookie(ROLE_COOKIE, role);
}

export function getRoleFromToken(token: string | null): UserRole | null {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  return payload?.role ?? null;
}

export function getSessionFromStorage() {
  if (typeof window === 'undefined') {
    return { token: null as string | null, role: null as UserRole | null };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const role = (localStorage.getItem(ROLE_KEY) as UserRole | null) ??
    getRoleFromToken(token);

  return { token, role };
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);

  clearCookie(TOKEN_COOKIE);
  clearCookie(ROLE_COOKIE);
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRole(): UserRole | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return (localStorage.getItem(ROLE_KEY) as UserRole | null) ?? null;
}
