import { faker } from "@faker-js/faker";
import { http } from "msw";

import { endpoints } from "@/lib/api/endpoints";
import {
  delay,
  fail,
  ok,
  requireAuth,
  unauthorized,
} from "@/mocks/helpers";
import {
  findCredsByUserId,
  findUserByEmail,
  findUserById,
  getDB,
  issueToken,
  logAudit,
  persist,
  revokeToken,
} from "@/mocks/db";
import type { Session, User } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const url = (path: string) => `${BASE}${path}`;

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/* ────────────────────── Register / verify / login ────────────────────── */

export const authHandlers = [
  http.post(url(endpoints.register), async ({ request }) => {
    await delay();
    const body = (await request.json()) as {
      fullName: string;
      email: string;
      phone: string;
      country: string;
      password: string;
    };

    if (findUserByEmail(body.email)) {
      return fail("That email is already registered", "EMAIL_TAKEN", 409, {
        email: "An account with this email already exists",
      });
    }

    const db = getDB();
    const id = `usr_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`;
    const verificationToken = faker.string.numeric({ length: 6 });

    const user: User = {
      id,
      email: body.email.toLowerCase(),
      fullName: body.fullName,
      phone: body.phone,
      country: body.country,
      role: "USER",
      status: "PENDING",
      twoFactorEnabled: false,
      hasTransactionPin: false,
      accountNumber: faker.string.numeric({ length: 10 }),
      balance: 0,
      currency: "USD",
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    db.credentials.push({
      userId: id,
      passwordHash: body.password,
      failedAttempts: 0,
      emailVerificationToken: verificationToken,
    });
    persist();

    // Dev convenience: log the verification code so testers don't dig through mock state
    // eslint-disable-next-line no-console
    console.info(
      `📧 [mock email] Verification code for ${user.email}: ${verificationToken} (or use 123456)`,
    );

    return ok({
      message: "Account created. Enter the code we sent to verify your email.",
    });
  }),

  http.post(url(endpoints.verifyEmail), async ({ request }) => {
    await delay();
    const { email, code } = (await request.json()) as { email: string; code: string };
    const user = findUserByEmail(email);
    if (!user) return fail("No account for that email", "NOT_FOUND", 404);
    const db = getDB();
    const creds = db.credentials.find((c) => c.userId === user.id);
    if (!creds) return fail("Account state invalid", "NOT_FOUND", 404);

    // Demo shortcut + stored code both accepted
    const valid = code === "123456" || creds.emailVerificationToken === code;
    if (!valid) return fail("Invalid or expired code", "INVALID_CODE", 400);

    user.status = "ACTIVE";
    creds.emailVerificationToken = undefined;
    const authToken = issueToken(user.id);
    persist();
    return ok({ user, token: authToken });
  }),

  http.post(url(endpoints.login), async ({ request }) => {
    await delay();
    const body = (await request.json()) as { email: string; password: string };
    const user = findUserByEmail(body.email);
    const creds = user ? findCredsByUserId(user.id) : undefined;

    // Constant-ish response timing for non-existent users — don't leak existence
    if (!user || !creds) {
      return fail("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    if (creds.lockedUntil && new Date(creds.lockedUntil).getTime() > Date.now()) {
      return fail(
        "Account temporarily locked due to repeated failed attempts. Try again later.",
        "ACCOUNT_LOCKED",
        423,
      );
    }

    if (creds.passwordHash !== body.password) {
      creds.failedAttempts += 1;
      if (creds.failedAttempts >= LOCKOUT_THRESHOLD) {
        creds.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      }
      persist();
      return fail("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    if (user.status === "PENDING") {
      return fail("Please verify your email first", "EMAIL_NOT_VERIFIED", 403);
    }
    if (user.status === "SUSPENDED") {
      return fail("This account has been suspended", "ACCOUNT_SUSPENDED", 403);
    }

    creds.failedAttempts = 0;
    creds.lockedUntil = undefined;
    persist();

    // If 2FA is enabled, issue a partial token and demand the second factor
    if (user.twoFactorEnabled) {
      const partial = `2fa_${faker.string.alphanumeric({ length: 20 })}`;
      // Stash a short-lived 2FA challenge alongside the user (kept simple here)
      getDB().tokens.push({
        token: partial,
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      });
      persist();
      return ok({ requires2FA: true, challengeToken: partial });
    }

    user.lastLoginAt = new Date().toISOString();
    const token = issueToken(user.id);

    // Track this login as a session
    getDB().sessions.push(makeSession(user.id, request, true));
    persist();

    return ok({ user, token });
  }),

  http.post(url(endpoints.twoFactorVerify), async ({ request }) => {
    await delay();
    const body = (await request.json()) as { challengeToken: string; code: string };
    const db = getDB();
    const challenge = db.tokens.find((t) => t.token === body.challengeToken);
    if (!challenge) return fail("Invalid challenge", "INVALID_TOKEN", 401);

    const user = findUserById(challenge.userId);
    const creds = user ? findCredsByUserId(user.id) : undefined;
    if (!user || !creds) return unauthorized();

    // Mock TOTP — accept "123456" or any current recoveryCode
    const isValid =
      body.code === "123456" ||
      (creds.recoveryCodes?.includes(body.code) ?? false);
    if (!isValid) return fail("Invalid 2FA code", "INVALID_CODE", 401);

    if (creds.recoveryCodes?.includes(body.code)) {
      creds.recoveryCodes = creds.recoveryCodes.filter((c) => c !== body.code);
    }

    // Burn the challenge, issue a real token
    db.tokens = db.tokens.filter((t) => t.token !== body.challengeToken);
    const token = issueToken(user.id);
    user.lastLoginAt = new Date().toISOString();
    db.sessions.push(makeSession(user.id, request, true));
    persist();
    return ok({ user, token });
  }),

  /* ────────────────────────── Password flows ────────────────────────── */

  http.post(url(endpoints.forgotPassword), async ({ request }) => {
    await delay();
    const { email } = (await request.json()) as { email: string };
    const user = findUserByEmail(email);
    if (user) {
      const creds = findCredsByUserId(user.id);
      if (creds) {
        creds.passwordResetToken = faker.string.alphanumeric({ length: 32 });
        creds.passwordResetExpiresAt = new Date(Date.now() + 30 * 60_000).toISOString();
        persist();
        // eslint-disable-next-line no-console
        console.info(
          `📧 [mock email] Reset ${user.email}: /reset-password?token=${creds.passwordResetToken}`,
        );
      }
    }
    // Always return success — don't leak account existence
    return ok({ message: "If that email exists, a reset link has been sent." });
  }),

  http.post(url(endpoints.resetPassword), async ({ request }) => {
    await delay();
    const body = (await request.json()) as { token: string; password: string };
    const db = getDB();
    const creds = db.credentials.find((c) => c.passwordResetToken === body.token);
    if (
      !creds ||
      !creds.passwordResetExpiresAt ||
      new Date(creds.passwordResetExpiresAt).getTime() < Date.now()
    ) {
      return fail("Invalid or expired reset link", "INVALID_TOKEN", 400);
    }
    creds.passwordHash = body.password;
    creds.passwordResetToken = undefined;
    creds.passwordResetExpiresAt = undefined;
    // Invalidate all existing tokens / sessions for this user
    db.tokens = db.tokens.filter((t) => t.userId !== creds.userId);
    db.sessions = db.sessions.filter((s) => !s.id.startsWith(`${creds.userId}_`));
    persist();
    return ok({ message: "Password updated. Please sign in." });
  }),

  http.post(url(endpoints.changePassword), async ({ request }) => {
    await delay();
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const body = (await request.json()) as { currentPassword: string; newPassword: string };
    const creds = findCredsByUserId(user.id);
    if (!creds) return unauthorized();
    if (creds.passwordHash !== body.currentPassword) {
      return fail("Current password is incorrect", "INVALID_CREDENTIALS", 400, {
        currentPassword: "Incorrect password",
      });
    }
    creds.passwordHash = body.newPassword;
    persist();
    return ok({ message: "Password changed" });
  }),

  /* ────────────────────────── Current user ────────────────────────── */

  http.get(url(endpoints.me), async ({ request }) => {
    await delay(80);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    return ok(result);
  }),

  http.post(url(endpoints.logout), async ({ request }) => {
    const header = request.headers.get("Authorization");
    if (header?.startsWith("Bearer ")) revokeToken(header.slice(7).trim());
    return ok({ ok: true });
  }),

  /* ────────────────────────── 2FA setup ────────────────────────── */

  http.post(url(endpoints.twoFactorSetup), async ({ request }) => {
    await delay();
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const creds = findCredsByUserId(user.id);
    if (!creds) return unauthorized();

    // Mock TOTP secret + recovery codes
    creds.twoFactorSecret = faker.string.alphanumeric({ length: 32, casing: "upper" });
    creds.recoveryCodes = Array.from({ length: 8 }, () =>
      faker.string.alphanumeric({ length: 10, casing: "lower" }),
    );
    persist();

    const otpauth = `otpauth://totp/Vaultline:${encodeURIComponent(user.email)}?secret=${creds.twoFactorSecret}&issuer=Vaultline`;
    return ok({
      secret: creds.twoFactorSecret,
      otpauth,
      recoveryCodes: creds.recoveryCodes,
    });
  }),

  // Confirm 2FA enrollment after user enters the first valid code
  http.post(url("/auth/2fa/confirm"), async ({ request }) => {
    await delay();
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const { code } = (await request.json()) as { code: string };
    if (code !== "123456") return fail("Invalid code", "INVALID_CODE", 400);
    user.twoFactorEnabled = true;
    persist();
    logAudit({
      actorId: user.id,
      actorName: user.fullName,
      action: "2FA_ENABLED",
    });
    return ok({ user });
  }),

  http.post(url(endpoints.twoFactorDisable), async ({ request }) => {
    await delay();
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const body = (await request.json()) as { password: string };
    const creds = findCredsByUserId(user.id);
    if (!creds || creds.passwordHash !== body.password) {
      return fail("Password incorrect", "INVALID_CREDENTIALS", 400, {
        password: "Incorrect password",
      });
    }
    user.twoFactorEnabled = false;
    creds.twoFactorSecret = undefined;
    creds.recoveryCodes = undefined;
    persist();
    return ok({ user });
  }),

  /* ────────────────────────── Transaction PIN ────────────────────────── */

  http.post(url(endpoints.setPin), async ({ request }) => {
    await delay();
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const { pin } = (await request.json()) as { pin: string };
    const creds = findCredsByUserId(user.id);
    if (!creds) return unauthorized();
    creds.pinHash = pin;
    user.hasTransactionPin = true;
    persist();
    return ok({ user });
  }),

  http.post(url(endpoints.verifyPin), async ({ request }) => {
    await delay(80);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const { pin } = (await request.json()) as { pin: string };
    const creds = findCredsByUserId(user.id);
    if (!creds || creds.pinHash !== pin) {
      return fail("Invalid PIN", "INVALID_PIN", 400, { pin: "Incorrect PIN" });
    }
    return ok({ ok: true });
  }),

  /* ────────────────────────── Sessions ────────────────────────── */

  http.get(url(endpoints.sessions), async ({ request }) => {
    await delay(100);
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const db = getDB();
    const sessions = db.sessions.filter((s) => s.id.startsWith(`${user.id}_`));
    // Ensure a "current" session exists for the active token
    if (sessions.length === 0) {
      db.sessions.push(makeSession(user.id, request, true));
      persist();
    }
    return ok(
      db.sessions.filter((s) => s.id.startsWith(`${user.id}_`)),
    );
  }),

  http.delete(url("/users/sessions/:id"), async ({ request, params }) => {
    await delay();
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const db = getDB();
    const id = String(params.id);
    if (id === "all") {
      db.sessions = db.sessions.filter((s) => !s.id.startsWith(`${user.id}_`) || s.current);
    } else {
      db.sessions = db.sessions.filter((s) => s.id !== id);
    }
    persist();
    return ok({ ok: true });
  }),
];

function makeSession(userId: string, request: Request, current: boolean): Session {
  const ua = request.headers.get("User-Agent") ?? "Unknown device";
  const device = parseDevice(ua);
  return {
    id: `${userId}_${faker.string.alphanumeric({ length: 10, casing: "lower" })}`,
    device,
    ip: faker.internet.ipv4(),
    location: `${faker.location.city()}, ${faker.location.country()}`,
    lastActiveAt: new Date().toISOString(),
    current,
  };
}

function parseDevice(ua: string): string {
  if (/iphone/i.test(ua)) return "iPhone";
  if (/android/i.test(ua)) return "Android device";
  if (/mac os x/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows PC";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown device";
}
