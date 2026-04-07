import { clearSession, getAccessToken } from '@/lib/auth';

export type TaskStatus = 'PENDING' | 'PROCESSING' | 'DONE';

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assignedUserId: string;
  assignedUser?: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actionType: string;
  targetTaskId?: string | null;
  dataBefore?: Record<string, unknown> | null;
  dataAfter?: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
  };
  targetTask?: {
    id: string;
    title: string;
    status: TaskStatus;
    description?: string | null;
    assignedUserId: string;
    assignedUser?: {
      id: string;
      email: string;
      name: string;
    } | null;
  } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const fallbackMessage = `${response.status} ${response.statusText}`;
    let message = fallbackMessage;

    try {
      const errorPayload = await response.json();
      message = errorPayload?.message || fallbackMessage;
    } catch {
      message = fallbackMessage;
    }

    if (response.status === 401) {
      clearSession();
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return apiRequest<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getTasks(page = 1, limit = 10) {
  return apiRequest<PaginatedResponse<Task>>(`/tasks?page=${page}&limit=${limit}`);
}

export async function getTask(id: string) {
  return apiRequest<Task>(`/tasks/${id}`);
}

export async function createTask(payload: {
  title: string;
  description?: string;
  assignedUserId?: string;
}) {
  return apiRequest<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTask(id: string, payload: {
  title?: string;
  description?: string;
  assignedUserId?: string;
  status?: TaskStatus;
}) {
  return apiRequest<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return apiRequest<Task>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteTask(id: string) {
  return apiRequest<{ message: string }>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function getAuditLogs(page = 1, limit = 10) {
  return apiRequest<PaginatedResponse<AuditLog>>(
    `/audit?page=${page}&limit=${limit}`,
  );
}

export async function getUsers() {
  return apiRequest<AppUser[]>('/users');
}

export async function getMyProfile() {
  return apiRequest<Profile>('/users/me');
}

export async function updateMyProfile(payload: { name: string }) {
  return apiRequest<Profile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiRequest<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
