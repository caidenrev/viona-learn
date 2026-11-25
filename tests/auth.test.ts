import { describe, it, expect, beforeAll } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  assertRole,
  AuthError,
} from "@/lib/auth";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-key-at-least-32-characters-long";
});

describe("auth and role guards", () => {
  it("hashes and verifies passwords accurately", async () => {
    const hash = await hashPassword("viona-secret-123");
    expect(hash).not.toBe("viona-secret-123");
    expect(await verifyPassword("viona-secret-123", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("signs and verifies JWT session tokens and rejects tampered tokens", async () => {
    const token = await signSessionToken({
      userId: "user_1",
      username: "viona",
      name: "Viona",
      role: "STUDENT",
    });

    const verified = await verifySessionToken(token);
    expect(verified).toEqual({
      userId: "user_1",
      username: "viona",
      name: "Viona",
      role: "STUDENT",
    });

    const tampered = `${token.slice(0, -4)}xxxx`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("enforces role boundaries via assertRole", () => {
    expect(() => assertRole(null, "TEACHER")).toThrowError(AuthError);
    try {
      assertRole(null, "TEACHER");
    } catch (err) {
      expect((err as AuthError).status).toBe(401);
    }

    try {
      assertRole(
        { userId: "s1", username: "viona", name: "Viona", role: "STUDENT" },
        "TEACHER"
      );
      expect.unreachable("Expected 403 error");
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError);
      expect((err as AuthError).status).toBe(403);
    }

    const teacher = assertRole(
      { userId: "t1", username: "mentor", name: "Mentor", role: "TEACHER" },
      "TEACHER"
    );
    expect(teacher.role).toBe("TEACHER");
  });
});
