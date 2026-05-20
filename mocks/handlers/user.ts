import { http } from "msw";

import { endpoints } from "@/lib/api/endpoints";
import { delay, fail, ok, requireAuth } from "@/mocks/helpers";
import { findUserById, persist } from "@/mocks/db";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const url = (path: string) => `${BASE}${path}`;

export const userHandlers = [
  http.patch(url(endpoints.userUpdate), async ({ request }) => {
    await delay();
    const result = requireAuth(request);
    if (result instanceof Response) return result;
    const user = result;
    const body = (await request.json()) as Partial<{
      fullName: string;
      phone: string;
      country: string;
      avatarUrl: string;
    }>;

    const live = findUserById(user.id);
    if (!live) return fail("User missing", "NOT_FOUND", 404);

    if (body.fullName !== undefined) live.fullName = body.fullName;
    if (body.phone !== undefined) live.phone = body.phone;
    if (body.country !== undefined) live.country = body.country;
    if (body.avatarUrl !== undefined) live.avatarUrl = body.avatarUrl;
    persist();
    return ok(live);
  }),
];
