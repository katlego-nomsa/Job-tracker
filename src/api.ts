import type { Job, JobInput, StoredUser } from "./types";

// The server address lives in ONE place so it is easy to change.
export const BASE_URL = "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getUsersByName(username: string) {
  return request<StoredUser[]>(`/users?username=${encodeURIComponent(username)}`);
}

export function findUser(username: string, password: string) {
  return request<StoredUser[]>(
    `/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  );
}

export function createUser(user: { username: string; password: string }) {
  return request<StoredUser>("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function updateUserPassword(id: number, password: string) {
  return request<StoredUser>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}
export function getJobsForUser(userId: number) {
  return request<Job[]>(`/jobs?userId=${userId}`);
}

export function getJob(id: string) {
  return request<Job>(`/jobs/${encodeURIComponent(id)}`);
}

export function createJob(job: JobInput & { userId: number }) {
  return request<Job>("/jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export function updateJob(id: number, changes: Partial<JobInput>) {
  return request<Job>(`/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function deleteJob(id: number) {
  return request<Record<string, never>>(`/jobs/${id}`, { method: "DELETE" });
}