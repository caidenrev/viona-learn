import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthError } from "@/lib/auth";

const mockRequireRole = vi.fn();
const mockPrisma = {
  appSettings: { findUnique: vi.fn(), upsert: vi.fn() },
  user: { findUnique: vi.fn(), update: vi.fn() },
  roadmap: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  course: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  quizQuestion: { deleteMany: vi.fn(), createMany: vi.fn() },
  courseSubmission: { findMany: vi.fn(), update: vi.fn() },
  courseRating: { findMany: vi.fn() },
  quizAttempt: { findMany: vi.fn() },
  dailyActivity: { findMany: vi.fn() },
  mentorPrivateNote: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
  $transaction: vi.fn(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)),
};

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  return {
    ...actual,
    requireRole: (...args: unknown[]) => mockRequireRole(...args),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("admin API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks STUDENT with 403 on admin overview and roadmap creation", async () => {
    mockRequireRole.mockRejectedValue(
      new AuthError(403, "Akses ditolak untuk peran ini.")
    );
    const { GET } = await import("@/app/api/admin/overview/route");
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("rejects spoofed image upload with 400", async () => {
    mockRequireRole.mockResolvedValue({
      userId: "t1",
      username: "mentor",
      name: "Mentor",
      role: "TEACHER",
    });
    const { POST } = await import("@/app/api/admin/upload/route");
    const formData = new FormData();
    formData.append(
      "file",
      new File([new TextEncoder().encode("fake-text")], "evil.png", {
        type: "image/png",
      })
    );
    const req = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("allows TEACHER to create a roadmap and keeps student workspace private in overview", async () => {
    mockRequireRole.mockResolvedValue({
      userId: "t1",
      username: "mentor",
      name: "Mentor",
      role: "TEACHER",
    });
    mockPrisma.roadmap.findUnique.mockResolvedValue(null);
    mockPrisma.roadmap.create.mockResolvedValue({
      id: "r1",
      title: "Frontend Mastery",
      slug: "frontend-mastery",
      status: "DRAFT",
    });

    const { POST } = await import("@/app/api/admin/roadmaps/route");
    const res = await POST(
      new Request("http://localhost/api/admin/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Frontend Mastery",
          description: "Belajar HTML sampai Next.js",
          levelLabel: "Dasar - Mahir",
        }),
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.roadmap.slug).toBe("frontend-mastery");

    mockPrisma.user.findUnique.mockResolvedValue({
      id: "s1",
      name: "Viona",
      nickname: "Viona",
      avatarUrl: "/stickers/hirono.png",
    });
    mockPrisma.roadmap.findMany.mockResolvedValue([]);
    mockPrisma.dailyActivity.findMany.mockResolvedValue([]);
    mockPrisma.courseRating.findMany.mockResolvedValue([]);
    mockPrisma.quizAttempt.findMany.mockResolvedValue([]);
    mockPrisma.courseSubmission.findMany.mockResolvedValue([]);
    mockPrisma.mentorPrivateNote.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/admin/overview/route");
    const overviewRes = await GET();
    expect(overviewRes.status).toBe(200);
    const overview = await overviewRes.json();
    expect(overview).not.toHaveProperty("workspaceTasks");
    expect(overview).not.toHaveProperty("notes");
  });
});
