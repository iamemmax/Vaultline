import { getResponse } from "msw";

import { handlers } from "@/mocks/handlers";
import { ApiError, type ApiErrorPayload } from "@/types";

/**
 * The ONLY place that talks to the "network". This app has no real backend
 * — every request is dispatched in-process against the MSW handlers via
 * `getResponse(handlers, request)`. No Service Worker, no /api/* server
 * routes, identical behavior in dev and production.
 *
 * To wire up a real backend later: replace the `getResponse` call below
 * with `fetch(buildUrl(path, query), init)` and you're done. URLs, headers,
 * and error shapes stay identical.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

const AUTH_TOKEN_KEY = "ft.token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  // Mirror to a cookie so middleware can read role/auth state on edge.
  document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  /** Skip auth header attachment (used by public endpoints). */
  anonymous?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Absolute URL is required to construct a `Request`. In the browser we use
 * the current origin; on the server (build-time prerender) we use a stable
 * placeholder — MSW handlers only care about the path + query.
 */
function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://local.mock";
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, signal, anonymous = false } = opts;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!anonymous) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const request = new Request(absoluteUrl(buildUrl(path, query)), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const mocked = await getResponse(handlers, request);
  const response =
    mocked ??
    new Response(
      JSON.stringify({ message: "No handler for this request", code: "NO_HANDLER" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );

  // 204 No Content
  if (response.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const errorPayload: ApiErrorPayload = {
      message:
        (payload as { message?: string } | null)?.message ??
        response.statusText ??
        "Request failed",
      code: (payload as { code?: string } | null)?.code ?? "UNKNOWN",
      fieldErrors: (payload as { fieldErrors?: Record<string, string> } | null)
        ?.fieldErrors,
    };
    throw new ApiError(errorPayload, response.status);
  }

  return payload as T;
}

/** Convenience verbs */
export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};
