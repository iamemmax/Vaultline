import { HttpResponse, type JsonBodyType } from "msw";

import type { ApiErrorPayload, User } from "@/types";
import { findUserByToken } from "@/mocks/db";

/**
 * Helpers shared by every MSW handler. Keep responses uniform so the
 * shape stays identical when we swap to a real backend.
 */

export function ok<T extends JsonBodyType>(body: T, init: ResponseInit = {}) {
  return HttpResponse.json(body, { status: 200, ...init });
}

export function created<T extends JsonBodyType>(body: T) {
  return HttpResponse.json(body, { status: 201 });
}

export function noContent() {
  return new HttpResponse(null, { status: 204 });
}

export function fail(
  message: string,
  code: string,
  status = 400,
  fieldErrors?: Record<string, string>,
) {
  const payload: ApiErrorPayload = { message, code, fieldErrors };
  return HttpResponse.json(payload, { status });
}

export function unauthorized(message = "Authentication required") {
  return fail(message, "UNAUTHORIZED", 401);
}

export function forbidden(message = "Insufficient permissions") {
  return fail(message, "FORBIDDEN", 403);
}

export function notFound(message = "Not found") {
  return fail(message, "NOT_FOUND", 404);
}

/**
 * Resolve the user from the Authorization header. Returns null when
 * the request is anonymous or the token is invalid.
 */
export function authUser(request: Request): User | null {
  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  return findUserByToken(token) ?? null;
}

/** Throw if not authed. Use at the top of every protected handler. */
export function requireAuth(request: Request): User | Response {
  const user = authUser(request);
  if (!user) return unauthorized();
  return user;
}

export function requireAdmin(request: Request): User | Response {
  const user = authUser(request);
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();
  return user;
}

/** Realistic-feeling network jitter so loaders actually render. */
export function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 120));
}
