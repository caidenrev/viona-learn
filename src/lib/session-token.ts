import { SignJWT, jwtVerify } from "jose";

export type UserRole = "TEACHER" | "STUDENT";

export interface SessionPayload {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
}

export const SESSION_COOKIE_NAME = "viona_session";

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "dev-only-viona-learn-room-secret-key-32chars");
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    username: payload.username,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "TEACHER" && payload.role !== "STUDENT")
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
