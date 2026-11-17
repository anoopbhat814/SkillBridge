import type { ApiError } from "@skillbridge/types";

export class ApiRequestError extends Error {
  constructor(public status: number, public body: ApiError) {
    super(body.message);
  }
}

function getToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem("sb_token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new ApiRequestError(res.status, (await res.json()) as ApiError);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
