import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
  type UserRole,
} from "@/lib/session-token";

export {
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
  type UserRole,
};

export class AuthError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.status = status;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function assertRole(
  session: SessionPayload | null,
  role?: UserRole
): SessionPayload {
  if (!session) {
    throw new AuthError(401, "Silakan masuk terlebih dahulu.");
  }
  if (role && session.role !== role) {
    throw new AuthError(403, "Akses ditolak untuk peran ini.");
  }
  return session;
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireRole(role?: UserRole): Promise<SessionPayload> {
  const session = await getSessionUser();
  return assertRole(session, role);
}
